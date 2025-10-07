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
import { Mail, Send, CheckCircle, XCircle, Target, BookOpen } from 'lucide-react'
import { Screening } from '@/types/database'
import { edgeFunctionsApi } from '@/api/edgeFunctions'

interface SendReportsModalProps {
  isOpen: boolean
  onClose: () => void
  screening: Screening | null
}

const SendReportsModal = ({ isOpen, onClose, screening }: SendReportsModalProps) => {
  const [recipientEmail, setRecipientEmail] = useState('')
  const [selectedReports, setSelectedReports] = useState<string[]>([])
  const [isEmailLoading, setIsEmailLoading] = useState(false)
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false)
  const [modalType, setModalType] = useState<'success' | 'error'>('success')
  const [modalMessage, setModalMessage] = useState('')

  const handleSendEmail = async () => {
    if (!recipientEmail || selectedReports.length === 0 || !screening) {
      return
    }

    setIsEmailLoading(true)

    try {
      // Process each selected report type
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

      // Show success modal
      if (selectedReports.length > 0) {
        setModalType('success')
        setModalMessage(`Reports sent successfully to ${recipientEmail}`)
        setIsSuccessModalOpen(true)
        onClose()
      }
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
        description: 'Individualized goal tracking sheet with specific objectives and progress metrics',
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
            <DialogTitle className='flex items-center gap-2 text-2xl'>
              <Mail className='w-6 h-6' />
              Send Report for {screening?.student_name}
            </DialogTitle>
            <DialogDescription className='text-base mt-2'>
              Select report type and enter recipient email address
            </DialogDescription>
          </DialogHeader>

          <div className='space-y-6 mt-6'>
            {/* Report Type Selection */}
            <div className='space-y-4'>
              <Label className='text-base font-semibold'>Select Type of Report</Label>
              <div className='grid grid-cols-1 lg:grid-cols-2 gap-4'>
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
                        relative cursor-pointer rounded-lg border-2 p-6 transition-all duration-200 w-full
                        ${
                          isSelected
                            ? 'border-blue-600 bg-blue-50 shadow-md'
                            : 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50'
                        }
                      `}>
                      <div className='flex items-start space-x-4 w-full'>
                        <div
                          className={`
                          flex-shrink-0 p-3 rounded-lg
                          ${isSelected ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600'}
                        `}>
                          <Icon className='w-6 h-6' />
                        </div>
                        <div className='flex-1 min-w-0'>
                          <h3
                            className={`
                            text-base font-semibold leading-tight mb-2
                            ${isSelected ? 'text-blue-900' : 'text-gray-900'}
                          `}>
                            {report.label}
                          </h3>
                          <p
                            className={`
                            text-sm leading-relaxed
                            ${isSelected ? 'text-blue-700' : 'text-gray-600'}
                          `}>
                            {report.description}
                          </p>
                        </div>
                      </div>
                      {isSelected && (
                        <div className='absolute top-3 right-3'>
                          <div className='w-3 h-3 bg-blue-600 rounded-full'></div>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Email Input */}
            <div className='space-y-3'>
              <Label htmlFor='email' className='text-base font-semibold'>
                Recipient Email
              </Label>
              <Input
                id='email'
                type='email'
                placeholder='Enter recipient email address'
                value={recipientEmail}
                onChange={e => setRecipientEmail(e.target.value)}
                className='h-14 text-base'
              />
            </div>

            {/* Send Button */}
            <div className='flex justify-end gap-4 pt-6'>
              <Button
                variant='outline'
                size='lg'
                onClick={handleModalClose}
                disabled={isEmailLoading}
                className='px-8'>
                Cancel
              </Button>
              <Button
                size='lg'
                onClick={handleSendEmail}
                disabled={!recipientEmail || selectedReports.length === 0 || isEmailLoading}
                className='bg-blue-600 hover:bg-blue-700 px-8'>
                <Send className='w-5 h-5 mr-2' />
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
