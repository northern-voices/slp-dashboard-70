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
import { FileText, Volume2, CheckCircle, Target, Mail, User, Send } from 'lucide-react'
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
      const hasHearingScreenings = selectedScreenings.some(
        s => s.screening_type === 'hearing' || s.source_table === 'hearing'
      )

      if (hasSpeechScreenings) baseReports.unshift('Speech Screen Report')
      if (hasHearingScreenings) baseReports.unshift('Hearing Screen Report')
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
              <div className='flex items-center justify-between'>
                <h3 className='text-xl font-medium text-gray-700'>Screenings</h3>
                {selectedScreenings.length > 0 && (
                  <div className='flex items-center gap-2'>
                    <span className='text-sm text-gray-600'>
                      {selectedScreenings.length} screening
                      {selectedScreenings.length !== 1 ? 's' : ''} selected
                    </span>
                    <Button
                      variant='outline'
                      size='sm'
                      onClick={() => setSelectedScreenings([])}
                      className='h-7 text-xs'>
                      Clear Selection
                    </Button>
                  </div>
                )}
              </div>
              <SpeechScreeningsTable
                studentId={selectedStudent.id}
                selectedScreenings={selectedScreenings}
                onSelectScreening={handleSelectScreening}
                onSelectAll={handleSelectAllScreenings}
                setSelectedScreenings={setSelectedScreenings}
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
            <div className='space-y-2'>
              <Label className='text-sm font-medium'>Select Reports to Send</Label>
              <Multiselect
                options={getAvailableReports()}
                selected={selectedReports}
                onChange={setSelectedReports}
                placeholder='Select reports to send...'
                searchPlaceholder='Search reports...'
                emptyMessage='No reports found.'
              />
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
}: {
  studentId: string
  selectedScreenings: Screening[]
  onSelectScreening: (screening: Screening, checked: boolean) => void
  onSelectAll: (checked: boolean) => void
  setSelectedScreenings: React.Dispatch<React.SetStateAction<Screening[]>>
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

    switch (result.toLowerCase()) {
      case 'pass':
        return <Badge className='bg-green-100 text-green-800'>Pass</Badge>
      case 'fail':
        return <Badge className='bg-red-100 text-red-800'>Fail</Badge>
      case 'refer':
        return <Badge className='bg-yellow-100 text-yellow-800'>Refer</Badge>
      default:
        return <Badge variant='secondary'>{result}</Badge>
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
    <Card>
      <CardHeader className='pb-3'>
        <div className='flex items-center justify-between'>
          <div className='flex items-center gap-3'>
            <Checkbox checked={isAllSelected} onCheckedChange={handleSelectAll} className='mt-1' />
            <CardTitle className='text-sm font-medium'>Choose screenings</CardTitle>
          </div>
          <div className='flex items-center gap-2'>
            <Badge variant='outline' className='text-xs'>
              {selectedScreenings.length} selected
            </Badge>
            <Badge variant='outline' className='text-xs'>
              {studentScreenings.length} total
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className='max-h-96 overflow-y-auto space-y-3 pr-2'>
          {studentScreenings.map(screening => (
            <div
              key={screening.id}
              className='flex items-center gap-3 p-3 border rounded-lg hover:bg-gray-50 transition-colors'>
              <Checkbox
                checked={selectedScreenings.some(s => s.id === screening.id)}
                onCheckedChange={checked => onSelectScreening(screening, checked as boolean)}
                className='mt-1'
              />
              <div className='flex-1'>
                <div className='flex items-center gap-3 flex-wrap'>
                  <div className='text-sm font-medium text-gray-900'>
                    {format(new Date(screening.created_at), 'MMM dd, yyyy')}
                  </div>
                  {getResultBadge(screening.result || screening.screening_result)}
                  <div className='text-sm text-gray-600'>Screener: {screening.screener}</div>
                  {screening.grade && (
                    <div className='text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded'>
                      {screening.grade}
                    </div>
                  )}
                </div>
                {screening.clinical_notes && (
                  <div className='text-xs text-gray-500 mt-2 line-clamp-2'>
                    {screening.clinical_notes}
                  </div>
                )}
                {screening.vocabulary_support && (
                  <div className='text-xs text-blue-600 mt-1 flex items-center gap-1'>
                    <CheckCircle className='w-3 h-3' />
                    Vocabulary support provided
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

export default IndividualStudentReports
