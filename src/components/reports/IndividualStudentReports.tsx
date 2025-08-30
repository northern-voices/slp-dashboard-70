import React, { useState, useEffect } from 'react'
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
import { FileText, Volume2, CheckCircle, Target, Mail, User, Send, Eye } from 'lucide-react'
import { Student } from '@/types/database'
import { StudentService } from '@/services/studentService'
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
import { Checkbox } from '@/components/ui/checkbox'
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
  const [students, setStudents] = useState<Student[]>([])
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedReports, setSelectedReports] = useState<string[]>([])
  const [selectedScreenings, setSelectedScreenings] = useState<Screening[]>([])
  const [recipientEmail, setRecipientEmail] = useState('')
  const [customMessage, setCustomMessage] = useState('')
  const [isEmailLoading, setIsEmailLoading] = useState(false)
  const [selectedScreening, setSelectedScreening] = useState<Screening | null>(null)
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false)

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        setLoading(true)

        if (currentSchool) {
          const studentsData = await StudentService.getStudentsBySchool(currentSchool.id)
          setStudents(studentsData)
        } else {
          // if no school selected, show empty students
          setStudents([])
        }
      } catch (error) {
        console.error('Error fetching students:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchStudents()
  }, [])

  const handleGenerateReport = (reportType: string) => {
    if (!selectedStudent) {
      console.log('Cannot generate report: No student selected')
      return
    }
    console.log(`Generating ${reportType} for student:`, selectedStudent.id)
    // TODO: Implement individual report generation
  }

  const getStudentRoute = (subPath: string) => {
    if (currentSchool) {
      return `/school/${currentSchool.id}/students/${selectedStudent?.id}/${subPath}`
    }
    return `/students/${selectedStudent?.id}/${subPath}`
  }

  const getAvailableReports = () => {
    const baseReports = ['Goal Sheet', 'Progress Report']

    if (selectedScreenings.length > 0) {
      // Add screening-specific reports based on selected screenings
      const hasSpeechScreenings = selectedScreenings.some(
        s => s.screening_type === 'speech' || s.source_table === 'speech'
      )

      if (hasSpeechScreenings) baseReports.unshift('Speech Screen Report')
    }

    return baseReports
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
        selectedScreenings: selectedScreenings.map(s => ({
          id: s.id,
          date: s.created_at,
          type: s.screening_type,
        })),
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

  const handleStudentSelect = (studentId: string) => {
    const student = students.find(s => s.id === studentId)
    setSelectedStudent(student || null)
    setSelectedScreenings([]) // Clear selected screenings when student changes
  }

  const handleSelectScreening = (screening: Screening, checked: boolean) => {
    if (checked) {
      setSelectedScreenings(prev => [...prev, screening])
    } else {
      setSelectedScreenings(prev => prev.filter(s => s.id !== screening.id))
    }
  }

  const handleSelectAllScreenings = (checked: boolean) => {
    if (checked) {
      // We'll need to get the screenings data from the hook
      // For now, this will be handled by passing the screenings data down
    } else {
      setSelectedScreenings([])
    }
  }

  const handleViewDetails = (screening: Screening) => {
    setSelectedScreening(screening)
    setIsDetailsModalOpen(true)
  }

  if (loading) {
    return (
      <div className='flex items-center justify-center py-4'>
        <LoadingSpinner size='sm' className='mr-2' />
        <span className='text-sm text-gray-600'>Loading students...</span>
      </div>
    )
  }

  return (
    <>
      <div className='space-y-4'>
        {/* Student Selector */}
        <div className='space-y-2'>
          <label className='text-xl font-medium text-gray-700'>Select Student</label>
          <Select onValueChange={handleStudentSelect}>
            <SelectTrigger className='w-full'>
              <SelectValue placeholder='Choose a student...' />
            </SelectTrigger>
            <SelectContent className='bg-white'>
              {students.map(student => (
                <SelectItem key={student.id} value={student.id}>
                  <div className='flex items-center justify-between w-full'>
                    <span>
                      {student.first_name} {student.last_name}
                    </span>
                    <span className='text-sm text-gray-500 ml-2'>Grade {student.grade}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
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
                selectedScreenings={selectedScreenings}
                onSelectScreening={handleSelectScreening}
                onSelectAll={handleSelectAllScreenings}
                setSelectedScreenings={setSelectedScreenings}
                onViewDetails={handleViewDetails}
              />
            </div>
          )}
        </div>
      </div>

      {/* Email Section */}
      {selectedStudent && (
        <div className='mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200'>
          <h4 className='text-sm font-medium text-gray-700 mb-4 flex items-center gap-2'>
            <Mail className='w-4 h-4' />
            Send {selectedStudent.first_name}'s Reports
            {selectedScreenings.length > 0 && (
              <Badge variant='secondary' className='ml-2'>
                {selectedScreenings.length} screening{selectedScreenings.length !== 1 ? 's' : ''}{' '}
                selected
              </Badge>
            )}
          </h4>

          <div className='space-y-4'>
            {/* Report Selection */}
            <div className='space-y-3'>
              <Label className='text-sm font-medium'>Select Type of Report</Label>
              <div className='space-y-4'>
                {getAvailableReports().map(report => (
                  <div key={report} className='flex items-center space-x-2'>
                    <Checkbox
                      id={report}
                      checked={selectedReports.includes(report)}
                      onCheckedChange={checked => {
                        if (checked) {
                          setSelectedReports([...selectedReports, report])
                        } else {
                          setSelectedReports(selectedReports.filter(r => r !== report))
                        }
                      }}
                    />
                    <Label htmlFor={report} className='text-sm text-gray-700 cursor-pointer'>
                      {report}
                    </Label>
                  </div>
                ))}
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
                isEmailLoading
              }>
              <Send className='w-4 h-4 mr-2' />
              {isEmailLoading ? 'Sending...' : 'Send Reports via Email'}
            </Button>
          </div>
        </div>
      )}

      <ScreeningDetailsModal
        isOpen={isDetailsModalOpen}
        onClose={() => setIsDetailsModalOpen(false)}
        screening={selectedScreening}
      />
    </>
  )
}

