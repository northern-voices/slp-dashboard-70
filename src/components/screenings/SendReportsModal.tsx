import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Mail, Send, CheckCircle, XCircle, BookOpen } from 'lucide-react'
import { Screening } from '@/types/database'
import { edgeFunctionsApi } from '@/api/edgeFunctions'
import { getEmailHistory, upsertEmailHistory } from '@/api/emailHistory'
import { useAuth } from '@/contexts/AuthContext'
import { useSpeechScreeningsByStudent } from '@/hooks/screenings/use-screenings'
import { SPEECH_REPORT_OPTIONS, SPEECH_GOAL_SHEET_OPTIONS } from '@/constants/reportOptions'
import MultiEmailInput from '@/components/reports/shared/MultiEmailInput'

interface SendReportsModalProps {
  isOpen: boolean
  onClose: () => void
  screening: Screening | null
}

const SendReportsModal = ({ isOpen, onClose, screening }: SendReportsModalProps) => {
  const { user } = useAuth()
  const [recipientEmails, setRecipientEmails] = useState<string[]>([])
  const [emailHistory, setEmailHistory] = useState<string[]>([])
  const [selectedReports, setSelectedReports] = useState<string[]>([])
  const [isEmailLoading, setIsEmailLoading] = useState(false)
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false)
  const [modalType, setModalType] = useState<'success' | 'error'>('success')
  const [modalMessage, setModalMessage] = useState('')
  const [comparisonScreeningId, setComparisonScreeningId] = useState('')

  const { data: studentScreenings } = useSpeechScreeningsByStudent(screening?.student_id)
  const isAbsentScreening = (s: Screening) =>
    s.result === 'absent' || s.error_patterns?.attendance?.absent === true
  const comparisonOptions = (studentScreenings || []).filter(
    s => s.id !== screening?.id && !isAbsentScreening(s)
  )

  // Pre-fill email with current user's email when modal opens
  // Auto-select hearing report if it's a hearing screening
  useEffect(() => {
    if (isOpen && user?.email && recipientEmails.length === 0) {
      setRecipientEmails([user.email])
    }

    // Auto-select hearing report for hearing screenings
    if (isOpen && screening?.source_table === 'hearing' && selectedReports.length === 0) {
      setSelectedReports(['hearing-report'])
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, user?.email, screening])

  useEffect(() => {
    if (user?.id) getEmailHistory(user.id).then(setEmailHistory).catch(console.error)
  }, [user?.id])

  const handleSendEmail = async () => {
    if (recipientEmails.length === 0 || !screening) {
      return
    }

    const isHearingScreening = screening.source_table === 'hearing'

    if (!isHearingScreening && selectedReports.length === 0) {
      return
    }

    if (selectedReports.includes('progress-speech-report') && !comparisonScreeningId) {
      return
    }

    setIsEmailLoading(true)

    try {
      if (isHearingScreening) {
        await edgeFunctionsApi.generateHearingReport(screening.id, recipientEmails)
      } else {
        for (const reportType of selectedReports) {
          if (reportType === 'initial-speech-report') {
            await edgeFunctionsApi.sendStudentReport(screening.id, recipientEmails)
          } else if (reportType === 'initial-goal-sheet') {
            await edgeFunctionsApi.studentGoalSheet(screening.id, recipientEmails)
          } else if (reportType === 'progress-speech-report') {
            await edgeFunctionsApi.studentProgressReport(
              screening.id,
              comparisonScreeningId,
              recipientEmails
            )
          } else {
            console.warn(`Unknown report type: ${reportType}`)
            continue
          }
        }
      }

      if (user?.id) upsertEmailHistory(user.id, recipientEmails).catch(console.error)

      // Show success modal
      setModalType('success')
      setModalMessage(`Reports sent successfully to ${recipientEmails.join(', ')}`)
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
    setRecipientEmails([])
    setSelectedReports([])
    setComparisonScreeningId('')
  }

  const handleModalClose = () => {
    setRecipientEmails([])
    setSelectedReports([])
    setComparisonScreeningId('')
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

    return [...SPEECH_REPORT_OPTIONS, ...SPEECH_GOAL_SHEET_OPTIONS]
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

              {/* Comparison screening for progress reports */}
              {selectedReports.includes('progress-speech-report') && (
                <div>
                  <Label className='text-sm font-medium'>Compare Against</Label>
                  {comparisonOptions.length === 0 ? (
                    <div className='mt-1 p-3 rounded-lg border border-amber-200 bg-amber-50 text-amber-800 text-sm'>
                      This student needs at least one other (non-absent) speech screening on record
                      to generate a progress report.
                    </div>
                  ) : (
                    <Select value={comparisonScreeningId} onValueChange={setComparisonScreeningId}>
                      <SelectTrigger className='w-full'>
                        <SelectValue placeholder='Select a screening to compare against' />
                      </SelectTrigger>

                      <SelectContent>
                        {comparisonOptions.map(s => (
                          <SelectItem key={s.id} value={s.id}>
                            {new Date(s.created_at).toLocaleDateString()}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                </div>
              )}
            </div>

            {/* Email Input */}
            <MultiEmailInput
              recipientEmails={recipientEmails}
              onChange={setRecipientEmails}
              emailHistory={emailHistory}
            />

            {/* Send Button */}
            <div className='mt-6'>
              <Button
                onClick={handleSendEmail}
                variant='default'
                size='sm'
                className='w-full h-9 bg-blue-600 hover:bg-blue-700 text-white'
                disabled={
                  recipientEmails.length === 0 ||
                  !screening ||
                  (screening.source_table !== 'hearing' && selectedReports.length === 0) ||
                  (selectedReports.includes('progress-speech-report') && !comparisonScreeningId) ||
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
