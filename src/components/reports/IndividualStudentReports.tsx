import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip'
import { useOrganization } from '@/contexts/OrganizationContext'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import StudentSearchSelector from '@/components/screening/StudentSearchSelector'
import {
  FileText,
  Volume2,
  CheckCircle,
  Target,
  Mail,
  User,
  Send,
  Eye,
  TrendingUp,
  BookOpen,
} from 'lucide-react'
import { Student } from '@/types/database'
import LoadingSpinner from '@/components/common/LoadingSpinner'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import Multiselect from '@/components/ui/multiselect'
import { useSpeechScreeningsByStudent } from '@/hooks/screenings/use-screenings'
import { Screening } from '@/types/database'
import { format } from 'date-fns'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
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

const IndividualStudentReports = () => {
  const navigate = useNavigate()
  const { currentSchool } = useOrganization()

  // Custom CSS to remove the blue outline from the select component
  React.useEffect(() => {
    const style = document.createElement('style')
    style.textContent = `
      .no-select-outline {
        outline: none !important;
        box-shadow: none !important;
      }
      .no-select-outline:focus {
        outline: none !important;
        box-shadow: none !important;
      }
      .no-select-outline[data-state="open"] {
        outline: none !important;
        box-shadow: none !important;
      }
      .no-select-outline[data-state="closed"] {
        outline: none !important;
        box-shadow: none !important;
      }
    `
    document.head.appendChild(style)

    return () => {
      document.head.removeChild(style)
    }
  }, [])
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

  const handleGenerateReport = (reportType: string) => {
    if (!selectedStudent) {
      console.log('Cannot generate report: No student selected')
      return
    }
    console.log(`Generating ${reportType} for student:`, selectedStudent.id)
    // TODO: Implement individual report generation
  }

  const getAvailableReports = () => {
    return [
      {
        value: 'progress-report',
        label: 'Progress Report',
        description: 'Comprehensive progress summary showing achievements and therapy outcomes',
        icon: TrendingUp,
      },
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

  const handleSendEmail = async () => {
    if (!recipientEmail || selectedReports.length === 0) {
      return
    }

    setIsEmailLoading(true)

    try {
      // Simulate email sending
      console.log('Sending individual reports email:', {
        student: selectedStudent,
        recipient: recipientEmail,
        reports: selectedReports,
        selectedScreening: selectedScreening
          ? {
              id: selectedScreening.id,
              date: selectedScreening.created_at,
              type: selectedScreening.screening_type,
            }
          : null,
        message: customMessage,
      })

      // TODO: Implement actual email sending logic
      await new Promise(resolve => setTimeout(resolve, 1000))

      // Reset form
      setSelectedReports([])
      setRecipientEmail('')
      setCustomMessage('')
    } catch (error) {
      console.error('Error sending email:', error)
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
          <div className='p-3 bg-purple-50 rounded-lg border border-purple-200'>
            <div className='flex items-center gap-2'>
              <User className='w-4 h-4 text-purple-600' />
              <span className='font-medium text-purple-900'>
                {selectedStudent.first_name} {selectedStudent.last_name}
              </span>
              <span className='text-sm text-purple-700'>Grade {selectedStudent.grade}</span>
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
              <div className='grid grid-cols-1 lg:grid-cols-3 gap-3'>
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

              {/* <div className='space-y-1'>
                <Label htmlFor='subject' className='text-sm font-medium'>
                  Subject
                </Label>
                <Input
                  id='subject'
                  value={`Reports for ${selectedStudent.first_name} ${selectedStudent.last_name}`}
                  disabled
                  className='bg-gray-50 h-9'
                />
              </div>

              <div className='space-y-1'>
                <Label htmlFor='message' className='text-sm font-medium'>
                  Custom Message (Optional)
                </Label>
                <Textarea
                  id='message'
                  placeholder='Add a personal message to include with the reports...'
                  value={customMessage}
                  onChange={e => setCustomMessage(e.target.value)}
                  rows={3}
                  className='text-sm'
                />
              </div> */}
            </div>
          </div>

          {/* Send Reports */}
          <div className='mt-6'>
            <Button
              onClick={() => handleSendEmail()}
              variant='default'
              size='sm'
              className='w-full h-9 bg-purple-600 hover:bg-purple-700 text-white'
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

    const resultConfig = {
      absent: { label: 'Absent', color: 'bg-gray-100 text-gray-800' },
      age_appropriate: { label: 'Age Appropriate', color: 'bg-green-100 text-green-800' },
      complex_needs: { label: 'Complex Needs', color: 'bg-purple-100 text-purple-800' },
      mild: { label: 'Mild', color: 'bg-yellow-100 text-yellow-800' },
      mild_moderate: { label: 'Mild Moderate', color: 'bg-yellow-100 text-yellow-800' },
      moderate: { label: 'Moderate', color: 'bg-orange-100 text-orange-800' },
      monitor: { label: 'Monitor', color: 'bg-yellow-100 text-yellow-800' },
      non_registered_no_consent: {
        label: 'No Consent',
        color: 'bg-red-100 text-red-800',
      },
      passed: { label: 'Passed', color: 'bg-green-100 text-green-800' },
      pass: { label: 'Pass', color: 'bg-green-100 text-green-800' },
      fail: { label: 'Fail', color: 'bg-red-100 text-red-800' },
      refer: { label: 'Refer', color: 'bg-yellow-100 text-yellow-800' },
      profound: { label: 'Profound', color: 'bg-red-100 text-red-800' },
      severe: { label: 'Severe', color: 'bg-red-100 text-red-800' },
      severe_profound: { label: 'Severe Profound', color: 'bg-red-100 text-red-800' },
      unable_to_screen: { label: 'Unable to Screen', color: 'bg-gray-100 text-gray-800' },
    }

    const config = resultConfig[result.toLowerCase() as keyof typeof resultConfig]
    if (!config) return <Badge variant='secondary'>{result}</Badge>

    return <Badge className={`${config.color} font-medium`}>{config.label}</Badge>
  }

  const getQualificationBadge = (screening: Screening) => {
    const qualifies = screening.error_patterns?.screening_metadata?.qualifies_for_speech_program

    if (qualifies === undefined || qualifies === null) {
      return <Badge className='bg-gray-100 text-gray-800 font-medium'>Not Set</Badge>
    }

    if (qualifies) {
      return <Badge className='bg-green-100 text-green-800 font-medium'>Program</Badge>
    } else {
      return <Badge className='bg-red-100 text-red-800 font-medium'>Not In Program</Badge>
    }
  }

  return (
    <div className='bg-white rounded-lg border border-gray-200 overflow-hidden'>
      {/* Table Header */}
      <div className='bg-gray-50 border-b border-gray-200 px-6 py-3'>
        <div className='flex items-center justify-between'>
          <div className='flex items-center gap-3'>
            <span className='text-sm font-medium text-gray-900'>Select a Screening</span>
          </div>
          <div className='flex items-center gap-3'>
            <div className='flex items-center gap-2'>
              <span className='text-sm text-gray-600'>Total:</span>
              <Badge
                variant='outline'
                className='bg-gray-50 text-gray-700 border-gray-300 font-medium w-9 text-center flex items-center justify-center'>
                {studentScreenings.length}
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

export default IndividualStudentReports
