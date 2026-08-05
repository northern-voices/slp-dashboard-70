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

type ViewState = 'locked' | 'verifying' | 'unlocked'

const REPORT_VIEWS: Record<string, ComponentType<{ data: never }>> = {
  speech_screening_report: StudentSpeechReportView,
  goal_sheet: SpeechGoalSheetView,
  progress_report: SpeechProgressReportView,
  monthly_meeting_report: MonthlyMeetingReportView,
}

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

const PDF_GENERATORS: Record<string, (reportData: unknown) => Promise<Blob>> = {
  speech_screening_report: generateSpeechScreeningPdf,
  goal_sheet: generateGoalSheetPdf,
  progress_report: generateProgressReportPdf,
  monthly_meeting_report: generateMonthlyMeetingReportPdf,
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

    try {
      const blob = await generator(reportData)
      const url = URL.createObjectURL(blob)
      const studentName = (reportData as { context?: { student_name?: string } })?.context
        ?.student_name

      const link = document.createElement('a')
      link.href = url
      link.download = `${studentName ?? 'Student'} - NVSS Student Report.pdf`
      link.click()
      URL.revokeObjectURL(url)
    } catch (err) {
      console.error('Failed to generate PDF:', err)
    } finally {
      setIsGeneratingPdf(false)
    }
  }

  if (state === 'unlocked') {
    const ReportView = reportType ? REPORT_VIEWS[reportType] : undefined

    return (
      <div className='min-h-screen bg-gray-50 py-8 px-4'>
        <div className='max-w-3xl mx-auto space-y-4'>
          <div className='flex justify-end'>
            <Button onClick={handleDownloadPdf} variant='outline' disabled={isGeneratingPdf}>
              <Download className='w-4 h-4 mr-2' />
              {isGeneratingPdf ? 'Generating PDF...' : 'Download / Print PDF'}
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
    <div className='min-h-screen bg-gray-50 flex items-center justify-center px-4'>
      <div className='max-w-sm w-full bg-white rounded-lg shadow p-8 space-y-6'>
        <div className='flex flex-col items-center text-center space-y-2'>
          <Lock className='w-8 h-8 text-gray-400' />
          <h1 className='text-lg font-medium text-gray-900'>Password Protected Report</h1>
          <p className='text-sm text-gray-500'>
            Enter the password provided to you to view this report.
          </p>
        </div>

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
          <div className='flex items-start gap-2 text-sm text-red-600'>
            <AlertCircle className='w-4 h-4 mt-0.5 shrink-0' />
            <span>{errorMessage}</span>
          </div>
        )}

        <Button
          onClick={handleUnlock}
          disabled={!password || state === 'verifying'}
          className='w-full'>
          {state === 'verifying' ? 'Verifying...' : 'View Report'}
        </Button>
      </div>
    </div>
  )
}

export default ViewReport
