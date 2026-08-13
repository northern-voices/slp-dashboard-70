import { useRef, useState, type ComponentType } from 'react'
import { useParams } from 'react-router-dom'
import { useReactToPrint } from 'react-to-print'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Lock, Eye, EyeOff, Download, AlertCircle } from 'lucide-react'
import StudentSpeechReportView from '@/components/reports/view/StudentSpeechReportView'
import SpeechGoalSheetView from '@/components/reports/view/SpeechGoalSheetView'
import GenericReportView from '@/components/reports/view/GenericReportView'
import SpeechProgressReportView from '@/components/reports/view/SpeechProgressReportView'
import MonthlyMeetingReportView from '@/components/reports/view/MonthlyMeetingReportView'
import HearingScreenReportView from '@/components/reports/view/HearingScreenReportView'
import BulkReportView from '@/components/reports/view/BulkReportView'

type ViewState = 'locked' | 'verifying' | 'unlocked'

type PdfProgress = { current: number; total: number }
type PdfGenerator = (
  reportData: unknown,
  onProgress?: (current: number, total: number) => void
) => Promise<Blob>

const REPORT_VIEWS: Record<string, ComponentType<{ data: never }>> = {
  speech_screening_report: StudentSpeechReportView,
  goal_sheet: SpeechGoalSheetView,
  progress_report: SpeechProgressReportView,
  monthly_meeting_report: MonthlyMeetingReportView,
  hearing_screening_report: HearingScreenReportView,
  school_summary_report: BulkReportView,
  school_summary_hearing_report: BulkReportView,
  school_wide_hearing_reports: BulkReportView,
  school_wide_goal_sheets: BulkReportView,
  school_wide_progress_reports: BulkReportView,
  school_wide_speech_screening_reports: BulkReportView,
}

// Report types that download as a zip of individual student PDFs rather than one file.
const ZIP_REPORT_TYPES = new Set([
  'school_wide_hearing_reports',
  'school_wide_goal_sheets',
  'school_wide_progress_reports',
  'school_wide_speech_screening_reports',
])

const POSTER_ONLY_TEMPLATES = new Set(['Complex Needs', 'Non Registered No Consent'])

const generateSpeechScreeningPdf = async (reportData: unknown) => {
  const templateName = (reportData as { template?: { name?: string } })?.template?.name
  if (templateName && POSTER_ONLY_TEMPLATES.has(templateName)) {
    const posterBytes = await (await fetch('/teachspeech-app-poster.pdf')).arrayBuffer()
    return new Blob([posterBytes], { type: 'application/pdf' })
  }

  const [{ pdf }, { default: StudentSpeechReportPdf }, { PDFDocument }] = await Promise.all([
    import('@react-pdf/renderer'),
    import('@/components/reports/pdf/StudentSpeechReportPdf'),
    import('pdf-lib'),
  ])

  const mainBlob = await pdf(<StudentSpeechReportPdf data={reportData as never} />).toBlob()
  const mainBytes = await mainBlob.arrayBuffer()
  const posterBytes = await (await fetch('/teachspeech-app-poster.pdf')).arrayBuffer()

  const mainDoc = await PDFDocument.load(mainBytes)
  const posterDoc = await PDFDocument.load(posterBytes)
  const [posterPage] = await mainDoc.copyPages(posterDoc, [0])
  mainDoc.addPage(posterPage)

  const mergedBytes = await mainDoc.save()
  return new Blob([mergedBytes as BlobPart], { type: 'application/pdf' })
}

const generateGoalSheetPdf = async (reportData: unknown) => {
  const [{ pdf }, { default: SpeechGoalSheetPdf }] = await Promise.all([
    import('@react-pdf/renderer'),
    import('@/components/reports/pdf/SpeechGoalSheetPdf'),
  ])

  return pdf(<SpeechGoalSheetPdf data={reportData as never} />).toBlob()
}

const generateProgressReportPdf = async (reportData: unknown) => {
  const [{ pdf }, { default: SpeechProgressReportPdf }] = await Promise.all([
    import('@react-pdf/renderer'),
    import('@/components/reports/pdf/SpeechProgressReportPdf'),
  ])

  return pdf(<SpeechProgressReportPdf data={reportData as never} />).toBlob()
}

const generateMonthlyMeetingReportPdf = async (reportData: unknown) => {
  const [{ pdf }, { default: MonthlyMeetingReportPdf }] = await Promise.all([
    import('@react-pdf/renderer'),
    import('@/components/reports/pdf/MonthlyMeetingReportPdf'),
  ])

  return pdf(<MonthlyMeetingReportPdf data={reportData as never} />).toBlob()
}

