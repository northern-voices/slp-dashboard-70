import React, { useState, useEffect } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import { useOrganization } from '@/contexts/OrganizationContext'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { ChevronLeft, Calendar, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { useToast } from '@/hooks/use-toast'
import { useCreateMonthlyMeeting } from '@/hooks/monthly-meetings/use-monthly-meetings-mutations'
import { useStudentsBySchool } from '@/hooks/students/use-students'
import { useGetUsers } from '@/hooks/users/use-users'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import MonthlyMeetingsStudentTable from '@/components/monthly-meetings/MonthlyMeetingStudentTable'
import StudentDetailsModal from '@/components/monthly-meetings/StudentDetailsModal'
import DraftRestoreDialog from '@/components/monthly-meetings/DraftRestoreDialog'
import UnsavedChangesDialog from '@/components/monthly-meetings/UnsavedChangesDialog'
import { useScreeningsBySchool } from '@/hooks/screenings/use-screenings'
import { useConsentFormPresence } from '@/hooks/students/use-consent-forms'

interface MeetingFormData {
  meeting_title: string
  facilitator_id: string
  attendees: string[]
  meeting_date: string
  meeting_type: string
  additional_notes: string
  action_plan: string
}

type StudentData = Record<string, { sessions_attended: number | null; meeting_notes: string }>

const CreateMonthlyMeetingContent = () => {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showStudentModal, setShowStudentModal] = useState(false)
  const [selectedStudent, setSelectedStudent] = useState(null)
  const [attendeeInput, setAttendeeInput] = useState('')
  const [showRestoreDialog, setShowRestoreDialog] = useState(false)
  const [showLeaveDialog, setShowLeaveDialog] = useState(false)
  const [pendingNavigation, setPendingNavigation] = useState<string | null>(null)

  const navigate = useNavigate()
  const { toast } = useToast()
  const { currentSchool } = useOrganization()
  const { user } = useAuth()

  const draftKey = `monthly-meeting-draft-${currentSchool?.id || 'no-school'}`

  const {
    register,
    handleSubmit,
    control,
    reset,
    watch,
    formState: { isDirty },
  } = useForm<MeetingFormData>({
    defaultValues: {
      meeting_title: (() => {
        const today = new Date()
        return `${today.toLocaleDateString('en-US', { month: 'long' })} Monthly Meeting`
      })(),
      facilitator_id: user?.id || '',
      attendees: [],
      meeting_date: (() => {
        const today = new Date()
        return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(
          2,
          '0'
        )}-${String(today.getDate()).padStart(2, '0')}`
      })(),
      meeting_type: '',
      additional_notes: '',
      action_plan: '',
    },
  })

  const [studentData, setStudentData] = useState<StudentData>({})
  const [hasDraft, setHasDraft] = useState(false)

  // Detect draft on mount
  useEffect(() => {
    const saved = localStorage.getItem(draftKey)
    if (saved) setHasDraft(true)
  }, [draftKey])

  // Save draft on changes
  const watchedValues = watch()
  useEffect(() => {
    if (isDirty) {
      localStorage.setItem(draftKey, JSON.stringify({ formData: watchedValues, studentData }))
    }
  }, [watchedValues, studentData, isDirty, draftKey])

  const loadDraft = () => {
    const saved = localStorage.getItem(draftKey)
    if (saved) {
      const { formData, studentData: savedStudentData } = JSON.parse(saved)
      reset(formData)
      setStudentData(savedStudentData)
    }
    setHasDraft(false)
  }

  const clearDraft = () => {
    localStorage.removeItem(draftKey)
  }

  const discardDraft = () => {
    localStorage.removeItem(draftKey)
    reset()
    setStudentData({})
    setHasDraft(false)
  }

  // Show restore dialog if draft exists on mount
  useEffect(() => {
    if (hasDraft) {
      setShowRestoreDialog(true)
    }
  }, [hasDraft])

  const createMonthlyMeetings = useCreateMonthlyMeeting()
  const { data: students = [], isLoading: isLoadingStudents } = useStudentsBySchool(
    currentSchool?.id
  )
  const { data: users = [], isLoading: isLoadingUsers } = useGetUsers()

  const { data: screeningsData } = useScreeningsBySchool(currentSchool?.id, 'school_year', 1, 10000)
  const screenings = screeningsData?.screenings ?? []

  const studentIds = students.map(student => student.id)
  const { data: studentIdsWithConsent = [] } = useConsentFormPresence(studentIds)

  const onSubmit = async (data: MeetingFormData) => {
    setIsSubmitting(true)

    if (data.attendees.length === 0) {
      toast({
        title: 'Validation Error',
        description: 'Please add at least one attendee.',
        variant: 'destructive',
      })

      setIsSubmitting(false)
      return
    }

    if (!currentSchool?.id) {
      toast({
        title: 'Validation Error',
        description: 'No school selected. Please select a school first.',
        variant: 'destructive',
      })

      setIsSubmitting(false)
      return
    }

    const student_updates = Object.entries(studentData)
      .filter(([_, d]) => d.sessions_attended !== null || d.meeting_notes.trim() !== '')
      .map(([student_id, d]) => ({
        student_id,
        sessions_attended: d.sessions_attended,
        meeting_notes: d.meeting_notes.trim() || null,
      }))

    const submitData = {
      meeting_title: data.meeting_title.trim(),
      meeting_date: data.meeting_date,
      meeting_type: data.meeting_type,
      attendees: data.attendees,
      school_id: currentSchool.id,
      facilitator_id: data.facilitator_id || null,
      additional_notes: data.additional_notes.trim() || null,
      action_plan: data.action_plan.trim() || null,
      student_updates: student_updates.length > 0 ? student_updates : undefined,
    }

    createMonthlyMeetings.mutate(submitData, {
      onSuccess: () => {
        clearDraft()
        toast({
          title: 'Monthly Meeting Saved',
          description: 'The monthly meeting has been successfully saved.',
        })
        navigate(
          currentSchool?.id ? `/school/${currentSchool.id}/monthly-meetings` : '/monthly-meetings'
        )
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

  const handleNavigateAway = (destination: string) => {
    if (isDirty) {
      setPendingNavigation(destination)
      setShowLeaveDialog(true)
    } else {
      navigate(destination)
    }
  }

  const handleCancel = () => {
    const destination = currentSchool?.id
      ? `/school/${currentSchool.id}/monthly-meetings`
      : '/monthly-meetings'
    handleNavigateAway(destination)
  }

  const confirmLeave = () => {
    setShowLeaveDialog(false)
    if (pendingNavigation) {
      navigate(pendingNavigation)
    }
  }

  const hasStudentData = (studentId: string) => {
    const data = studentData[studentId]
    return data && (data.sessions_attended !== null || data.meeting_notes.trim() !== '')
  }

  return (
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
        <div className='w-px h-4 bg-gray-300' />
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
          <form onSubmit={handleSubmit(onSubmit)} className='space-y-6'>
            <div className='space-y-4'>
              <div className='grid grid-cols-3 gap-4'>
                <div className='col-span-2 space-y-2'>
                  <Label htmlFor='meeting_title'>Meeting Title *</Label>
                  <Input
                    id='meeting_title'
                    {...register('meeting_title', { required: true })}
                    placeholder='e.g., October Monthly Progress Review'
                  />
                </div>
                <div className='space-y-2'>
                  <Label htmlFor='meeting_date'>Date *</Label>
                  <Input
                    id='meeting_date'
                    type='date'
                    {...register('meeting_date', { required: true })}
                  />
                </div>
              </div>

              <div className='space-y-2'>
                <Label htmlFor='facilitator_id'>Meeting Facilitator</Label>
                <Controller
                  name='facilitator_id'
                  control={control}
                  render={({ field }) => (
                    <Select
                      value={field.value}
                      onValueChange={field.onChange}
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
                  )}
                />
              </div>

              <div className='space-y-2'>
                <Label htmlFor='attendees'>Attendees *</Label>
                <Controller
                  name='attendees'
                  control={control}
                  render={({ field }) => (
                    <div
                      className={cn(
                        'min-h-[42px] w-full rounded-md border border-input bg-background',
                        'px-3 py-2 text-sm ring-offset-background',
                        'focus-within:outline-none focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2'
                      )}>
                      <div className='flex flex-wrap gap-2'>
                        {field.value.map((attendee, index) => (
                          <Badge
                            key={index}
                            variant='secondary'
                            className='flex items-center gap-1 px-2 py-1'>
                            <span>{attendee}</span>
                            <button
                              type='button'
                              onClick={() =>
                                field.onChange(field.value.filter(a => a !== attendee))
                              }
                              className='ml-1 rounded-full hover:bg-muted-foreground/20 p-0.5'>
                              <X className='w-3 h-3' />
                            </button>
                          </Badge>
                        ))}
                        <input
                          type='text'
                          id='attendees'
                          value={attendeeInput}
                          onChange={e => setAttendeeInput(e.target.value)}
                          onKeyDown={e => {
                            if (e.key === 'Enter') {
                              e.preventDefault()
                              const trimmed = attendeeInput.trim()
                              if (trimmed && !field.value.includes(trimmed)) {
                                field.onChange([...field.value, trimmed])
                                setAttendeeInput('')
                              }
                            } else if (
                              e.key === 'Backspace' &&
                              attendeeInput === '' &&
                              field.value.length > 0
                            ) {
                              field.onChange(field.value.slice(0, -1))
                            }
                          }}
                          onBlur={() => {
                            const trimmed = attendeeInput.trim()
                            if (trimmed && !field.value.includes(trimmed)) {
                              field.onChange([...field.value, trimmed])
                              setAttendeeInput('')
                            }
                          }}
                          placeholder={field.value.length === 0 ? 'Type name and press Enter' : ''}
                          className='flex-1 min-w-[120px] outline-none bg-transparent'
                        />
                      </div>
                    </div>
                  )}
                />
                <p className='text-sm text-gray-500'>
                  Type a name and press Enter to add. Click the × or hit Backspace to remove.
                </p>
              </div>

              <div className='space-y-2'>
                <Label htmlFor='meeting_type'>Meeting Type *</Label>
                <Controller
                  name='meeting_type'
                  control={control}
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger>
                        <SelectValue placeholder='Select a meeting type' />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value='monthly_checkin'>Monthly Checkin</SelectItem>
                        <SelectItem value='coaching_call'>Coaching Call</SelectItem>
                        <SelectItem value='school_visit_summary'>School Visit Summary</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>
            </div>

            {watchedValues.meeting_type && (
              <>
                <div className='space-y-2'>
                  <Label>Students</Label>
                  <div className='overflow-hidden bg-white border border-gray-200 rounded-lg'>
                    <MonthlyMeetingsStudentTable
                      students={students}
                      isLoading={isLoadingStudents}
                      studentData={studentData}
                      onStudentClick={student => {
                        setSelectedStudent(student)
                        setShowStudentModal(true)
                      }}
                      hasStudentData={hasStudentData}
                      schoolId={currentSchool?.id}
                      screenings={screenings}
                      studentIdsWithConsent={studentIdsWithConsent}
                    />
                  </div>
                </div>

                <div className='space-y-2'>
                  <Label htmlFor='additional_notes'>Meeting Notes</Label>
                  <Textarea
                    id='additional_notes'
                    {...register('additional_notes')}
                    placeholder='Meeting notes to be added...'
                    rows={4}
                  />
                </div>

                <div className='space-y-2'>
                  <Label htmlFor='action_plan'>Action Plan</Label>
                  <Textarea
                    id='action_plan'
                    {...register('action_plan')}
                    placeholder='Action plan and next steps...'
                    rows={4}
                  />
                </div>
              </>
            )}

            <div className='flex justify-between pt-4'>
              <div>
                {isDirty && (
                  <Button
                    type='button'
                    variant='ghost'
                    onClick={() => {
                      discardDraft()
                      toast({
                        title: 'Draft Discarded',
                        description: 'Your draft has been discarded.',
                      })
                    }}
                    disabled={isSubmitting}
                    className='text-red-600 hover:text-red-700 hover:bg-red-50'>
                    Discard Draft
                  </Button>
                )}
              </div>

              <div className='flex gap-3'>
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
            </div>
          </form>
        </CardContent>
      </Card>

      <StudentDetailsModal
        open={showStudentModal}
        onClose={() => {
          setShowStudentModal(false)
          setSelectedStudent(null)
        }}
        selectedStudent={selectedStudent}
        studentData={studentData}
        setStudentData={setStudentData}
      />

      <DraftRestoreDialog
        open={showRestoreDialog}
        onRestore={() => {
          loadDraft()
          setShowRestoreDialog(false)
          toast({
            title: 'Draft Restored',
            description: 'Your previous draft has been restored.',
          })
        }}
        onDiscard={() => {
          discardDraft()
          setShowRestoreDialog(false)
        }}
      />

      <UnsavedChangesDialog
        open={showLeaveDialog}
        onKeepEditing={() => setShowLeaveDialog(false)}
        onLeave={confirmLeave}
      />
    </div>
  )
}

const CreateMonthlyMeeting = () => {
  return <CreateMonthlyMeetingContent />
}

export default CreateMonthlyMeeting
