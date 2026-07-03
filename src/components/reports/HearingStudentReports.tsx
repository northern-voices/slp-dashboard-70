import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { useOrganization } from '@/contexts/OrganizationContext'
import { useAuth } from '@/contexts/AuthContext'
import { edgeFunctionsApi } from '@/api/edgeFunctions'
import StudentSearchSelector from '@/components/screening/StudentSearchSelector'
import { Mail, User, Send, Eye, BookOpen } from 'lucide-react'
import { Student, Screening } from '@/types/database'
import { useHearingScreeningsByStudent } from '@/hooks/screenings/use-hearing-screenings'
import { format } from 'date-fns'
import { Badge } from '@/components/ui/badge'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import HearingScreeningDetailsModal from '@/components/students/screening-history/HearingScreeningDetailsModal'
import {
  ResponsiveTable,
  ResponsiveTableRow,
  TableHeader,
  TableHead,
  TableBody,
  TableCell,
} from '@/components/ui/responsive-table'
import { getEmailHistory, upsertEmailHistory } from '@/api/emailHistory'
import ReportTypeSelector from '@/components/reports/shared/ReportTypeSelector'
import MultiEmailInput from '@/components/reports/shared/MultiEmailInput'
import ReportSendModal from '@/components/reports/shared/ReportSendModal'

const HEARING_REPORT_OPTIONS = [
  {
    value: 'hearing-report',
    label: 'Hearing Screening Report',
    description: 'Detailed hearing screening assessment and results overview',
    icon: BookOpen,
  },
]