const generateHearingScreenReportPdf = async (reportData: unknown) => {
  const [{ pdf }, { default: HearingScreenReportPdf }] = await Promise.all([
    import('@react-pdf/renderer'),
    import('@/components/reports/pdf/HearingScreenReportPdf'),
  ])

  return pdf(<HearingScreenReportPdf data={reportData as never} />).toBlob()
}

// school_summary_report / school_summary_hearing_report always carry exactly one
// document - no "per student" split applies, so this just renders that one document.
const generateSchoolSummaryPdf = async (reportData: unknown) => {
  const [{ pdf }, { default: BulkDocumentPdf }] = await Promise.all([
    import('@react-pdf/renderer'),
    import('@/components/reports/pdf/BulkDocumentPdf'),
  ])

  const documents = (reportData as { documents?: unknown[] })?.documents ?? []
  return pdf(<BulkDocumentPdf data={documents[0] as never} />).toBlob()
}

// Renders each document as its own PDF (applying the same poster-only short-circuit
// generateSpeechScreeningPdf uses, since BulkDocumentPdf's own dispatch has no case
// for the poster-only speech templates) and zips them, organized into the same
// grade-directory structure the backend already computes per document.
const generateBulkReportZip = async (
  reportData: unknown,
  onProgress?: (current: number, total: number) => void
) => {
  const [{ pdf }, { default: BulkDocumentPdf }, { default: JSZip }] = await Promise.all([
    import('@react-pdf/renderer'),
    import('@/components/reports/pdf/BulkDocumentPdf'),
    import('jszip'),
  ])

  const documents = (reportData as { documents?: unknown[] })?.documents ?? []
  const zip = new JSZip()
  let posterBytes: ArrayBuffer | null = null

  for (let i = 0; i < documents.length; i++) {
    onProgress?.(i + 1, documents.length)

    const doc = documents[i] as {
      metadata?: { file_name?: string; directory?: string }
      template?: { name?: string }
    }
    const templateName = doc.template?.name

    let docBytes: ArrayBuffer
    if (templateName && POSTER_ONLY_TEMPLATES.has(templateName)) {
      if (!posterBytes) {
        posterBytes = await (await fetch('/teachspeech-app-poster.pdf')).arrayBuffer()
      }
      docBytes = posterBytes
    } else {
      const docBlob = await pdf(<BulkDocumentPdf data={documents[i] as never} />).toBlob()
      docBytes = await docBlob.arrayBuffer()
    }

    const fileName = doc.metadata?.file_name || `document-${i + 1}`
    const directory = doc.metadata?.directory
    const path = directory ? `${directory}/${fileName}.pdf` : `${fileName}.pdf`

    zip.file(path, docBytes)
  }

  return zip.generateAsync({ type: 'blob' })
}

const PDF_GENERATORS: Record<string, PdfGenerator> = {
  speech_screening_report: generateSpeechScreeningPdf,
  goal_sheet: generateGoalSheetPdf,
  progress_report: generateProgressReportPdf,
  monthly_meeting_report: generateMonthlyMeetingReportPdf,
  hearing_screening_report: generateHearingScreenReportPdf,
  school_summary_report: generateSchoolSummaryPdf,
  school_summary_hearing_report: generateSchoolSummaryPdf,
  school_wide_hearing_reports: generateBulkReportZip,
  school_wide_goal_sheets: generateBulkReportZip,
  school_wide_progress_reports: generateBulkReportZip,
  school_wide_speech_screening_reports: generateBulkReportZip,
}

