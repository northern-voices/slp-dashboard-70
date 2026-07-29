import { useRef, useState } from 'react'
import { useParams } from 'react-router-dom'
import { useReactToPrint } from 'react-to-print'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Lock, Eye, EyeOff, Download, AlertCircle } from 'lucide-react'
import StudentSpeechReportView from '@/components/reports/view/StudentSpeechReportView'
import GenericReportView from '@/components/reports/view/GenericReportView'

type ViewState = 'locked' | 'verifying' | 'unlocked'

const ViewReport = () => {
  const { token } = useParams<{ token: string }>()
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [state, setState] = useState<ViewState>('locked')
  const [errorMessage, setErrorMessage] = useState('')
  const [reportType, setReportType] = useState<string | null>(null)
  const [reportData, setReportData] = useState<unknown>(null)

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

  if (state === 'unlocked') {
    return (
      <div className='min-h-screen bg-gray-50 py-8 px-4'>
        <div className='max-w-3xl mx-auto space-y-4'>
          <div className='flex justify-end'>
            <Button onClick={handlePrint} variant='outline'>
              <Download className='w-4 h-4 mr-2' />
              Download / Print PDF
            </Button>
          </div>

          <div ref={printRef} className='bg-white rounded-lg shadow p-8'>
            {reportType === 'speech_screening_report' ? (
              <StudentSpeechReportView data={reportData as never} />
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
