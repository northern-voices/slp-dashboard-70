import { useState, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { useOrganization } from '@/contexts/OrganizationContext'
import { useAuth } from '@/contexts/AuthContext'
import StudentSearchSelector from '@/components/screening/StudentSearchSelector'
import { Mail, User, Send, Eye } from 'lucide-react'
import { Student } from '@/types/database'
import { useSpeechScreeningsByStudent } from '@/hooks/screenings/use-screenings'
import { format } from 'date-fns'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import ScreeningDetailsModal from '@/components/students/screening-history/ScreeningDetailsModal'
import { edgeFunctionsApi } from '@/api/edgeFunctions'
import { SPEECH_GOAL_SHEET_OPTIONS } from '@/constants/reportOptions'
import { upsertEmailHistory } from '@/api/emailHistory'
import ReportTypeSelector from '@/components/reports/shared/ReportTypeSelector'
import MultiEmailInput from '@/components/reports/shared/MultiEmailInput'
import ReportSendModal from '@/components/reports/shared/ReportSendModal'
import { useEmailSuggestions } from '@/hooks/useEmailSuggestions'
import ReportPasswordInput from '@/components/reports/shared/ReportPasswordInput'
import { useDefaultReportPassword } from '@/hooks/useDefaultReportPassword'

type GoalSheetLevel = 1 | 2 | 'custom'

const SpeechGoalSheets = () => {
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null)
  const [selectedReports, setSelectedReports] = useState<string[]>([])
  const [selectedLevel, setSelectedLevel] = useState<GoalSheetLevel | null>(null)
  const [recipientEmails, setRecipientEmails] = useState<string[]>([])
  const [isEmailLoading, setIsEmailLoading] = useState(false)
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false)
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false)
  const [modalType, setModalType] = useState<'success' | 'error'>('success')
  const [modalMessage, setModalMessage] = useState('')
  const [password, setPassword] = useState('')
  const defaultReportPassword = useDefaultReportPassword()

  const navigate = useNavigate()
  const { currentSchool } = useOrganization()
  const { user } = useAuth()

  const { data: screeningsData, isLoading: isScreeningsLoading } = useSpeechScreeningsByStudent(
    selectedStudent?.id
  )

  const latestScreening = useMemo(() => {
    if (!screeningsData || screeningsData.length === 0) return null

    return [...screeningsData].sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    )[0]
  }, [screeningsData])

  useEffect(() => {
    if (user?.email) setRecipientEmails([user.email])
  }, [user?.email])

  useEffect(() => {
    if (defaultReportPassword) setPassword(defaultReportPassword)
  }, [defaultReportPassword])

  const emailHistory = useEmailSuggestions(user?.id, currentSchool?.id)

  const handleToggleReport = (value: string) => {
    setSelectedReports(prev =>
      prev.includes(value) ? prev.filter(r => r !== value) : [...prev, value]
    )
  }

  const handleSendEmail = async () => {
    if (
      !latestScreening ||
      typeof selectedLevel !== 'number' ||
      selectedReports.length === 0 ||
      recipientEmails.length === 0
    )
      return

    setIsEmailLoading(true)
    try {
      for (const reportType of selectedReports) {
        if (reportType === 'initial-goal-sheet') {
          await edgeFunctionsApi.studentGoalSheet(
            latestScreening.id,
            selectedLevel,
            recipientEmails,
            password
          )
        } else if (reportType === 'progress-goal-sheet') {
          console.warn('progress-goal-sheet not yet mapped')
        }
      }

      if (user?.id) upsertEmailHistory(user.id, recipientEmails).catch(console.error)

      setModalType('success')
      setModalMessage(`Reports sent successfully to ${recipientEmails.join(', ')}`)
      setIsSuccessModalOpen(true)
    } catch (error) {
      console.error('Error sending email:', error)
      setModalType('error')
      setModalMessage('Failed to send report. Please try again.')
      setIsSuccessModalOpen(true)
    } finally {
      setIsEmailLoading(false)
    }
  }

  const handleStudentSelect = (student: Student | null) => {
    setSelectedStudent(student)
    setSelectedLevel(null)
  }

  const handleGoBackToReports = () => {
    setIsSuccessModalOpen(false)
    navigate(`/school/${currentSchool.id}/speech-screening-reports/goal-sheets`)
  }

  const handleStayOnPage = () => {
    setIsSuccessModalOpen(false)
    setSelectedStudent(null)
    setSelectedLevel(null)
    setSelectedReports([])
    setRecipientEmails(user?.email ? [user.email] : [])
    setPassword(defaultReportPassword)
  }
  return (
    <>
      <div className='space-y-4'>
        {/* Student Selector */}
        <div className='space-y-2'>
          <label className='text-xl font-medium text-gray-700'>Select Student</label>
          <StudentSearchSelector
            selectedStudent={selectedStudent}
            onStudentSelect={handleStudentSelect}
            isStudentCreatable={false}
          />
        </div>

        {/* Selected Student Info */}
        {selectedStudent && (
          <div className='p-3 border border-blue-200 rounded-lg bg-blue-50'>
            <div className='flex items-center gap-2'>
              <User className='w-4 h-4 text-blue-600' />
              <span className='font-medium text-blue-900'>
                {selectedStudent.first_name} {selectedStudent.last_name}
              </span>
              <span className='text-sm text-blue-700'>Grade {selectedStudent.grade}</span>
            </div>
          </div>
        )}

        {/* Report Type Selector */}
        {selectedStudent && (
          <ReportTypeSelector
            reports={SPEECH_GOAL_SHEET_OPTIONS}
            selectedValues={selectedReports}
            onToggle={handleToggleReport}
            columns={2}
          />
        )}

        {/* Screening being used (auto-selected: most recent) */}
        {selectedStudent && (
          <div className='space-y-2'>
            {isScreeningsLoading ? (
              <div className='flex items-center justify-center py-4'>
                <span className='text-sm text-gray-600'>Loading screening...</span>
              </div>
            ) : !latestScreening ? (
              <div className='py-4 text-sm text-center text-gray-500'>
                No speech screenings found for this student.
              </div>
            ) : (
              <div
                className='flex items-center justify-between p-3 border border-gray-200 rounded-lg
  bg-gray-50'>
                <span className='text-sm text-gray-700'>
                  Using most recent screening:{' '}
                  <span className='font-medium text-gray-900'>
                    {format(new Date(latestScreening.created_at), 'MMM dd, yyyy')}
                  </span>
                </span>
                <Button
                  variant='ghost'
                  size='sm'
                  onClick={() => setIsDetailsModalOpen(true)}
                  className='h-8 px-2'>
                  <Eye className='w-4 h-4 mr-1' />
                  View Details
                </Button>
              </div>
            )}
          </div>
        )}

        {/* Level Selector */}
        {selectedStudent && latestScreening && (
          <div className='space-y-2'>
            <h3 className='text-xl font-medium text-gray-700'>Select Level</h3>
            <RadioGroup
              value={selectedLevel === null ? '' : String(selectedLevel)}
              onValueChange={value =>
                setSelectedLevel(value === 'custom' ? 'custom' : (Number(value) as 1 | 2))
              }
              className='grid grid-cols-1 gap-3 sm:grid-cols-3'>
              <label
                htmlFor='level-1'
                className='flex items-center gap-3 p-4 border border-gray-200 rounded-lg cursor-pointer
  hover:bg-gray-50 has-[[data-state=checked]]:border-blue-500 has-[[data-state=checked]]:bg-blue-50'>
                <RadioGroupItem value='1' id='level-1' />
                <div>
                  <p className='font-medium text-gray-900'>Level 1</p>
                  <p className='text-xs text-gray-500'>Early-developing sounds</p>
                </div>
              </label>

              <label
                htmlFor='level-2'
                className='flex items-center gap-3 p-4 border border-gray-200 rounded-lg cursor-pointer
  hover:bg-gray-50 has-[[data-state=checked]]:border-blue-500 has-[[data-state=checked]]:bg-blue-50'>
                <RadioGroupItem value='2' id='level-2' />
                <div>
                  <p className='font-medium text-gray-900'>Level 2</p>
                  <p className='text-xs text-gray-500'>Later-developing sounds</p>
                </div>
              </label>

              <div
                className='flex items-center gap-3 p-4 border border-gray-200 rounded-lg opacity-50
  cursor-not-allowed'>
                <RadioGroupItem value='custom' id='level-custom' disabled />
                <div>
                  <p className='font-medium text-gray-900'>Create Your Own</p>
                  <p className='text-xs text-gray-500'>Coming soon</p>
                </div>
              </div>
            </RadioGroup>
          </div>
        )}
      </div>

      {/* Email Section */}
      {selectedStudent && (
        <div className='p-4 mt-6 border border-gray-200 rounded-lg bg-gray-50'>
          <h4 className='flex items-center gap-2 mb-4 text-xl font-medium text-gray-700'>
            <Mail className='w-5 h-5' />
            Send {selectedStudent.first_name}'s Goal Sheets
          </h4>

          <MultiEmailInput
            recipientEmails={recipientEmails}
            onChange={setRecipientEmails}
            emailHistory={emailHistory}
          />

          <ReportPasswordInput password={password} onChange={setPassword} />

          <div className='mt-6'>
            <Button
              onClick={handleSendEmail}
              variant='default'
              size='sm'
              className='w-full text-white bg-blue-600 h-9 hover:bg-blue-700'
              disabled={
                !latestScreening ||
                typeof selectedLevel !== 'number' ||
                selectedReports.length === 0 ||
                recipientEmails.length === 0 ||
                !password.trim() ||
                isEmailLoading
              }>
              <Send className='w-4 h-4 mr-2' />
              {isEmailLoading ? 'Sending...' : 'Send Reports'}
            </Button>
          </div>
        </div>
      )}

      <ScreeningDetailsModal
        isOpen={isDetailsModalOpen}
        onClose={() => setIsDetailsModalOpen(false)}
        screening={latestScreening}
      />

      <ReportSendModal
        isOpen={isSuccessModalOpen}
        modalType={modalType}
        modalMessage={modalMessage}
        onStayOnPage={handleStayOnPage}
        onGoBack={handleGoBackToReports}
        onClose={() => setIsSuccessModalOpen(false)}
      />
    </>
  )
}

export default SpeechGoalSheets