const HearingStudentReports = () => {
  const navigate = useNavigate()
  const { currentSchool } = useOrganization()
  const { user } = useAuth()

  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null)
  const [selectedReports, setSelectedReports] = useState<string[]>([])
  const [selectedScreening, setSelectedScreening] = useState<Screening | null>(null)
  const [recipientEmails, setRecipientEmails] = useState<string[]>([])
  const [emailHistory, setEmailHistory] = useState<string[]>([])
  const [isEmailLoading, setIsEmailLoading] = useState(false)
  const [selectedScreeningForDetails, setSelectedScreeningForDetails] = useState<Screening | null>(
    null
  )
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false)
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false)
  const [modalType, setModalType] = useState<'success' | 'error'>('success')
  const [modalMessage, setModalMessage] = useState('')

  // Pre-fill email with current user's email on component mount
  useEffect(() => {
    if (user?.email) setRecipientEmails([user.email])
  }, [user?.email])

  useEffect(() => {
    if (user?.id) getEmailHistory(user.id).then(setEmailHistory).catch(console.error)
  }, [user?.id])

  const handleToggleReport = (value: string) => {
    setSelectedReports(prev =>
      prev.includes(value) ? prev.filter(r => r !== value) : [...prev, value]
    )
  }

  const handleSendEmail = async () => {
    if (!selectedScreening || selectedReports.length === 0 || recipientEmails.length === 0) return

    setIsEmailLoading(true)
    try {
      await edgeFunctionsApi.generateHearingReport(selectedScreening.id, recipientEmails)

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
    setSelectedScreening(null)
  }

  const handleGoBackToReports = () => {
    setIsSuccessModalOpen(false)
    navigate(`/school/${currentSchool.id}/speech-screening-reports/hearing`)
  }

  const handleStayOnPage = () => {
    setIsSuccessModalOpen(false)
    setSelectedStudent(null)
    setSelectedScreening(null)
    setSelectedReports([])
    setRecipientEmails([])
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

        {selectedStudent && (
          <ReportTypeSelector
            reports={HEARING_REPORT_OPTIONS}
            selectedValues={selectedReports}
            onToggle={handleToggleReport}
            columns={1}
          />
        )}

        {selectedStudent && (
          <div className='space-y-3'>
            <h3 className='text-xl font-medium text-gray-700'>Screenings</h3>
            <HearingScreeningsTable
              studentId={selectedStudent.id}
              selectedScreening={selectedScreening}
              onSelectScreening={setSelectedScreening}
              onViewDetails={screening => {
                setSelectedScreeningForDetails(screening)
                setIsDetailsModalOpen(true)
              }}
            />
          </div>
        )}
      </div>

      {/* Email Section */}
      {selectedStudent && (
        <div className='mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200'>
          <h4 className='text-xl font-medium text-gray-700 mb-4 flex items-center gap-2'>
            <Mail className='w-5 h-5' />
            Send {selectedStudent.first_name}'s Reports
          </h4>

          <MultiEmailInput
            recipientEmails={recipientEmails}
            onChange={setRecipientEmails}
            emailHistory={emailHistory}
          />

          <div className='mt-6'>
            <Button
              onClick={handleSendEmail}
              variant='default'
              size='sm'
              className='w-full h-9 bg-blue-600 hover:bg-blue-700 text-white'
              disabled={
                !selectedScreening ||
                selectedReports.length === 0 ||
                recipientEmails.length === 0 ||
                isEmailLoading
              }>
              <Send className='w-4 h-4 mr-2' />
              {isEmailLoading ? 'Sending...' : 'Send Reports'}
            </Button>
          </div>
        </div>
      )}

      <HearingScreeningDetailsModal
        isOpen={isDetailsModalOpen}
        onClose={() => setIsDetailsModalOpen(false)}
        screening={selectedScreeningForDetails}
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

// Hearing Screenings Table Component
const HearingScreeningsTable = ({
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
  const { data: screeningsData, isLoading, error } = useHearingScreeningsByStudent(studentId)

  // Get hearing screenings for the student
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
        No hearing screenings found for this student.
      </div>
    )
  }

  const formatValue = (
    value: number | null | undefined,
    result: string | null | undefined,
    unit: string
  ) => {
    if (result === 'Immeasurable' || value === null || value === undefined) {
      return 'Immeasurable'
    }
    return `${value} ${unit}`
  }

  const getResultBadgeColor = (result: string | null | undefined) => {
    if (!result || result === '-') return ''
    const normalizedResult = result.toLowerCase()
    if (normalizedResult === 'normal') return 'bg-green-100 text-green-800 border-green-200'
    if (normalizedResult === 'high' || normalizedResult === 'low')
      return 'bg-yellow-100 text-yellow-800 border-yellow-200'
    if (normalizedResult === 'immeasurable') return 'bg-gray-100 text-gray-600 border-gray-200'
    return 'bg-gray-100 text-gray-600 border-gray-200'
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
                <TableHead className='w-1/6 min-w-[120px]'>Screener</TableHead>
                <TableHead className='min-w-[200px]'>Right Ear</TableHead>
                <TableHead className='min-w-[200px]'>Left Ear</TableHead>
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
                      <div className='text-sm text-gray-600'>
                        <p>
                          <span className='font-medium'>Screener:</span> {screening.screener}
                        </p>
                      </div>
                      <div className='space-y-2'>
                        <div className='text-xs'>
                          <span className='font-medium'>Right Ear:</span>
                          <div className='mt-1 space-y-1'>
                            <p>
                              Vol:{' '}
                              {formatValue(
                                screening.right_volume_db,
                                screening.right_ear_volume_result,
                                'ml'
                              )}
                            </p>
                            <p>
                              Comp:{' '}
                              {formatValue(
                                screening.right_compliance,
                                screening.right_ear_compliance_result,
                                'ml'
                              )}
                            </p>
                            <p>
                              Press:{' '}
                              {formatValue(
                                screening.right_pressure,
                                screening.right_ear_pressure_result,
                                'daPa'
                              )}
                            </p>
                          </div>
                        </div>
                        <div className='text-xs'>
                          <span className='font-medium'>Left Ear:</span>
                          <div className='mt-1 space-y-1'>
                            <p>
                              Vol:{' '}
                              {formatValue(
                                screening.left_volume_db,
                                screening.left_ear_volume_result,
                                'ml'
                              )}
                            </p>
                            <p>
                              Comp:{' '}
                              {formatValue(
                                screening.left_compliance,
                                screening.left_ear_compliance_result,
                                'ml'
                              )}
                            </p>
                            <p>
                              Press:{' '}
                              {formatValue(
                                screening.left_pressure,
                                screening.left_ear_pressure_result,
                                'daPa'
                              )}
                            </p>
                          </div>
                        </div>
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
                    <div className='truncate' title={screening.screener}>
                      {screening.screener}
                    </div>
                  </TableCell>
                  <TableCell className='py-4 px-4'>
                    <div className='space-y-1 text-xs'>
                      <div className='flex items-center gap-2'>
                        <span className='font-medium text-blue-700'>Vol:</span>
                        <span>
                          {formatValue(
                            screening.right_volume_db,
                            screening.right_ear_volume_result,
                            'ml'
                          )}
                        </span>
                        <Badge
                          className={`text-xs ${getResultBadgeColor(
                            screening.right_ear_volume_result
                          )}`}>
                          {screening.right_ear_volume_result || '-'}
                        </Badge>
                      </div>
                      <div className='flex items-center gap-2'>
                        <span className='font-medium text-purple-700'>Comp:</span>
                        <span>
                          {formatValue(
                            screening.right_compliance,
                            screening.right_ear_compliance_result,
                            'ml'
                          )}
                        </span>
                        <Badge
                          className={`text-xs ${getResultBadgeColor(
                            screening.right_ear_compliance_result
                          )}`}>
                          {screening.right_ear_compliance_result || '-'}
                        </Badge>
                      </div>
                      <div className='flex items-center gap-2'>
                        <span className='font-medium text-teal-700'>Press:</span>
                        <span>
                          {formatValue(
                            screening.right_pressure,
                            screening.right_ear_pressure_result,
                            'daPa'
                          )}
                        </span>
                        <Badge
                          className={`text-xs ${getResultBadgeColor(
                            screening.right_ear_pressure_result
                          )}`}>
                          {screening.right_ear_pressure_result || '-'}
                        </Badge>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className='py-4 px-4'>
                    <div className='space-y-1 text-xs'>
                      <div className='flex items-center gap-2'>
                        <span className='font-medium text-blue-700'>Vol:</span>
                        <span>
                          {formatValue(
                            screening.left_volume_db,
                            screening.left_ear_volume_result,
                            'ml'
                          )}
                        </span>
                        <Badge
                          className={`text-xs ${getResultBadgeColor(
                            screening.left_ear_volume_result
                          )}`}>
                          {screening.left_ear_volume_result || '-'}
                        </Badge>
                      </div>
                      <div className='flex items-center gap-2'>
                        <span className='font-medium text-purple-700'>Comp:</span>
                        <span>
                          {formatValue(
                            screening.left_compliance,
                            screening.left_ear_compliance_result,
                            'ml'
                          )}
                        </span>
                        <Badge
                          className={`text-xs ${getResultBadgeColor(
                            screening.left_ear_compliance_result
                          )}`}>
                          {screening.left_ear_compliance_result || '-'}
                        </Badge>
                      </div>
                      <div className='flex items-center gap-2'>
                        <span className='font-medium text-teal-700'>Press:</span>
                        <span>
                          {formatValue(
                            screening.left_pressure,
                            screening.left_ear_pressure_result,
                            'daPa'
                          )}
                        </span>
                        <Badge
                          className={`text-xs ${getResultBadgeColor(
                            screening.left_ear_pressure_result
                          )}`}>
                          {screening.left_ear_pressure_result || '-'}
                        </Badge>
                      </div>
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

export default HearingStudentReports
