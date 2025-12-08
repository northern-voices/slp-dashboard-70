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
import { Mail, Send, CheckCircle, XCircle, Target, BookOpen } from 'lucide-react'
import { Screening } from '@/types/database'
import { edgeFunctionsApi } from '@/api/edgeFunctions'
import { useAuth } from '@/contexts/AuthContext'

interface SendReportsModalProps {
  isOpen: boolean
  onClose: () => void
  screening: Screening | null
}

const SendReportsModal = ({ isOpen, onClose, screening }: SendReportsModalProps) => {
  const { user } = useAuth()
  const [recipientEmail, setRecipientEmail] = useState('')
  const [selectedReports, setSelectedReports] = useState<string[]>([])
  const [isEmailLoading, setIsEmailLoading] = useState(false)
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false)
  const [modalType, setModalType] = useState<'success' | 'error'>('success')
  const [modalMessage, setModalMessage] = useState('')

  // Pre-fill email with current user's email when modal opens
  // Auto-select hearing report if it's a hearing screening
  useEffect(() => {
    if (isOpen && user?.email && !recipientEmail) {
      setRecipientEmail(user.email)
    }

    // Auto-select hearing report for hearing screenings
    if (isOpen && screening?.source_table === 'hearing' && selectedReports.length === 0) {
      setSelectedReports(['hearing-report'])
    }
  }, [isOpen, user?.email, screening])

  const handleSendEmail = async () => {
    if (!recipientEmail || !screening) {
      return
    }

    const isHearingScreening = screening.source_table === 'hearing'

    if (!isHearingScreening && selectedReports.length === 0) {
      return
    }

    setIsEmailLoading(true)

    try {
      if (isHearingScreening) {
        await edgeFunctionsApi.generateHearingReport(screening.id, recipientEmail)
      } else {
        for (const reportType of selectedReports) {
          if (reportType === 'student-report') {
            await edgeFunctionsApi.sendStudentReport(screening.id, recipientEmail)
          } else if (reportType === 'goal-sheet') {
            await edgeFunctionsApi.studentGoalSheet(screening.id, recipientEmail)
          } else {
            console.warn(`Unknown report type: ${reportType}`)
            continue
          }
        }
      }

      // Show success modal
      setModalType('success')
      setModalMessage(`Reports sent successfully to ${recipientEmail}`)
      setIsSuccessModalOpen(true)
      onClose()
    } catch (error) {
      console.error('Error sending email:', error)
      setModalType('error')
      setModalMessage('Failed to send report. Please try again.')
      setIsSuccessModalOpen(true)
    } finally {
      setIsEmailLoading(false)
    }
  }

  const handleCloseSuccessModal = () => {
    setIsSuccessModalOpen(false)
    setModalType('success')
    setModalMessage('')
    setRecipientEmail('')
    setSelectedReports([])
  }

  const handleModalClose = () => {
    setRecipientEmail('')
    setSelectedReports([])
    onClose()
  }

  const getAvailableReports = () => {
    const isHearingScreening = screening?.source_table === 'hearing'

    if (isHearingScreening) {
      // For hearing screenings, show only the hearing report option
      return [
        {
          value: 'hearing-report',
          label: 'Hearing Screening Report',
          description: 'Detailed hearing screening assessment and results overview',
          icon: BookOpen,
        },
      ]
    }

    // For speech screenings, show the speech report options
    return [
      {
        value: 'student-report',
        label: 'Student Report',
        description: 'Detailed student assessment and performance overview',
        icon: BookOpen,
      },
      {
        value: 'goal-sheet',
        label: 'Goal Sheet',
        description:
          'Individualized goal tracking sheet with specific objectives and progress metrics',
        icon: Target,
      },
    ]
  }

  return (
    <>
      {/* Email Report Modal */}
      <Dialog open={isOpen} onOpenChange={handleModalClose}>
        <DialogContent className='max-w-4xl max-h-[90vh] overflow-y-auto'>
          <DialogHeader>
            <DialogTitle className='text-xl font-medium text-gray-700 flex items-center gap-2'>
              <Mail className='w-5 h-5' />
              Send {screening?.student_name}'s Reports
            </DialogTitle>
          </DialogHeader>

          <div className='space-y-4'>
            {/* Report Type Selection */}
            <div className='space-y-3'>
              <Label className='text-sm font-medium'>Select Type of Report</Label>
              <div className='grid grid-cols-1 md:grid-cols-2 gap-3'>
                {getAvailableReports().map(report => {
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
                        relative cursor-pointer rounded-lg border-2 p-4 transition-all duration-200 w-full
                        ${
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

            {/* Email Input */}
            <div className='space-y-3'>
              <div className='space-y-1'>
                <Label htmlFor='email' className='text-sm font-medium'>
                  Recipient Email
                </Label>
                <Input
                  id='email'
                  type='email'
                  placeholder='Enter recipient email address'
                  value={recipientEmail}
                  onChange={e => setRecipientEmail(e.target.value)}
                  className='h-12'
                />
              </div>
            </div>

            {/* Send Button */}
            <div className='mt-6'>
              <Button
                onClick={handleSendEmail}
                variant='default'
                size='sm'
                className='w-full h-9 bg-blue-600 hover:bg-blue-700 text-white'
                disabled={
                  !recipientEmail ||
                  !screening ||
                  (screening.source_table !== 'hearing' && selectedReports.length === 0) ||
                  isEmailLoading
                }>
                <Send className='w-4 h-4 mr-2' />
                {isEmailLoading ? 'Sending...' : 'Send Reports'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Success/Error Modal */}
      <Dialog open={isSuccessModalOpen} onOpenChange={() => {}}>
        <DialogContent className='mx-auto'>
          <div className='flex flex-col items-center text-center space-y-6'>
            {/* Icon */}
            <div className='flex justify-center'>
              {modalType === 'success' ? (
                <CheckCircle className='w-16 h-16 text-green-600' />
              ) : (
                <XCircle className='w-16 h-16 text-red-600' />
              )}
            </div>

            {/* Title and Description */}
            <div className='space-y-2'>
              <DialogTitle className='text-2xl font-semibold text-gray-900'>
                {modalType === 'success' ? 'Report Sent Successfully!' : 'Error Sending Report'}
              </DialogTitle>
              <DialogDescription className='text-gray-600 text-base leading-relaxed'>
                {modalMessage}
              </DialogDescription>
            </div>

            {/* Action Button */}
            <div className='flex flex-col sm:flex-row gap-3 w-full sm:w-auto'>
              <Button
                onClick={handleCloseSuccessModal}
                className='w-full sm:w-auto bg-primary hover:bg-primary/90 text-primary-foreground px-6 py-2'>
                {modalType === 'success' ? 'Done' : 'Try Again'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}

export default SendReportsModal
