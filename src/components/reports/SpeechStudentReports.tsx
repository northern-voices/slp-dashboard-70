import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { useOrganization } from '@/contexts/OrganizationContext'
import { useAuth } from '@/contexts/AuthContext'
import StudentSearchSelector from '@/components/screening/StudentSearchSelector'
import { CheckCircle, Mail, User, Send, Eye, Plus, List, XCircle, X } from 'lucide-react'
import { Student } from '@/types/database'
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
  const [selectedScreening, setSelectedScreening] = useState<Screening | null>(null)
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
  const [selectedReport, setSelectedReport] = useState<string | null>(null)
  const [comparisonScreenings, setComparisonScreenings] = useState<Screening[]>([])
  const [recipientEmails, setRecipientEmails] = useState<string[]>([])
  const [emailInput, setEmailInput] = useState('')

  const isValidEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)

  // Pre-fill email with current user's email on component mount
  useEffect(() => {
    if (user?.email) {
      setRecipientEmails([user.email])
    }
  }, [user?.email])

  const getAvailableReports = () => SPEECH_REPORT_OPTIONS

  const handleSendEmail = async () => {
    if (!selectedReport || recipientEmails.length === 0) return
    if (selectedReport === 'initial-speech-report' && !selectedScreening) return
    if (selectedReport === 'progress-speech-report' && comparisonScreenings.length < 2) return

    setIsEmailLoading(true)
    setEmailStatus('idle')
    setEmailMessage('')

    try {
      for (const email of recipientEmails) {
        if (selectedReport === 'initial-speech-report') {
          await edgeFunctionsApi.sendStudentReport(selectedScreening.id, email)
        } else if (selectedReport === 'progress-speech-report') {
          await edgeFunctionsApi.studentProgressReport(
            comparisonScreenings[0].id,
            comparisonScreenings[1].id,
            email
          )
        }
      }

      // Show success modal if any reports were processed
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
    setSelectedScreening(null)
    setComparisonScreenings([])
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
    setSelectedReport(null)
    setRecipientEmails([])
    setEmailInput('')
    setCustomMessage('')
    setEmailStatus('idle')
    setEmailMessage('')
    setComparisonScreenings([])
  }

  const handleCloseModal = () => {
    setIsSuccessModalOpen(false)
    setModalType('success')
    setModalMessage('')
  }

  const handleClearComparison = () => {
    setComparisonScreenings([])
  }

  const handleSelectComparisonScreening = (screening: Screening) => {
    setComparisonScreenings(prev => {
      const existingIndex = prev.findIndex(s => s.id === screening.id)

      if (existingIndex !== -1) {
        return prev.filter(s => s.id !== screening.id)
      }

      if (prev.length === 2) {
        return [prev[0], screening]
      }

      return [...prev, screening]
    })
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

        {/* Select Type of Report — now above the screenings table */}
        {selectedStudent && (
          <div className='space-y-3'>
            <Label className='text-xl font-medium'>Select Type of Report</Label>
            <div className='grid grid-cols-1 gap-3 lg:grid-cols-2'>
              {getAvailableReports().map(report => {
                const Icon = report.icon
                const isSelected = selectedReport === report.value

                return (
                  <div
                    key={report.value}
                    onClick={() => {
                      const newValue = report.value === selectedReport ? null : report.value
                      setSelectedReport(newValue)
                      setSelectedScreening(null)
                      setComparisonScreenings([])
                    }}
                    className={`
                    relative cursor-pointer rounded-lg border-2 p-4 transition-all duration-200 w-full
                    ${
                      isSelected
                        ? 'border-blue-600 bg-blue-50 shadow-sm'
                        : 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50'
                    }
                  `}>
                    <div className='flex items-start w-full space-x-3'>
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

        {/* Screenings Table */}
        <div className='space-y-3'>
          {selectedStudent && (
            <div className='space-y-3'>
              <h3 className='text-xl font-medium text-gray-700'>Screenings</h3>
              <SpeechScreeningsTable
                studentId={selectedStudent.id}
                selectedScreening={selectedScreening}
                onSelectScreening={handleSelectScreening}
                onViewDetails={handleViewDetails}
                mode={selectedReport === 'progress-speech-report' ? 'comparison' : 'single'}
                comparisonScreenings={comparisonScreenings}
                onSelectedComparisonScreening={handleSelectComparisonScreening}
                onClearComparison={handleClearComparison}
              />
            </div>
          )}
        </div>
      </div>

      {/* Email Section — report selector removed from here */}
      {selectedStudent && (
        <div className='p-4 mt-6 border border-gray-200 rounded-lg bg-gray-50'>
          <h4 className='flex items-center gap-2 mb-4 text-xl font-medium text-gray-700'>
            <Mail className='w-5 h-5' />
            Send {selectedStudent.first_name}'s Reports
          </h4>

          <div className='space-y-4'>
            {/* Recipient Email */}
            <div className='space-y-3'>
              <div className='space-y-1'>
                <Label htmlFor='recipient' className='text-sm font-medium'>
                  Recipient Email(s)
                </Label>

                <div className='min-h-[42px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-within:outline-none focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2'>
                  <div className='flex flex-wrap gap-2'>
                    {recipientEmails.map((email, index) => (
                      <Badge
                        key={index}
                        variant='secondary'
                        className='flex items-center gap-1 px-2 py-1'>
                        <span>{email}</span>
                        <button
                          type='button'
                          className='ml-1 rounded-full hover:bg-muted-foreground/20 p-0.5'
                          onClick={() =>
                            setRecipientEmails(recipientEmails.filter(e => e !== email))
                          }>
                          <X className='w-3 h-3' />
                        </button>
                      </Badge>
                    ))}
                    <input
                      type='email'
                      id='recipient'
                      value={emailInput}
                      onChange={e => setEmailInput(e.target.value)}
                      onKeyDown={e => {
                        if (e.key === 'Enter') {
                          e.preventDefault()
                          const trimmed = emailInput.trim()

                          if (
                            trimmed &&
                            isValidEmail(trimmed) &&
                            !recipientEmails.includes(trimmed) &&
                            recipientEmails.length < 5
                          ) {
                            setRecipientEmails([...recipientEmails, trimmed])
                            setEmailInput('')
                          }
                        } else if (
                          e.key === 'Backspace' &&
                          emailInput === '' &&
                          recipientEmails.length > 0
                        ) {
                          setRecipientEmails(recipientEmails.slice(0, -1))
                        }
                      }}
                      onBlur={() => {
                        const trimmed = emailInput.trim()

                        if (
                          trimmed &&
                          isValidEmail(trimmed) &&
                          !recipientEmails.includes(trimmed) &&
                          recipientEmails.length < 5
                        ) {
                          setRecipientEmails([...recipientEmails, trimmed])
                          setEmailInput('')
                        }
                      }}
                      placeholder={
                        recipientEmails.length === 0 ? 'Type email and press Enter (max 5)' : ''
                      }
                      className='flex-1 min-w-[120px] outline-none bg-transparent'
                    />
                  </div>
                </div>
                <p className='text-xs text-gray-500'>
                  Press Enter to add up to 5 recipients. Click x or Backspace to remove.
                </p>
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
              className='w-full text-white bg-blue-600 h-9 hover:bg-blue-700'
              disabled={
                !selectedStudent ||
                recipientEmails.length === 0 ||
                !selectedReport ||
                isEmailLoading ||
                (selectedReport === 'progress-speech-report'
                  ? comparisonScreenings.length < 2
                  : !selectedScreening)
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
          <div className='flex flex-col items-center space-y-6 text-center'>
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
              <DialogDescription className='text-base leading-relaxed text-gray-600'>
                {modalMessage}
              </DialogDescription>
            </div>

            {/* Action Buttons */}
            <div className='flex flex-col w-full gap-3 sm:flex-row sm:w-auto'>
              {modalType === 'success' ? (
                <>
                  <Button
                    onClick={handleStayOnPage}
                    className='w-full px-6 py-2 sm:w-auto bg-primary hover:bg-primary/90 text-primary-foreground'>
                    <Plus className='w-4 h-4' />
                    Send Another Report
                  </Button>
                  <Button
                    onClick={handleGoBackToReports}
                    variant='outline'
                    className='w-full px-6 py-2 sm:w-auto'>
                    <List className='w-4 h-4' />
                    Back to Reports
                  </Button>
                </>
              ) : (
                <Button
                  onClick={handleCloseModal}
                  className='w-full px-6 py-2 sm:w-auto bg-primary hover:bg-primary/90 text-primary-foreground'>
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
  mode = 'single',
  comparisonScreenings = [],
  onSelectedComparisonScreening,
  onClearComparison,
}: {
  studentId: string
  selectedScreening: Screening | null
  onSelectScreening: (screening: Screening | null) => void
  onViewDetails: (screening: Screening) => void
  mode?: 'single' | 'comparison'
  comparisonScreenings?: Screening[]
  onSelectedComparisonScreening?: (screening: Screening) => void
  onClearComparison?: () => void
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
      <div className='py-4 text-sm text-center text-gray-500'>
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
    <div className='overflow-hidden bg-white border border-gray-200 rounded-lg'>
      {/* Table Header */}
      <div className='px-6 py-3 border-b border-gray-200 bg-gray-50'>
        <div className='flex items-center justify-between'>
          <div className='flex items-center gap-3'>
            <span className='text-sm font-medium text-gray-900'>Select a Screening</span>
          </div>
          <div className='flex items-center gap-1'>
            <div className='flex items-center gap-2'>
              <Badge
                variant='outline'
                className='flex items-center justify-center px-3 font-medium text-center text-blue-600 border-blue-300 bg-blue-50'>
                Total: {studentScreenings.length}
              </Badge>
            </div>

            <Button
              variant='outline'
              size='sm'
              disabled={
                mode === 'comparison' ? comparisonScreenings.length === 0 : !selectedScreening
              }
              onClick={() =>
                mode === 'comparison' ? onClearComparison?.() : onSelectScreening(null)
              }
              className='ml-2 text-xs h-7'>
              Clear
            </Button>
          </div>
        </div>
      </div>

      <div className='overflow-y-auto max-h-96'>
        {mode === 'single' ? (
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
                            className='w-8 h-8 p-0 hover:bg-gray-100'>
                            <Eye className='w-4 h-4' />
                          </Button>
                        </div>
                        <div className='flex items-center gap-2'>
                          {getResultBadge(screening.result || screening.screening_result)}
                        </div>
                        <div className='flex items-center gap-2'>
                          {getQualificationBadge(screening)}
                        </div>
                        <div className='space-y-1 text-sm text-gray-600'>
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
                          <div className='inline-block px-3 py-1 text-xs text-gray-500 bg-gray-200 rounded-lg'>
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
                        className='w-8 h-8 p-0 hover:bg-gray-100'>
                        <Eye className='w-4 h-4' />
                      </Button>
                    </TableCell>
                  </ResponsiveTableRow>
                ))}
              </TableBody>
            </ResponsiveTable>
          </RadioGroup>
        ) : (
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
                  onClick={
                    mode === 'comparison'
                      ? () => onSelectedComparisonScreening?.(screening)
                      : undefined
                  }
                  className={mode === 'comparison' ? 'cursor-pointer' : ''}
                  mobileCardContent={
                    <div className='space-y-3'>
                      <div className='flex items-center justify-between'>
                        <div className='flex items-center gap-2'>
                          {mode === 'comparison' ? (
                            (() => {
                              const idx = comparisonScreenings.findIndex(s => s.id === screening.id)
                              return idx !== -1 ? (
                                <div className='w-6 h-6 rounded-full bg-blue-600 text-white text-xs font-bold flex items-center justify-center'>
                                  {idx + 1}
                                </div>
                              ) : (
                                <div className='w-6 h-6 rounded-full border-2 border-gray-300' />
                              )
                            })()
                          ) : (
                            <RadioGroupItem value={screening.id} id={`mobile-${screening.id}`} />
                          )}
                          <h3 className='font-medium'>
                            {format(new Date(screening.created_at), 'MMM dd, yyyy')}
                          </h3>
                        </div>
                        <Button
                          variant='ghost'
                          size='sm'
                          onClick={() => onViewDetails(screening)}
                          className='w-8 h-8 p-0 hover:bg-gray-100'>
                          <Eye className='w-4 h-4' />
                        </Button>
                      </div>
                      <div className='flex items-center gap-2'>
                        {getResultBadge(screening.result || screening.screening_result)}
                      </div>
                      <div className='flex items-center gap-2'>
                        {getQualificationBadge(screening)}
                      </div>
                      <div className='space-y-1 text-sm text-gray-600'>
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
                    {mode === 'comparison' ? (
                      (() => {
                        const idx = comparisonScreenings.findIndex(s => s.id === screening.id)
                        return idx !== -1 ? (
                          <div className='w-6 h-6 rounded-full bg-blue-600 text-white text-xs font-bold flex items-center justify-center'>
                            {idx + 1}
                          </div>
                        ) : (
                          <div className='w-6 h-6 rounded-full border-2 border-gray-300' />
                        )
                      })()
                    ) : (
                      <RadioGroupItem
                        value={screening.id}
                        id={`desktop-${screening.id}`}
                        className='mt-1.5'
                      />
                    )}
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
                        <div className='inline-block px-3 py-1 text-xs text-gray-500 bg-gray-200 rounded-lg'>
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
                      className='w-8 h-8 p-0 hover:bg-gray-100'>
                      <Eye className='w-4 h-4' />
                    </Button>
                  </TableCell>
                </ResponsiveTableRow>
              ))}
            </TableBody>
          </ResponsiveTable>
        )}
      </div>
    </div>
  )
}

export default SpeechStudentReports