// Speech Screenings Table Component
const SpeechScreeningsTable = ({
  studentId,
  selectedScreenings,
  onSelectScreening,
  onSelectAll,
  setSelectedScreenings,
  onViewDetails,
}: {
  studentId: string
  selectedScreenings: Screening[]
  onSelectScreening: (screening: Screening, checked: boolean) => void
  onSelectAll: (checked: boolean) => void
  setSelectedScreenings: React.Dispatch<React.SetStateAction<Screening[]>>
  onViewDetails: (screening: Screening) => void
}) => {
  const { data: screeningsData, isLoading, error } = useSpeechScreeningsByStudent(studentId)

  console.log(screeningsData, 'screeningsData')

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

  const isAllSelected =
    studentScreenings.length > 0 && selectedScreenings.length === studentScreenings.length
  const isSomeSelected = selectedScreenings.length > 0

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedScreenings([...studentScreenings])
    } else {
      setSelectedScreenings([])
    }
  }

  return (
    <div className='bg-white rounded-lg border border-gray-200 overflow-hidden'>
      {/* Table Header */}
      <div className='bg-gray-50 border-b border-gray-200 px-6 py-3'>
        <div className='flex items-center justify-between'>
          <div className='flex items-center gap-3'>
            <span className='text-sm font-medium text-gray-900'>Select Screenings</span>
          </div>
          <div className='flex items-center gap-3'>
            <div className='flex items-center gap-2'>
              <span className='text-sm text-gray-600'>Selected:</span>
              <Badge
                variant='secondary'
                className='bg-blue-100 text-blue-800 border-blue-200 font-medium w-9 text-center flex items-center justify-center'>
                {selectedScreenings.length}
              </Badge>
            </div>
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
              disabled={selectedScreenings.length === 0}
              onClick={() => setSelectedScreenings([])}
              className='h-7 text-xs ml-2'>
              Clear Selection
            </Button>
          </div>
        </div>
      </div>

      <div className='max-h-96 overflow-y-auto'>
        <ResponsiveTable className='w-full'>
          <TableHeader>
            <tr>
              <TableHead className='w-12'>
                <Checkbox checked={isAllSelected} onCheckedChange={handleSelectAll} />
              </TableHead>
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
                        <Checkbox
                          checked={selectedScreenings.some(s => s.id === screening.id)}
                          onCheckedChange={checked =>
                            onSelectScreening(screening, checked as boolean)
                          }
                        />
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
                  <Checkbox
                    className='mt-1.5'
                    checked={selectedScreenings.some(s => s.id === screening.id)}
                    onCheckedChange={checked => onSelectScreening(screening, checked as boolean)}
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
      </div>
    </div>
  )
}

export default IndividualStudentReports
