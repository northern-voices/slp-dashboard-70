import React, { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Mail, Send, Loader2, CheckCircle, XCircle, BookOpen } from 'lucide-react'
import { Screening } from '@/types/database'
import { edgeFunctionsApi } from '@/api/edgeFunctions'
import { useAuth } from '@/contexts/AuthContext'
import { SPEECH_REPORT_OPTIONS } from '@/constants/reportOptions'

interface BulkSendReportsModalProps {
  isOpen: boolean
  onClose: () => void
  selectedScreenings: Screening[]
  onSend: (action: string) => void
}

const BulkSendReportsModal = ({
  isOpen,
  onClose,
  selectedScreenings,
  onSend,
}: BulkSendReportsModalProps) => {
  const { user } = useAuth()
  const [recipientEmail, setRecipientEmail] = useState('')
  const [selectedReports, setSelectedReports] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [progress, setProgress] = useState({ current: 0, total: 0 })
  const [showResult, setShowResult] = useState(false)
  const [resultType, setResultType] = useState<'success' | 'error'>('success')
  const [resultMessage, setResultMessage] = useState('')

  const isHearingOnly = selectedScreenings.every(s => s.source_table === 'hearing')

  // Pre-fill email with current user's email when modal opens
  useEffect(() => {
    if (isOpen && user?.email && !recipientEmail) {
      setRecipientEmail(user.email)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, user?.email])

  const handleSendReports = async () => {
    if (!recipientEmail || (!isHearingOnly && selectedReports.length === 0)) return

    setIsLoading(true)
    setProgress({ current: 0, total: selectedScreenings.length })

    let successCount = 0
    let failCount = 0

    for (let i = 0; i < selectedScreenings.length; i++) {
      const screening = selectedScreenings[i]
      setProgress({ current: i + 1, total: selectedScreenings.length })

      try {
        const isHearing = screening.source_table === 'hearing'

        if (isHearing) {
          await edgeFunctionsApi.generateHearingReport(screening.id, recipientEmail)
        } else {
          for (const reportType of selectedReports) {
            if (reportType === 'initial-speech-report') {
              await edgeFunctionsApi.sendStudentReport(screening.id, recipientEmail)
            } else if (reportType === 'initial-goal-sheet') {
              await edgeFunctionsApi.studentGoalSheet(screening.id, recipientEmail)
            } else if (reportType === 'progress-speech-report') {
              await edgeFunctionsApi.studentProgressReport(screening.id, recipientEmail)
            }
          }
        }

        successCount++
      } catch (error) {
        console.error(`Failed to send report for screening ${screening.id}:`, error)

        failCount++
      }
    }

    setIsLoading(false)

    if (failCount === 0) {
      setResultType('success')
      setResultMessage(`Successfully sent reports for ${successCount} screening(s) to
  ${recipientEmail}`)
    } else {
      setResultType('error')
      setResultMessage(`Sent ${successCount} report(s), failed ${failCount}`)
    }
    setShowResult(true)
  }

  const handleClose = () => {
    setRecipientEmail('')
    setSelectedReports([])
    setShowResult(false)
    onClose()
  }

  const handleResultClose = () => {
    setShowResult(false)
    onSend('email')
    handleClose()
  }

  if (showResult) {
    return (
      <Dialog open={isOpen} onOpenChange={() => {}}>
        <DialogContent className='mx-auto'>
          <div className='flex flex-col items-center text-center space-y-6'>
            {/* Icon */}
            <div className='flex justify-center'>
              {resultType === 'success' ? (
                <CheckCircle className='w-16 h-16 text-green-600' />
              ) : (
                <XCircle className='w-16 h-16 text-red-600' />
              )}
            </div>

            {/* Title and Description */}
            <div className='space-y-2'>
              <DialogTitle className='text-2xl font-semibold text-gray-900'>
                {resultType === 'success' ? 'Reports Sent Successfully!' : 'Error Sending Reports'}
              </DialogTitle>
              <DialogDescription className='text-gray-600 text-base leading-relaxed'>
                {resultMessage}
              </DialogDescription>
            </div>

            {/* Action Button */}
            <div className='flex flex-col sm:flex-row gap-3 w-full sm:w-auto'>
              <Button
                onClick={handleResultClose}
                className='w-full sm:w-auto bg-primary hover:bg-primary/90 text-primary-foreground px-6 py-2'>
                {resultType === 'success' ? 'Done' : 'Try Again'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className='max-w-4xl max-h-[90vh] overflow-y-auto'>
        <DialogHeader>
          <DialogTitle className='text-xl font-medium text-gray-700 flex items-center gap-2'>
            <Mail className='w-5 h-5' />
            Send Reports for {selectedScreenings.length} Screening
            {selectedScreenings.length !== 1 ? 's' : ''}
          </DialogTitle>
        </DialogHeader>

        <div className='space-y-4'>
          {/* Report Type Selection - only for speech screenings */}
          {!isHearingOnly && (
            <div className='space-y-3'>
              <Label className='text-sm font-medium'>Select Type of Report</Label>
              <div className='grid grid-cols-1 md:grid-cols-2 gap-3'>
                {SPEECH_REPORT_OPTIONS.map(report => {
                  const Icon = report.icon
                  const isSelected = selectedReports.includes(report.value)
                  return (
                    <div
                      key={report.value}
                      onClick={() => {
                        if (isSelected) {
                          setSelectedReports(selectedReports.filter(r => r !== report.value))
                        } else {
                          setSelectedReports([...selectedReports, report.value])
                        }
                      }}
                      className={`
                          relative cursor-pointer rounded-lg border-2 p-4 transition-all duration-200 w-full ${
                            isSelected
                              ? 'border-blue-600 bg-blue-50 shadow-sm'
                              : 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50'
                          }
                        `}>
                      <div className='flex items-start space-x-3 w-full'>
                        <div
                          className={`
                            flex-shrink-0 p-2 rounded-lg
                            ${isSelected ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600'}
                          `}>
                          <Icon className='w-4 h-4' />
                        </div>
                        <div className='flex-1 min-w-0 overflow-hidden'>
                          <h3
                            className={`
                              text-sm font-medium leading-tight truncate
                              ${isSelected ? 'text-blue-900' : 'text-gray-900'}
                            `}>
                            {report.label}
                          </h3>
                          <p
                            className={`
                              text-xs mt-1 leading-tight
                              ${isSelected ? 'text-blue-700' : 'text-gray-500'}
                            `}>
                            {report.description}
                          </p>
                        </div>
                      </div>
                      {isSelected && (
                        <div className='absolute top-2 right-2'>
                          <div className='w-2 h-2 bg-blue-600 rounded-full'></div>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* Info for hearing screenings */}
          {isHearingOnly && (
            <div className='space-y-3'>
              <Label className='text-sm font-medium'>Report Type</Label>
              <div className='grid grid-cols-1 md:grid-cols-2 gap-3'>
                <div className='relative cursor-default rounded-lg border-2 p-4 transition-all duration-200 w-full border-blue-600 bg-blue-50 shadow-sm'>
                  <div className='flex items-start space-x-3 w-full'>
                    <div className='flex-shrink-0 p-2 rounded-lg bg-blue-600 text-white'>
                      <BookOpen className='w-4 h-4' />
                    </div>
                    <div className='flex-1 min-w-0 overflow-hidden'>
                      <h3 className='text-sm font-medium leading-tight truncate text-blue-900'>
                        Hearing Screening Report
                      </h3>
                      <p className='text-xs mt-1 leading-tight text-blue-700'>
                        Detailed hearing screening assessment and results overview
                      </p>
                    </div>
                  </div>
                  <div className='absolute top-2 right-2'>
                    <div className='w-2 h-2 bg-blue-600 rounded-full'></div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Email Input */}
          <div className='space-y-3'>
            <div className='space-y-1'>
              <Label htmlFor='bulk-email' className='text-sm font-medium'>
                Recipient Email
              </Label>
              <Input
                id='bulk-email'
                type='email'
                placeholder='Enter recipient email address'
                value={recipientEmail}
                onChange={e => setRecipientEmail(e.target.value)}
                className='h-12'
              />
            </div>
          </div>

          {/* Progress */}
          {isLoading && (
            <div className='text-sm text-gray-600'>
              Sending {progress.current} of {progress.total}...
            </div>
          )}

          {/* Send Button */}
          <div className='mt-6'>
            <Button
              onClick={handleSendReports}
              variant='default'
              size='sm'
              className='w-full h-9 bg-blue-600 hover:bg-blue-700 text-white'
              disabled={
                !recipientEmail || (!isHearingOnly && selectedReports.length === 0) || isLoading
              }>
              {isLoading ? (
                <Loader2 className='w-4 h-4 mr-2 animate-spin' />
              ) : (
                <Send className='w-4 h-4 mr-2' />
              )}
              {isLoading ? `Sending ${progress.current}/${progress.total}...` : 'Send Reports'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default BulkSendReportsModal
