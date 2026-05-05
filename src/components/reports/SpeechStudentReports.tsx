import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { useOrganization } from '@/contexts/OrganizationContext'
import { useAuth } from '@/contexts/AuthContext'
import StudentSearchSelector from '@/components/screening/StudentSearchSelector'
import { CheckCircle, Mail, User, Send, Eye, Plus, List, XCircle } from 'lucide-react'
import { Student } from '@/types/database'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useSpeechScreeningsByStudent } from '@/hooks/screenings/use-screenings'
import { Screening } from '@/types/database'
import { format } from 'date-fns'
import { Badge } from '@/components/ui/badge'
import { SCREENING_RESULTS } from '@/constants/screeningResults'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import ScreeningDetailsModal from '@/components/students/screening-history/ScreeningDetailsModal'
import {
  ResponsiveTable,
  ResponsiveTableRow,
  TableHeader,
  TableHead,
  TableBody,
  TableCell,
} from '@/components/ui/responsive-table'
import { edgeFunctionsApi } from '@/api/edgeFunctions'
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog'
import { SPEECH_REPORT_OPTIONS } from '@/constants/reportOptions'

const SpeechStudentReports = () => {
  const navigate = useNavigate()
  const { currentSchool } = useOrganization()
  const { user } = useAuth()

  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null)
  const [selectedReports, setSelectedReports] = useState<string[]>([])
  const [selectedScreening, setSelectedScreening] = useState<Screening | null>(null)
  const [recipientEmail, setRecipientEmail] = useState('')
  const [customMessage, setCustomMessage] = useState('')
  const [isEmailLoading, setIsEmailLoading] = useState(false)
  const [selectedScreeningForDetails, setSelectedScreeningForDetails] = useState<Screening | null>(
    null
  )
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false)
  const [emailStatus, setEmailStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [emailMessage, setEmailMessage] = useState('')
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false)
  const [modalType, setModalType] = useState<'success' | 'error'>('success')
  const [modalMessage, setModalMessage] = useState('')

  // Pre-fill email with current user's email on component mount
  useEffect(() => {
    if (user?.email) {
      setRecipientEmail(user.email)
    }
  }, [user?.email])

  const getAvailableReports = () => SPEECH_REPORT_OPTIONS

  const handleSendEmail = async () => {
    if (!recipientEmail || selectedReports.length === 0 || !selectedScreening) {
      return
    }

    setIsEmailLoading(true)
    setEmailStatus('idle')
    setEmailMessage('')

    try {
      // Process each selected report type
      for (const reportType of selectedReports) {
        if (reportType === 'initial-speech-report') {
          await edgeFunctionsApi.sendStudentReport(selectedScreening.id, recipientEmail)
        } else if (reportType === 'initial-goal-sheet') {
          await edgeFunctionsApi.studentGoalSheet(selectedScreening.id, recipientEmail)
        } else if (reportType === 'progress-speech-report') {
          await edgeFunctionsApi.studentProgressReport(selectedScreening.id, recipientEmail)
        } else if (reportType === 'progress-goal-sheet') {
          // TODO: map to the correct API call when ready
          console.warn(`progress-goal-sheet not yet mapped`)
          continue
        }
      }

      // Show success modal if any reports were processed
      if (selectedReports.length > 0) {
        setModalType('success')
        setModalMessage(`Reports sent successfully to ${recipientEmail}`)
        setIsSuccessModalOpen(true)
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

  const handleStudentSelect = (student: Student | null) => {
    setSelectedStudent(student)
    setSelectedScreening(null) // Clear selected screening when student changes
  }

  const handleSelectScreening = (screening: Screening | null) => {
    setSelectedScreening(screening)
  }

  const handleViewDetails = (screening: Screening) => {
    setSelectedScreeningForDetails(screening)
    setIsDetailsModalOpen(true)
  }

  const handleGoBackToReports = () => {
    setIsSuccessModalOpen(false)
    setModalType('success')
    setModalMessage('')
    navigate(`/school/${currentSchool.id}/speech-screening-reports`)
  }

  const handleStayOnPage = () => {
    setIsSuccessModalOpen(false)
    setModalType('success')
    setModalMessage('')
    // Clear all selections
    setSelectedStudent(null)
    setSelectedScreening(null)
    setSelectedReports([])
    setRecipientEmail('')
    setCustomMessage('')
    setEmailStatus('idle')
    setEmailMessage('')
  }

  const handleCloseModal = () => {
    setIsSuccessModalOpen(false)
    setModalType('success')
    setModalMessage('')
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
          <div className='p-3 bg-blue-50 rounded-lg border border-blue-200'>
            <div className='flex items-center gap-2'>
              <User className='w-4 h-4 text-blue-600' />
              <span className='font-medium text-blue-900'>
                {selectedStudent.first_name} {selectedStudent.last_name}
              </span>
              <span className='text-sm text-blue-700'>Grade {selectedStudent.grade}</span>
            </div>
          </div>
        )}

        {/* Speech Screens Table */}
        <div className='space-y-3'>
          {selectedStudent && (
            <div className='space-y-3'>
              <h3 className='text-xl font-medium text-gray-700'>Screenings</h3>
              <SpeechScreeningsTable
                studentId={selectedStudent.id}
                selectedScreening={selectedScreening}
                onSelectScreening={handleSelectScreening}
                onViewDetails={handleViewDetails}
              />
            </div>
          )}
        </div>
      </div>

      {/* Email Section */}
      {selectedStudent && (
        <div className='mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200'>
          <h4 className='text-xl font-medium text-gray-700 mb-4 flex items-center gap-2'>
            <Mail className='w-5 h-5' />
            Send {selectedStudent.first_name}'s Reports
          </h4>

          <div className='space-y-4'>
            {/* Report Selection */}
            <div className='space-y-3'>
              <Label className='text-sm font-medium'>Select Type of Report</Label>
              <div className='grid grid-cols-1 lg:grid-cols-2 gap-3'>
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

            {/* Email Details */}
            <div className='space-y-3'>
              <div className='space-y-1'>
                <Label htmlFor='recipient' className='text-sm font-medium'>
                  Recipient Email
                </Label>
                <Input
                  id='recipient'
                  type='email'
                  placeholder='Enter recipient email address'
                  value={recipientEmail}
                  onChange={e => setRecipientEmail(e.target.value)}
                  className='h-12'
                />
              </div>
            </div>
          </div>

          {/* Status Message */}
          {emailMessage && (
            <div
              className={`mt-4 p-3 rounded-lg border ${
                emailStatus === 'success'
                  ? 'bg-green-50 border-green-200 text-green-800'
                  : emailStatus === 'error'
                    ? 'bg-red-50 border-red-200 text-red-800'
                    : 'bg-blue-50 border-blue-200 text-blue-800'
              }`}>
              <div className='flex items-center gap-2'>
                {emailStatus === 'success' && <CheckCircle className='w-4 h-4' />}
                {emailStatus === 'error' && <span className='text-red-600'>⚠️</span>}
                <span className='text-sm font-medium'>{emailMessage}</span>
              </div>
            </div>
          )}

          {/* Send Reports */}
          <div className='mt-6'>
            <Button
              onClick={() => handleSendEmail()}
              variant='default'
              size='sm'
              className='w-full h-9 bg-blue-600 hover:bg-blue-700 text-white'
              disabled={
                !selectedStudent ||
                !recipientEmail ||
                selectedReports.length === 0 ||
                isEmailLoading ||
                !selectedScreening
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
        screening={selectedScreeningForDetails}
      />

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

            {/* Action Buttons */}
            <div className='flex flex-col sm:flex-row gap-3 w-full sm:w-auto'>
              {modalType === 'success' ? (
                <>
                  <Button
                    onClick={handleStayOnPage}
                    className='w-full sm:w-auto bg-primary hover:bg-primary/90 text-primary-foreground px-6 py-2'>
                    <Plus className='w-4 h-4' />
                    Send Another Report
                  </Button>
                  <Button
                    onClick={handleGoBackToReports}
                    variant='outline'
                    className='w-full sm:w-auto px-6 py-2'>
                    <List className='w-4 h-4' />
                    Back to Reports
                  </Button>
                </>
              ) : (
                <Button
                  onClick={handleCloseModal}
                  className='w-full sm:w-auto bg-primary hover:bg-primary/90 text-primary-foreground px-6 py-2'>
                  Try Again
                </Button>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}

// Speech Screenings Table Component
const SpeechScreeningsTable = ({
  studentId,
  selectedScreening,
  onSelectScreening,
  onViewDetails,
}: {
  studentId: string
  selectedScreening: Screening | null
  onSelectScreening: (screening: Screening | null) => void
  onViewDetails: (screening: Screening) => void
}) => {
  const { data: screeningsData, isLoading, error } = useSpeechScreeningsByStudent(studentId)

  // Get speech screenings for the student
  const studentScreenings = screeningsData || []

  if (isLoading) {
    return (
      <div className='flex items-center justify-center py-4'>
        <span className='text-sm text-gray-600'>Loading screenings...</span>
      </div>
    )
  }

  if (error) {
    return <div className='text-sm text-red-600'>Error loading screenings. Please try again.</div>
  }

  if (studentScreenings.length === 0) {
    return (
      <div className='text-sm text-gray-500 text-center py-4'>
        No speech screenings found for this student.
      </div>
    )
  }

  const getResultBadge = (result: string | undefined) => {
    if (!result) return <Badge variant='secondary'>No Result</Badge>

    const config = SCREENING_RESULTS[result.toLowerCase() as keyof typeof SCREENING_RESULTS]
    if (!config) return <Badge variant='secondary'>{result}</Badge>

    return <Badge className={`${config.color} font-medium`}>{config.label}</Badge>
  }

  const getQualificationBadge = (screening: Screening) => {
    const noConsent = screening.result === 'non_registered_no_consent'
    if (noConsent)
      return <Badge className='bg-gray-100 text-gray-800 font-medium text-[10px]'>No Consent</Badge>

    if (screening.service_status === 'graduated')
      return <Badge className='bg-blue-100 text-blue-800 font-medium text-[10px]'>Graduated</Badge>
    if (screening.service_status === 'paused')
      return <Badge className='bg-purple-100 text-purple-800 font-medium text-[10px]'>Pause</Badge>
    if (screening.program_status === 'sub')
      return <Badge className='bg-orange-100 text-orange-800 font-medium text-[10px]'>Sub</Badge>
    if (screening.program_status === 'qualified')
      return <Badge className='bg-red-100 text-red-800 font-medium text-[10px]'>Qualifies</Badge>
    if (screening.program_status === 'not_in_program')
      return (
        <Badge className='bg-green-100 text-green-800 font-medium text-[10px]'>
          Not In Program
        </Badge>
      )

    return <Badge className='bg-gray-100 text-gray-800 font-medium text-[10px]'>Not Set</Badge>
  }

  return (
    <div className='bg-white rounded-lg border border-gray-200 overflow-hidden'>
      {/* Table Header */}
      <div className='bg-gray-50 border-b border-gray-200 px-6 py-3'>
        <div className='flex items-center justify-between'>
          <div className='flex items-center gap-3'>
            <span className='text-sm font-medium text-gray-900'>Select a Screening</span>
          </div>
          <div className='flex items-center gap-1'>
            <div className='flex items-center gap-2'>
              <Badge
                variant='outline'
                className='bg-blue-50 text-blue-600 border-blue-300 font-medium px-3 text-center flex items-center justify-center'>
                Total: {studentScreenings.length}
              </Badge>
            </div>

            <Button
              variant='outline'
              size='sm'
              disabled={!selectedScreening}
              onClick={() => onSelectScreening(null)}
              className='h-7 text-xs ml-2'>
              Clear
            </Button>
          </div>
        </div>
      </div>

      <div className='max-h-96 overflow-y-auto'>
        <RadioGroup
          value={selectedScreening?.id || ''}
          onValueChange={value => {
            const screening = studentScreenings.find(s => s.id === value)
            onSelectScreening(screening || null)
          }}>
          <ResponsiveTable className='w-full'>
            <TableHeader>
              <tr>
                <TableHead className='w-12'></TableHead>
                <TableHead className='w-1/6 min-w-[100px]'>Date</TableHead>
                <TableHead className='w-1/6 min-w-[120px]'>Result</TableHead>
                <TableHead className='w-1/6 min-w-[120px]'>Program</TableHead>
                <TableHead className='w-1/6 min-w-[120px]'>Screener</TableHead>
                <TableHead className='w-1/6 min-w-[80px]'>Grade</TableHead>
                <TableHead className='w-12'></TableHead>
              </tr>
            </TableHeader>
            <TableBody>
              {studentScreenings.map(screening => (
                <ResponsiveTableRow
                  key={screening.id}
                  mobileCardContent={
                    <div className='space-y-3'>
                      <div className='flex items-center justify-between'>
                        <div className='flex items-center gap-2'>
                          <RadioGroupItem value={screening.id} id={`mobile-${screening.id}`} />
                          <h3 className='font-medium'>
                            {format(new Date(screening.created_at), 'MMM dd, yyyy')}
                          </h3>
                        </div>
                        <Button
                          variant='ghost'
                          size='sm'
                          onClick={() => onViewDetails(screening)}
                          className='h-8 w-8 p-0 hover:bg-gray-100'>
                          <Eye className='w-4 h-4' />
                        </Button>
                      </div>
                      <div className='flex items-center gap-2'>
                        {getResultBadge(screening.result || screening.screening_result)}
                      </div>
                      <div className='flex items-center gap-2'>
                        {getQualificationBadge(screening)}
                      </div>
                      <div className='text-sm text-gray-600 space-y-1'>
                        <p>
                          <span className='font-medium'>Screener:</span> {screening.screener}
                        </p>
                        {screening.grade && (
                          <p>
                            <span className='font-medium'>Grade:</span> {screening.grade}
                          </p>
                        )}
                      </div>
                    </div>
                  }>
                  <TableCell>
                    <RadioGroupItem
                      value={screening.id}
                      id={`desktop-${screening.id}`}
                      className='mt-1.5'
                    />
                  </TableCell>
                  <TableCell className='max-w-0'>
                    <div className='truncate'>
                      <div className='text-sm font-medium text-gray-900'>
                        {format(new Date(screening.created_at), 'MMM dd, yyyy')}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className='max-w-0'>
                    <div className='truncate'>
                      {getResultBadge(screening.result || screening.screening_result)}
                    </div>
                  </TableCell>
                  <TableCell className='max-w-0'>
                    <div className='truncate'>{getQualificationBadge(screening)}</div>
                  </TableCell>
                  <TableCell className='max-w-0'>
                    <div className='truncate' title={screening.screener}>
                      {screening.screener}
                    </div>
                  </TableCell>
                  <TableCell className='max-w-0'>
                    <div className='truncate' title={screening.grade || 'No grade'}>
                      {screening.grade ? (
                        <div className='text-xs text-gray-500 bg-gray-200 px-3 py-1 rounded-lg inline-block'>
                          {screening.grade}
                        </div>
                      ) : (
                        '-'
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Button
                      variant='ghost'
                      size='sm'
                      onClick={() => onViewDetails(screening)}
                      className='h-8 w-8 p-0 hover:bg-gray-100'>
                      <Eye className='w-4 h-4' />
                    </Button>
                  </TableCell>
                </ResponsiveTableRow>
              ))}
            </TableBody>
          </ResponsiveTable>
        </RadioGroup>
      </div>
    </div>
  )
}

export default SpeechStudentReports
