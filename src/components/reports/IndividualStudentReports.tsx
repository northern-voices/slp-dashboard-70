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

const IndividualStudentReports = () => {
  const navigate = useNavigate()
  const { currentSchool } = useOrganization()
  const [students, setStudents] = useState<Student[]>([])
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedReports, setSelectedReports] = useState<string[]>([])
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

  const availableReports = [
    'Hearing Screen Report',
    'Speech Screen Report',
    'Goal Sheet',
    'Progress Report',
  ]

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
          <label className='text-sm font-medium text-gray-700'>Select Student</label>
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

        {/* Report Options */}
        <div className='space-y-3'>
          {/* Student Individual Tools */}
          {/* s<div className='space-y-2'>
            <h4 className='text-sm font-medium text-gray-700'>Student Tools</h4>
            <div className='grid grid-cols-1 gap-2'>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    onClick={() => {
                      if (selectedStudent) {
                        navigate(getStudentRoute('progress-check'))
                      }
                    }}
                    variant='outline'
                    size='sm'
                    className='w-full justify-start h-9 text-sm'
                    disabled={!selectedStudent}>
                    <CheckCircle className='w-4 h-4 mr-2' />
                    Generate Progress Report
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Track and document student's monthly therapy progress</p>
                </TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    onClick={() => {
                      if (selectedStudent) {
                        navigate(getStudentRoute('goal-sheet'))
                      }
                    }}
                    variant='outline'
                    size='sm'
                    className='w-full justify-start h-9 text-sm'
                    disabled={!selectedStudent}>
                    <Target className='w-4 h-4 mr-2' />
                    Generate Goal Sheet
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Create individualized therapy goals and objectives</p>
                </TooltipContent>
              </Tooltip>
            </div>
          </div> */}

          {/* Speech Reports */}
          <div className='space-y-2'>
            <h4 className='text-sm font-medium text-gray-700'>Speech Reports</h4>
            <div className='grid grid-cols-1 gap-2'>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    onClick={() => handleGenerateReport('speech-screen')}
                    variant='outline'
                    size='sm'
                    className='w-full justify-start h-9 text-sm'
                    disabled={!selectedStudent}>
                    <FileText className='w-4 h-4 mr-2' />
                    Speech Screen Report
                  </Button>
                </TooltipTrigger>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    onClick={() => handleGenerateReport('progress-report')}
                    variant='outline'
                    size='sm'
                    className='w-full justify-start h-9 text-sm'
                    disabled={!selectedStudent}>
                    <FileText className='w-4 h-4 mr-2' />
                    Progress Report
                  </Button>
                </TooltipTrigger>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    onClick={() => handleGenerateReport('goal-sheet')}
                    variant='outline'
                    size='sm'
                    className='w-full justify-start h-9 text-sm'
                    disabled={!selectedStudent}>
                    <FileText className='w-4 h-4 mr-2' />
                    Student Goal Sheet
                  </Button>
                </TooltipTrigger>
              </Tooltip>
            </div>
          </div>
        </div>
      </div>

      {/* Email Section */}
      {selectedStudent && (
        <div className='mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200'>
          <h4 className='text-sm font-medium text-gray-700 mb-4 flex items-center gap-2'>
            <Mail className='w-4 h-4' />
            Send {selectedStudent.first_name}'s Reports
          </h4>

          <div className='space-y-4'>
            {/* Report Selection */}
            <div className='space-y-2'>
              <Label className='text-sm font-medium'>Select Reports to Send</Label>
              <Multiselect
                options={availableReports}
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
                  className='h-9'
                />
              </div>

              <div className='space-y-1'>
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
              </div>
            </div>
          </div>

          {/* Send Reports */}
          <div className='pt-2 border-t border-gray-200'>
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

export default IndividualStudentReports
