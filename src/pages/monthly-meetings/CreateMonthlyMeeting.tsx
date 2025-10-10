import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar'
import AppSidebar from '@/components/AppSidebar'
import Header from '@/components/Header'
import { useOrganization } from '@/contexts/OrganizationContext'
import { Button } from '@/components/ui/button'
import { ChevronLeft, Calendar } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { useToast } from '@/hooks/use-toast'
import { useCreateMonthlyMeeting } from '@/hooks/monthly-meetings/use-monthly-meetings-mutations'
import { useStudentsBySchool } from '@/hooks/students/use-students'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  ResponsiveTable,
  ResponsiveTableRow,
  TableHeader,
  TableHead,
  TableBody,
  TableCell,
} from '@/components/ui/responsive-table'
import { Badge } from '@/components/ui/badge'

const CreateMonthlyMeetingContent = () => {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const navigate = useNavigate()
  const { toast } = useToast()
  const { userProfile, currentSchool } = useOrganization()

  const createMonthlyMeetings = useCreateMonthlyMeeting()
  const { data: students = [], isLoading: isLoadingStudents } = useStudentsBySchool(
    currentSchool?.id
  )

  // Temporary facilitator data
  const facilitators = [
    { id: '1', name: 'Lisa Brillinger' },
    { id: '2', name: 'Cheryl Mullner' },
    { id: '3', name: 'Danielle Ewanus' },
    { id: '4', name: 'Emily Davis' },
  ]

  const [formData, setFormData] = useState({
    meeting_title: '',
    student_id: '',
    meeting_facilitator: '',
    attendees: '',
    meeting_date: new Date().toISOString().split('T')[0],
    sessions_attended: null as number | null,
    meeting_notes: '',
    additional_notes: '',
  })

  const userRole = userProfile?.role || 'slp'
  const userName = userProfile
    ? `${userProfile.first_name} ${userProfile.last_name}`
    : 'Dr. Sarah Johnson'

  // Helper function to get program status from latest speech screening
  const getProgramStatus = (student): string => {
    const speechScreenings = student.speech_screenings || []
    if (speechScreenings.length === 0) {
      return 'no_screening'
    }

    // Get most recent screening - create a copy to avoid mutating the original array
    const mostRecent = [...speechScreenings].sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    )[0]

    if (!mostRecent?.error_patterns) {
      return 'not_set'
    }

    try {
      const errorPatterns =
        typeof mostRecent.error_patterns === 'string'
          ? JSON.parse(mostRecent.error_patterns)
          : mostRecent.error_patterns

      const qualifies = errorPatterns?.screening_metadata?.qualifies_for_speech_program
      const sub = errorPatterns?.screening_metadata?.sub
      const graduated = errorPatterns?.screening_metadata?.graduated

      if (qualifies === undefined && sub === undefined && graduated === undefined) {
        return 'not_set'
      }

      if (graduated) return 'graduated'
      if (sub) return 'sub'
      if (qualifies) return 'qualifies'
      return 'not_in_program'
    } catch (e) {
      console.error('Error parsing error_patterns:', e)
      return 'not_set'
    }
  }

  // Helper function to render program status badge
  const getQualificationBadge = student => {
    const programStatus = getProgramStatus(student)

    switch (programStatus) {
      case 'no_screening':
        return (
          <Badge className='bg-gray-100 text-gray-800 font-medium text-[10px]'>No Screening</Badge>
        )
      case 'not_set':
        return <Badge className='bg-gray-100 text-gray-800 font-medium text-[10px]'>Not Set</Badge>
      case 'graduated':
        return (
          <Badge className='bg-blue-100 text-blue-800 font-medium text-[10px]'>Graduated</Badge>
        )
      case 'sub':
        return <Badge className='bg-orange-100 text-orange-800 font-medium text-[10px]'>Sub</Badge>
      case 'qualifies':
        return <Badge className='bg-red-100 text-red-800 font-medium text-[10px]'>Qualifies</Badge>
      case 'not_in_program':
        return (
          <Badge className='bg-green-100 text-green-800 font-medium text-[10px]'>
            Not In Program
          </Badge>
        )
      default:
        return <Badge className='bg-gray-100 text-gray-800 font-medium text-[10px]'>Error</Badge>
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSubmitting(true)

    // Validate meeting title
    if (!formData.meeting_title.trim()) {
      toast({
        title: 'Validation Error',
        description: 'Meeting title cannot be empty.',
        variant: 'destructive',
      })
      setIsSubmitting(false)
      return
    }

    // Validate attendees
    if (!formData.attendees.trim()) {
      toast({
        title: 'Validation Error',
        description: 'Attendees cannot be empty.',
        variant: 'destructive',
      })
      setIsSubmitting(false)
      return
    }

    // Validate attendees format (must be comma-separated)
    const attendeesList = formData.attendees
      .split(',')
      .map(a => a.trim())
      .filter(a => a.length > 0)

    if (attendeesList.length === 0) {
      toast({
        title: 'Validation Error',
        description: 'Please provide at least one attendee.',
        variant: 'destructive',
      })
      setIsSubmitting(false)
      return
    }

    // Validate sessions attended
    if (formData.sessions_attended !== null && formData.sessions_attended < 0) {
      toast({
        title: 'Validation Error',
        description: 'Sessions attended cannot be less than 0.',
        variant: 'destructive',
      })
      setIsSubmitting(false)
      return
    }

    // Convert attendees string to array
    const submitData = {
      meeting_title: formData.meeting_title.trim(),
      student_id: formData.student_id || null,
      meeting_facilitator: formData.meeting_facilitator || null,
      attendees: attendeesList,
      meeting_date: formData.meeting_date,
      sessions_attended: formData.sessions_attended,
      meeting_notes: formData.meeting_notes || null,
      additional_notes: formData.additional_notes || null,
    }

    createMonthlyMeetings.mutate(submitData, {
      onSuccess: () => {
        toast({
          title: 'Monthly Meeting Created',
          description: 'The monthly meeting has been successfully scheduled.',
        })

        // Navigate back to monthly meetings page
        if (currentSchool?.id) {
          navigate(`/school/${currentSchool.id}/monthly-meetings`)
        } else {
          navigate('/monthly-meetings')
        }
        setIsSubmitting(false)
      },
      onError: error => {
        console.error('Failed to create monthly meeting:', error)
        toast({
          title: 'Error',
          description: 'Failed to create the monthly meeting. Please try again.',
          variant: 'destructive',
        })
        setIsSubmitting(false)
      },
    })
  }

  const handleCancel = () => {
    if (currentSchool?.id) {
      navigate(`/school/${currentSchool.id}/monthly-meetings`)
    } else {
      navigate('/monthly-meetings')
    }
  }

  return (
    <SidebarProvider>
      <div className='min-h-screen flex w-full'>
        <AppSidebar />
        <SidebarInset>
          <Header userRole={userRole} userName={userName} />
          <div className='flex-1 bg-gray-25 p-4 md:p-6 lg:p-8'>
            <div className='max-w-4xl mx-auto'>
              <div className='flex items-center gap-4 mb-6'>
                <Button
                  variant='ghost'
                  size='sm'
                  onClick={handleCancel}
                  className='text-gray-600 hover:text-gray-900'>
                  <ChevronLeft className='w-4 h-4 mr-1' />
                  Back to Monthly Meetings
                </Button>
                <div className='h-4 w-px bg-gray-300' />
                <h1 className='text-2xl font-semibold text-gray-900'>Create Monthly Meeting</h1>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle className='flex items-center gap-2'>
                    <Calendar className='w-5 h-5 text-blue-600' />
                    Meeting Details
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className='space-y-6'>
                    <div className='space-y-4'>
                      <div className='grid grid-cols-3 gap-4'>
                        <div className='space-y-2 col-span-2'>
                          <Label htmlFor='meeting_title'>Meeting Title *</Label>
                          <Input
                            id='meeting_title'
                            name='meeting_title'
                            value={formData.meeting_title}
                            onChange={handleInputChange}
                            placeholder='e.g., October Monthly Progress Review'
                            required
                          />
                        </div>
                        <div className='space-y-2'>
                          <Label htmlFor='meeting_date'>Date *</Label>
                          <Input
                            id='meeting_date'
                            name='meeting_date'
                            type='date'
                            value={formData.meeting_date}
                            onChange={handleInputChange}
                            required
                          />
                        </div>
                      </div>

                      {/* <div className='space-y-2'>
                        <Label htmlFor='student_id'>Student ID *</Label>
                        <Input
                          id='student_id'
                          name='student_id'
                          value={formData.student_id}
                          onChange={handleInputChange}
                          placeholder='Enter student ID'
                          required
                        />
                      </div> */}

                      <div className='space-y-2'>
                        <Label htmlFor='meeting_facilitator'>Meeting Facilitator</Label>
                        <Select
                          value={formData.meeting_facilitator}
                          onValueChange={value =>
                            setFormData(prev => ({ ...prev, meeting_facilitator: value }))
                          }>
                          <SelectTrigger>
                            <SelectValue placeholder='Select a facilitator' />
                          </SelectTrigger>
                          <SelectContent>
                            {facilitators.map(facilitator => (
                              <SelectItem key={facilitator.id} value={facilitator.id}>
                                {facilitator.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className='space-y-2'>
                        <Label htmlFor='attendees'>Attendees *</Label>
                        <Input
                          id='attendees'
                          name='attendees'
                          value={formData.attendees}
                          onChange={handleInputChange}
                          placeholder='e.g. Lisa Brillinger, Cheryl Mullner, Danielle Ewanus'
                          required
                        />
                        <p className='text-sm text-gray-500'>
                          Separate multiple attendees with commas
                        </p>
                      </div>

                      {/* Students Table Section */}
                      <div className='space-y-2'>
                        <Label>Students</Label>
                        <div className='bg-white rounded-lg border border-gray-200 overflow-hidden'>
                          {isLoadingStudents ? (
                            <div className='flex items-center justify-center py-8'>
                              <div className='text-center'>
                                <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4'></div>
                                <p className='text-gray-600 text-sm'>Loading students...</p>
                              </div>
                            </div>
                          ) : students.length > 0 ? (
                            <ResponsiveTable className='w-full'>
                              <TableHeader>
                                <tr>
                                  <TableHead className='w-1/3 min-w-[200px]'>Name</TableHead>
                                  <TableHead className='w-1/6 min-w-[100px]'>Grade</TableHead>
                                  <TableHead className='w-1/4 min-w-[150px]'>Program Status</TableHead>
                                  <TableHead className='w-1/6 min-w-[120px]'>Date Created</TableHead>
                                </tr>
                              </TableHeader>
                              <TableBody>
                                {students.map(student => (
                                  <ResponsiveTableRow key={student.id}>
                                    <TableCell>
                                      {student.first_name} {student.last_name}
                                    </TableCell>
                                    <TableCell>{student.grade || 'N/A'}</TableCell>
                                    <TableCell>{getQualificationBadge(student)}</TableCell>
                                    <TableCell>
                                      {new Date(student.created_at).toLocaleDateString('en-US', {
                                        month: 'short',
                                        day: 'numeric',
                                        year: 'numeric',
                                      })}
                                    </TableCell>
                                  </ResponsiveTableRow>
                                ))}
                              </TableBody>
                            </ResponsiveTable>
                          ) : (
                            <div className='text-center py-8 text-gray-500 text-sm'>
                              No students found for this school.
                            </div>
                          )}
                        </div>
                      </div>

                      <div className='space-y-2'>
                        <Label htmlFor='sessions_attended'>Sessions Attended</Label>
                        <Input
                          id='sessions_attended'
                          name='sessions_attended'
                          type='number'
                          min='0'
                          value={formData.sessions_attended ?? ''}
                          onChange={e => {
                            const value = e.target.value === '' ? null : parseInt(e.target.value)
                            setFormData(prev => ({ ...prev, sessions_attended: value }))
                          }}
                          placeholder='Enter number of sessions attended'
                        />
                      </div>

                      <div className='space-y-2'>
                        <Label htmlFor='meeting_notes'>Meeting Notes</Label>
                        <Textarea
                          id='meeting_notes'
                          name='meeting_notes'
                          value={formData.meeting_notes}
                          onChange={handleInputChange}
                          placeholder='Meeting notes topics to discussed...'
                          rows={4}
                        />
                      </div>

                      <div className='space-y-2'>
                        <Label htmlFor='additional_notes'>Additional Notes</Label>
                        <Textarea
                          id='additional_notes'
                          name='additional_notes'
                          value={formData.additional_notes}
                          onChange={handleInputChange}
                          placeholder='Additional notes to be added...'
                          rows={4}
                        />
                      </div>
                    </div>

                    <div className='flex justify-end gap-3 pt-4'>
                      <Button
                        type='button'
                        variant='outline'
                        onClick={handleCancel}
                        disabled={isSubmitting}>
                        Cancel
                      </Button>
                      <Button
                        type='submit'
                        className='bg-blue-600 hover:bg-blue-700'
                        disabled={isSubmitting}>
                        {isSubmitting ? 'Creating...' : 'Create Meeting'}
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            </div>
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  )
}

const CreateMonthlyMeeting = () => {
  return <CreateMonthlyMeetingContent />
}

export default CreateMonthlyMeeting
