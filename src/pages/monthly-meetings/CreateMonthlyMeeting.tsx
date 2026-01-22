import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar'
import AppSidebar from '@/components/AppSidebar'
import Header from '@/components/Header'
import { useOrganization } from '@/contexts/OrganizationContext'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { ChevronLeft, Calendar, X, Eye, User } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { useToast } from '@/hooks/use-toast'
import { useCreateMonthlyMeeting } from '@/hooks/monthly-meetings/use-monthly-meetings-mutations'
import { useStudentsBySchool } from '@/hooks/students/use-students'
import { useGetUsers } from '@/hooks/users/use-users'
import { useSpeechScreeningsByStudent } from '@/hooks/screenings'
import ScreeningDetailsModal from '@/components/students/screening-history/ScreeningDetailsModal'
import LastScreeningCard from '@/components/monthly-meetings/LastScreeningCard'
import { GRADE_MAPPING } from '@/constants/app'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import MonthlyMeetingsStudentTable from '@/components/monthly-meetings/MonthlyMeetingStudentTable'

const CreateMonthlyMeetingContent = () => {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showStudentModal, setShowStudentModal] = useState(false)
  const [selectedStudent, setSelectedStudent] = useState(null)
  const [studentData, setStudentData] = useState<
    Record<string, { sessions_attended: number | null; meeting_notes: string }>
  >({})
  const [attendeeInput, setAttendeeInput] = useState('')
  const [showScreeningModal, setShowScreeningModal] = useState(false)

  const navigate = useNavigate()
  const { toast } = useToast()
  const { userProfile, currentSchool } = useOrganization()

  const createMonthlyMeetings = useCreateMonthlyMeeting()
  const { data: students = [], isLoading: isLoadingStudents } = useStudentsBySchool(
    currentSchool?.id,
  )
  const { data: users = [], isLoading: isLoadingUsers } = useGetUsers()
  const { user } = useAuth()

  const [formData, setFormData] = useState({
    meeting_title: (() => {
      const today = new Date()
      const monthName = today.toLocaleDateString('en-US', { month: 'long' })
      return `${monthName} Monthly Meeting`
    })(),
    facilitator_id: user?.id || '',
    attendees: [] as string[],
    meeting_date: (() => {
      const today = new Date()
      const year = today.getFullYear()
      const month = String(today.getMonth() + 1).padStart(2, '0')
      const day = String(today.getDate()).padStart(2, '0')
      return `${year}-${month}-${day}`
    })(),
    additional_notes: '',
    action_plan: '',
  })

  const { data: studentScreenings = [], isLoading: isLoadingScreenings } =
    useSpeechScreeningsByStudent(selectedStudent?.id)

  const mostRecentScreening = studentScreenings[0]

  const handleAddAttendee = () => {
    const trimmedInput = attendeeInput.trim()
    if (trimmedInput && !formData.attendees.includes(trimmedInput)) {
      setFormData(prev => ({
        ...prev,
        attendees: [...prev.attendees, trimmedInput],
      }))
      setAttendeeInput('')
    }
  }

  const handleRemoveAttendee = (attendeeToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      attendees: prev.attendees.filter(attendee => attendee !== attendeeToRemove),
    }))
  }

  const handleAttendeeKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleAddAttendee()
    } else if (e.key === 'Backspace' && attendeeInput === '' && formData.attendees.length > 0) {
      const newAttendees = [...formData.attendees]
      newAttendees.pop()
      setFormData(prev => ({ ...prev, attendees: newAttendees }))
    }
  }

  const userRole = userProfile?.role || 'slp'
  const userName = userProfile
    ? `${userProfile.first_name} ${userProfile.last_name}`
    : 'Dr. Sarah Johnson'

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
    if (formData.attendees.length === 0) {
      toast({
        title: 'Validation Error',
        description: 'Please add at least one attendee.',
        variant: 'destructive',
      })
      setIsSubmitting(false)
      return
    }

    // Build student updates array from studentData
    const student_updates = Object.entries(studentData)
      .filter(([_, data]) => data.sessions_attended !== null || data.meeting_notes.trim() !== '')
      .map(([student_id, data]) => ({
        student_id,
        sessions_attended: data.sessions_attended,
        meeting_notes: data.meeting_notes.trim() || null,
      }))

    // Validate attendees
    if (formData.attendees.length === 0) {
      toast({
        title: 'Validation Error',
        description: 'Please add at least one attendee.',
        variant: 'destructive',
      })
      setIsSubmitting(false)
      return
    }

    // Validate school_id
    if (!currentSchool?.id) {
      toast({
        title: 'Validation Error',
        description: 'No school selected. Please select a school first.',
        variant: 'destructive',
      })
      setIsSubmitting(false)
      return
    }

    // Convert attendees string to array
    const submitData = {
      meeting_title: formData.meeting_title.trim(),
      meeting_date: formData.meeting_date,
      attendees: formData.attendees,
      school_id: currentSchool?.id || '',
      facilitator_id: formData.facilitator_id || null,
      additional_notes: formData.additional_notes.trim() || null,
      action_plan: formData.action_plan.trim() || null,
      student_updates: student_updates.length > 0 ? student_updates : undefined,
    }

    createMonthlyMeetings.mutate(submitData, {
      onSuccess: () => {
        toast({
          title: 'Monthly Meeting Saved',
          description: 'The monthly meeting has been successfully saved.',
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

  // Check if student has data entered
  const hasStudentData = (studentId: string) => {
    const data = studentData[studentId]
    return data && (data.sessions_attended !== null || data.meeting_notes.trim() !== '')
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
                        <Label htmlFor='facilitator_id'>Meeting Facilitator</Label>
                        <Select
                          value={formData.facilitator_id}
                          onValueChange={value =>
                            setFormData(prev => ({ ...prev, facilitator_id: value }))
                          }
                          disabled={isLoadingUsers}>
                          <SelectTrigger>
                            <SelectValue
                              placeholder={isLoadingUsers ? 'Loading...' : 'Select a facilitator'}
                            />
                          </SelectTrigger>
                          <SelectContent>
                            {users.map(user => (
                              <SelectItem key={user.id} value={user.id}>
                                {user.first_name} {user.last_name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      {/* <div className='space-y-2'>
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
                      </div> */}

                      <div className='space-y-2'>
                        <Label htmlFor='attendees'>Attendees *</Label>
                        <div
                          className={cn(
                            'min-h-[42px] w-full rounded-md border border-input bg-background',
                            'px-3 py-2 text-sm ring-offset-background',
                            'focus-within:outline-none focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2',
                          )}>
                          <div className='flex flex-wrap gap-2'>
                            {/* Display existing attendees as badges */}
                            {formData.attendees.map((attendee, index) => (
                              <Badge
                                key={index}
                                variant='secondary'
                                className='flex items-center gap-1 px-2 py-1'>
                                <span>{attendee}</span>
                                <button
                                  type='button'
                                  onClick={() => handleRemoveAttendee(attendee)}
                                  className='ml-1 rounded-full hover:bg-muted-foreground/20 p-0.5'>
                                  <X className='h-3 w-3' />
                                </button>
                              </Badge>
                            ))}

                            {/* Input for new attendee */}
                            <input
                              type='text'
                              id='attendees'
                              value={attendeeInput}
                              onChange={e => setAttendeeInput(e.target.value)}
                              onKeyDown={handleAttendeeKeyDown}
                              onBlur={handleAddAttendee}
                              placeholder={
                                formData.attendees.length === 0 ? 'Type name and press Enter' : ''
                              }
                              className='flex-1 min-w-[120px] outline-none bg-transparent'
                            />
                          </div>
                        </div>
                        <p className='text-sm text-gray-500'>
                          Type a name and press Enter to add. Click the × or hit Backspace to
                          remove.
                        </p>
                      </div>

                      {/* Students Table Section */}
                      <div className='space-y-2'>
                        <Label>Students</Label>

                        <div className='bg-white rounded-lg border border-gray-200 overflow-hidden'>
                          <MonthlyMeetingsStudentTable
                            students={students}
                            isLoading={isLoadingStudents}
                            studentData={studentData}
                            onStudentClick={student => {
                              setSelectedStudent(student)
                              setShowStudentModal(true)
                            }}
                            hasStudentData={hasStudentData}
                          />
                        </div>
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

                    <div className='space-y-2'>
                      <Label htmlFor='action_plan'>Action Plan</Label>
                      <Textarea
                        id='action_plan'
                        name='action_plan'
                        value={formData.action_plan}
                        onChange={handleInputChange}
                        placeholder='Action plan and next steps...'
                        rows={4}
                      />
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
                        {isSubmitting ? 'Saving...' : 'Save Meeting Notes'}
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>

              {/* Student Details Modal */}
              <Dialog open={showStudentModal} onOpenChange={setShowStudentModal}>
                <DialogContent className='max-w-2xl'>
                  <DialogHeader>
                    <DialogTitle>
                      Student Details:{' '}
                      {selectedStudent
                        ? `${selectedStudent.first_name} ${selectedStudent.last_name}`
                        : ''}
                    </DialogTitle>
                    {selectedStudent?.grade && (
                      <p className='text-sm text-gray-500'>
                        Grade:{' '}
                        {GRADE_MAPPING[selectedStudent.grade]?.display || selectedStudent.grade}
                      </p>
                    )}

                    {isLoadingScreenings ? (
                      <div className='mt-3 p-4 bg-gradient-to-br from-gray-50 to-white rounded-xl border border-gray-200 shadow-sm animate-pulse'>
                        <div className='flex items-center justify-between'>
                          <div className='flex items-center gap-2'>
                            <div className='w-2 h-2 rounded-full bg-gray-300' />
                            <div className='h-4 w-24 bg-gray-200 rounded' />
                            <div className='h-5 w-20 bg-gray-200 rounded-full' />
                          </div>
                          <div className='h-8 w-32 bg-gray-200 rounded' />
                        </div>
                      </div>
                    ) : mostRecentScreening ? (
                      <LastScreeningCard
                        screening={mostRecentScreening}
                        onViewDetails={() => setShowScreeningModal(true)}
                      />
                    ) : (
                      <p className='mt-3 text-sm text-gray-400'>No speech screenings on record</p>
                    )}
                  </DialogHeader>

                  <div className='space-y-4 py-4'>
                    <div className='space-y-2'>
                      <Label htmlFor='modal_sessions_attended'>Sessions Attended</Label>
                      <Input
                        id='modal_sessions_attended'
                        type='number'
                        min='0'
                        value={
                          selectedStudent?.id
                            ? (studentData[selectedStudent.id]?.sessions_attended ?? '')
                            : ''
                        }
                        onChange={e => {
                          if (selectedStudent?.id) {
                            const value = e.target.value === '' ? null : parseInt(e.target.value)
                            setStudentData(prev => ({
                              ...prev,
                              [selectedStudent.id]: {
                                ...prev[selectedStudent.id],
                                sessions_attended: value,
                                meeting_notes: prev[selectedStudent.id]?.meeting_notes || '',
                              },
                            }))
                          }
                        }}
                        placeholder='Enter number of sessions attended'
                      />
                    </div>

                    <div className='space-y-2'>
                      <Label htmlFor='modal_meeting_notes'>Meeting Notes</Label>
                      <Textarea
                        id='modal_meeting_notes'
                        value={
                          selectedStudent?.id
                            ? studentData[selectedStudent.id]?.meeting_notes || ''
                            : ''
                        }
                        onChange={e => {
                          if (selectedStudent?.id) {
                            setStudentData(prev => ({
                              ...prev,
                              [selectedStudent.id]: {
                                ...prev[selectedStudent.id],
                                sessions_attended:
                                  prev[selectedStudent.id]?.sessions_attended ?? null,
                                meeting_notes: e.target.value,
                              },
                            }))
                          }
                        }}
                        placeholder='Meeting notes for this student...'
                        rows={6}
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button
                      type='button'
                      variant='outline'
                      onClick={() => {
                        setShowStudentModal(false)
                        setSelectedStudent(null)
                      }}>
                      Close
                    </Button>
                    <Button
                      type='button'
                      onClick={() => {
                        setShowStudentModal(false)
                        setSelectedStudent(null)
                        toast({
                          title: 'Student Data Saved',
                          description: `Data for ${selectedStudent?.first_name} ${selectedStudent?.last_name} has been saved.`,
                        })
                      }}>
                      Save
                    </Button>
                  </DialogFooter>
                </DialogContent>

                {/* Screening Details */}
                {mostRecentScreening && (
                  <ScreeningDetailsModal
                    isOpen={showScreeningModal}
                    onClose={() => setShowScreeningModal(false)}
                    screening={mostRecentScreening}
                  />
                )}
              </Dialog>
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
