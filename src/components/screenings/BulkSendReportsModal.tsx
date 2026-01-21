import React, { useState } from 'react'
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
import { Mail, Send, Loader2, CheckCircle, XCircle, Target, BookOpen } from 'lucide-react'
import { Screening } from '@/types/database'
import { edgeFunctionsApi } from '@/api/edgeFunctions'
import { useAuth } from '@/contexts/AuthContext'

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
  const [recipientEmail, setRecipientEmail] = useState(user?.email || '')
  const [selectedReports, setSelectedReports] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [progress, setProgress] = useState({ current: 0, total: 0 })
  const [showResult, setShowResult] = useState(false)
  const [resultType, setResultType] = useState<'success' | 'error'>('success')
  const [resultMessage, setResultMessage] = useState('')

  const isHearingOnly = selectedScreenings.every(s => s.source_table === 'hearing')

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
            if (reportType === 'student-report') {
              await edgeFunctionsApi.sendStudentReport(screening.id, recipientEmail)
            } else if (reportType === 'goal-sheet') {
              await edgeFunctionsApi.studentGoalSheet(screening.id, recipientEmail)
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
    setRecipientEmail(user?.email || '')
    setSelectedReports([])
    setShowResult(false)
    onClose()
  }

  const handleResultClose = () => {
    setShowResult(false)
    onSend('email')
    handleClose()
  }

  const reportOptions = [
    {
      value: 'student-report',
      label: 'Student Report',
      description: 'Detailed student assessment and performance overview',
      icon: BookOpen,
    },
    {
      value: 'goal-sheet',
      label: 'Goal Sheet',
      description: 'Individualized goal tracking sheet with objectives',
      icon: Target,
    },
  ]

  if (showResult) {
    return (
      <Dialog open={isOpen} onOpenChange={handleResultClose}>
        <DialogContent>
          <div className='flex flex-col items-center text-center space-y-6'>
            {resultType === 'success' ? (
              <CheckCircle className='w-16 h-16 text-green-600' />
            ) : (
              <XCircle className='w-16 h-16 text-red-600' />
            )}
            <DialogTitle>
              {resultType === 'success' ? 'Reports Sent!' : 'Some Reports Failed'}
            </DialogTitle>
            <DialogDescription>{resultMessage}</DialogDescription>
            <Button onClick={handleResultClose}>Done</Button>
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className='max-w-lg'>
        <DialogHeader>
          <DialogTitle className='flex items-center gap-2'>
            <Mail className='w-5 h-5' />
            Send {isHearingOnly ? 'Hearing' : ''} Reports for {selectedScreenings.length}{' '}
            Screening(s)
          </DialogTitle>
        </DialogHeader>

        <div className='space-y-4'>
          {/* Only show report selection for speech screenings */}
          {!isHearingOnly && (
            <div className='space-y-3'>
              <Label>Select Report Type(s)</Label>
              <div className='grid grid-cols-1 gap-3'>
                {reportOptions.map(report => {
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
                      className={`cursor-pointer rounded-lg border-2 p-4 transition-all ${
                        isSelected
                          ? 'border-blue-600 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}>
                      <div className='flex items-center gap-3'>
                        <Icon
                          className={`w-5 h-5 ${isSelected ? 'text-blue-600' : 'text-gray-500'}`}
                        />
                        <div>
                          <p className='font-medium'>{report.label}</p>
                          <p className='text-sm text-gray-500'>{report.description}</p>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* Show info for hearing screenings */}
          {isHearingOnly && (
            <div className='bg-blue-50 border border-blue-200 rounded-lg p-4'>
              <p className='text-sm text-blue-800'>
                Hearing reports will be generated and sent for {selectedScreenings.length}{' '}
                screening(s).
              </p>
            </div>
          )}

          {/* Email Input */}
          <div className='space-y-2'>
            <Label htmlFor='bulk-email'>Recipient Email</Label>
            <Input
              id='bulk-email'
              type='email'
              value={recipientEmail}
              onChange={e => setRecipientEmail(e.target.value)}
              placeholder='Enter email address'
            />
          </div>

          {/* Progress */}
          {isLoading && (
            <div className='text-sm text-gray-600'>
              Sending {progress.current} of {progress.total}...
            </div>
          )}

          {/* Actions */}
          <div className='flex justify-end gap-3'>
            <Button variant='outline' onClick={handleClose} disabled={isLoading}>
              Cancel
            </Button>
            <Button
              onClick={handleSendReports}
              disabled={
                !recipientEmail || (!isHearingOnly && selectedReports.length === 0) || isLoading
              }>
              {isLoading ? (
                <Loader2 className='w-4 h-4 mr-2 animate-spin' />
              ) : (
                <Send className='w-4 h-4 mr-2' />
              )}
              {isLoading ? 'Sending...' : 'Send Reports'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default BulkSendReportsModal