const ViewReport = () => {
  const { token } = useParams<{ token: string }>()
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [state, setState] = useState<ViewState>('locked')
  const [errorMessage, setErrorMessage] = useState('')
  const [reportType, setReportType] = useState<string | null>(null)
  const [reportData, setReportData] = useState<unknown>(null)
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false)
  const [pdfProgress, setPdfProgress] = useState<PdfProgress | null>(null)

  const printRef = useRef<HTMLDivElement>(null)
  const handlePrint = useReactToPrint({ contentRef: printRef, documentTitle: 'Report' })

  const handleUnlock = async () => {
    if (!token || !password) return

    setState('verifying')
    setErrorMessage('')

    try {
      const { data, error } = await supabase.functions.invoke('verify-report-token', {
        body: { token, password },
      })

      if (error) throw error

      if (!data?.success) {
        const message =
          data?.error === 'expired'
            ? 'This link has expired.'
            : data?.error === 'locked'
              ? 'Too many incorrect attempts. This link is now locked - ask the sender for a new one.'
              : 'Incorrect password. Please try again.'

        setErrorMessage(message)
        setState('locked')
        return
      }

      setReportType(data.report_type)
      setReportData(data.report_data)
      setState('unlocked')
    } catch (err) {
      console.error('Failed to verify report token:', err)
      setErrorMessage('Something went wrong. Please try again.')
      setState('locked')
    }
  }

  const handleDownloadPdf = async () => {
    const generator = reportType ? PDF_GENERATORS[reportType] : undefined
    if (!generator) {
      handlePrint()
      return
    }

    setIsGeneratingPdf(true)
    setPdfProgress(null)

    try {
      const blob = await generator(reportData, (current, total) =>
        setPdfProgress({ current, total })
      )
      const url = URL.createObjectURL(blob)
      const studentName = (reportData as { context?: { student_name?: string } })?.context
        ?.student_name
      const schoolName = (reportData as { school_name?: string })?.school_name
      const academicYear = (reportData as { academic_year?: string })?.academic_year
      const extension = blob.type === 'application/zip' ? 'zip' : 'pdf'

      const downloadName = studentName
        ? `${studentName} - NVSS Student Report.${extension}`
        : schoolName
          ? `${schoolName}${academicYear ? ` - ${academicYear}` : ''} - NVSS Reports.${extension}`
          : `NVSS Report.${extension}`

      const link = document.createElement('a')
      link.href = url
      link.download = downloadName
      link.click()
      URL.revokeObjectURL(url)
    } catch (err) {
      console.error('Failed to generate PDF:', err)
    } finally {
      setIsGeneratingPdf(false)
      setPdfProgress(null)
    }
  }

  if (state === 'unlocked') {
    const ReportView = reportType ? REPORT_VIEWS[reportType] : undefined
    const isZipDownload = reportType ? ZIP_REPORT_TYPES.has(reportType) : false

    return (
      <div className='min-h-screen bg-gray-50 py-8 px-4'>
        <div className='max-w-3xl mx-auto space-y-4'>
          <div className='flex justify-end'>
            <Button onClick={handleDownloadPdf} variant='outline' disabled={isGeneratingPdf}>
              <Download className='w-4 h-4 mr-2' />
              {isGeneratingPdf
                ? pdfProgress
                  ? `Generating ${pdfProgress.current}/${pdfProgress.total}...`
                  : 'Generating PDF...'
                : isZipDownload
                  ? 'Download Reports (ZIP)'
                  : 'Download / Print PDF'}
            </Button>
          </div>

          <div ref={printRef} className={ReportView ? '' : 'bg-white rounded-lg shadow p-8'}>
            {ReportView ? (
              <ReportView data={reportData as never} />
            ) : (
              <GenericReportView reportType={reportType} data={reportData} />
            )}
          </div>
        </div>
      </div>
    )
  }
  return (
    <div className='min-h-screen bg-[#f4f6f9] flex flex-col items-center justify-center px-4 py-10'>
      <div className='w-full max-w-[420px]'>
        <div className='text-center mb-6'>
          <span className='text-xl font-bold tracking-tight text-gray-900'>
            Northern Voices Speech Services
          </span>
        </div>

        <div className='bg-white rounded-xl shadow-[0_1px_3px_rgba(0,0,0,0.08)] px-9 py-10'>
          <div className='flex justify-center mb-6'>
            <div className='bg-[#EEF4FF] rounded-full p-3.5'>
              <Lock className='w-6 h-6 text-[#005AE0]' />
            </div>
          </div>

          <h1 className='text-[22px] font-bold text-gray-900 text-center mb-2'>
            Password Protected Report
          </h1>
          <p className='text-[15px] text-gray-500 text-center leading-relaxed mb-8'>
            Enter the password provided to you to view this report.
          </p>

          <div className='space-y-2'>
            <Label htmlFor='report-password'>Password</Label>
            <div className='relative'>
              <Input
                id='report-password'
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleUnlock()}
                autoFocus
              />

              <button
                type='button'
                onClick={() => setShowPassword(!showPassword)}
                className='absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground'>
                {showPassword ? <EyeOff className='w-4 h-4' /> : <Eye className='w-4 h-4' />}
              </button>
            </div>
          </div>

          {errorMessage && (
            <div className='flex items-start gap-2 text-sm text-red-600 mt-3'>
              <AlertCircle className='w-4 h-4 mt-0.5 shrink-0' />
              <span>{errorMessage}</span>
            </div>
          )}

          <Button
            onClick={handleUnlock}
            disabled={!password || state === 'verifying'}
            className='w-full mt-6 h-11 rounded-lg bg-[#005AE0] font-semibold text-white hover:bg-[#0047b3]'>
            {state === 'verifying' ? 'Verifying...' : 'View Report'}
          </Button>

          <p className='text-[13px] text-gray-400 text-center leading-relaxed mt-8'>
            If you weren't expecting this, you can safely ignore this email.
          </p>
        </div>

        <p className='text-center text-xs text-gray-400 mt-6'>
          &copy; {new Date().getFullYear()} Northern Voices. All rights reserved.
        </p>
      </div>
    </div>
  )
}

export default ViewReport
