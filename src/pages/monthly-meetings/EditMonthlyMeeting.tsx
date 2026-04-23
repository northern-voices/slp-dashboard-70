import React, { useState, useEffect } from 'react'
import { useForm, Controller, ControllerRenderProps } from 'react-hook-form'
import { useParams, useNavigate } from 'react-router-dom'
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
import { useUpdateMonthlyMeeting } from '@/hooks/monthly-meetings/use-monthly-meetings-mutations'
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
import StudentDetailsModal from '@/components/monthly-meetings/StudentDetailsModal'
import MonthlyMeetingsStudentTable from '@/components/monthly-meetings/MonthlyMeetingStudentTable'
import DraftRestoreDialog from '@/components/monthly-meetings/DraftRestoreDialog'
import UnsavedChangesDialog from '@/components/monthly-meetings/UnsavedChangesDialog'
import { useGetMonthlyMeetingById } from '@/hooks/monthly-meetings/use-monthly-meetings-queries'
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

const EditMonthlyMeetingContent = () => {
  const [showStudentModal, setShowStudentModal] = useState(false)
  const [selectedStudent, setSelectedStudent] = useState(null)
  const [attendeeInput, setAttendeeInput] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showRestoreDialog, setShowRestoreDialog] = useState(false)
  const [showLeaveDialog, setShowLeaveDialog] = useState(false)
  const [pendingNavigation, setPendingNavigation] = useState<string | null>(null)
  const [studentData, setStudentData] = useState<StudentData>({})
  const [originalData, setOriginalData] = useState<{
    formData: MeetingFormData
    studentData: StudentData
  } | null>(null)

  const navigate = useNavigate()
  const { toast } = useToast()

  const { meetingId } = useParams<{ meetingId: string }>()
  const { currentSchool } = useOrganization()

  const updateMonthlyMeeting = useUpdateMonthlyMeeting()
  const { data: students = [], isLoading: isLoadingStudents } = useStudentsBySchool(
    currentSchool?.id
  )
  const { data: users = [], isLoading: isLoadingUsers } = useGetUsers()
  const { user } = useAuth()

  const studentIds = students.map(student => student.id)
  const { data: studentIdsWithConsent = [] } = useConsentFormPresence(studentIds)

  const draftKey = `monthly-meeting-edit-draft-${meetingId}`
  const {
    register,
    handleSubmit,
    control,
    reset,
    watch,
    formState: { isDirty },
  } = useForm<MeetingFormData>({
    defaultValues: {
      meeting_title: '',
      facilitator_id: user?.id || '',
      attendees: [],
      meeting_date: '',
      meeting_type: '',
      additional_notes: '',
      action_plan: '',
    },
  })

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
    setShowRestoreDialog(false)
  }

  const clearDraft = () => {
    localStorage.removeItem(draftKey)
  }

  const discardChanges = () => {
    if (originalData) {
      reset(originalData.formData)
      setStudentData(originalData.studentData)
      clearDraft()
    }
  }

  // Fetch meeting data
  const { data: meetingData, isLoading, isError } = useGetMonthlyMeetingById(meetingId)

  useEffect(() => {
    if (!meetingData) return

    const fetchedFormData: MeetingFormData = {
      meeting_title: meetingData.meeting_title || '',
      facilitator_id: meetingData.facilitator_id || user?.id || '',
      attendees: meetingData.attendees || [],
      meeting_date: meetingData.meeting_date ? meetingData.meeting_date.split('T')[0] : '',
      additional_notes: meetingData.additional_notes || '',
      action_plan: meetingData.action_plan || '',
    }

    const fetchedStudentData: StudentData = {}
    if (meetingData.student_updates?.length > 0) {
      meetingData.student_updates.forEach(update => {
        fetchedStudentData[update.student_id] = {
          sessions_attended: update.sessions_attended,
          meeting_notes: update.meeting_notes || '',
        }
      })
    }

    const savedDraft = localStorage.getItem(draftKey)
    if (savedDraft) {
      setOriginalData({ formData: fetchedFormData, studentData: fetchedStudentData })
      setShowRestoreDialog(true)
    } else {
      setOriginalData({ formData: fetchedFormData, studentData: fetchedStudentData })
      reset(fetchedFormData)
      setStudentData(fetchedStudentData)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [meetingData])

  useEffect(() => {
    if (isError) {
      toast({
        title: 'Error',
        description: 'Failed to load meeting data',
        variant: 'destructive',
      })
      handleCancel()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isError])

  const handleAttendeeKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>,
    field: ControllerRenderProps<MeetingFormData, 'attendees'>
  ) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      const trimmed = attendeeInput.trim()
      if (trimmed && !field.value.includes(trimmed)) {
        field.onChange([...field.value, trimmed])
        setAttendeeInput('')
      }
    } else if (e.key === 'Backspace' && attendeeInput === '' && field.value.length > 0) {
      field.onChange(field.value.slice(0, -1))
    }
  }

  const handleAttendeeBlur = (field: ControllerRenderProps<MeetingFormData, 'attendees'>) => {
    const trimmed = attendeeInput.trim()
    if (trimmed && !field.value.includes(trimmed)) {
      field.onChange([...field.value, trimmed])
      setAttendeeInput('')
    }
  }

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
      facilitator_id: data.facilitator_id || null,
      additional_notes: data.additional_notes.trim() || null,
      action_plan: data.action_plan.trim() || null,
      student_updates: student_updates.length > 0 ? student_updates : undefined,
    }

    updateMonthlyMeeting.mutate(
      { id: meetingId!, data: submitData },
      {
        onSuccess: () => {
          clearDraft()
          toast({
            title: 'Monthly Meeting Updated',
            description: 'The monthly meeting has been successfully updated.',
          })
          navigate(
            currentSchool?.id ? `/school/${currentSchool.id}/monthly-meetings` : '/monthly-meetings'
          )
          setIsSubmitting(false)
        },
        onError: error => {
          console.error('Failed to update monthly meeting:', error)
          toast({
            title: 'Error',
            description: 'Failed to update the monthly meeting. Please try again.',
            variant: 'destructive',
          })
          setIsSubmitting(false)
        },
      }
    )
  }

  const handleCancel = () => {
    const destination = currentSchool?.id
      ? `/school/${currentSchool.id}/monthly-meetings`
      : '/monthly-meetings'

    if (isDirty) {
      setPendingNavigation(destination)
      setShowLeaveDialog(true)
    } else {
      navigate(destination)
    }
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
    <>
      <div className='flex-1 p-4 bg-gray-25 md:p-6 lg:p-8'>
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
            <h1 className='text-2xl font-semibold text-gray-900'>Edit Monthly Meeting</h1>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className='flex items-center gap-2'>
                <Calendar className='w-5 h-5 text-blue-600' />
                Meeting Details
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className='flex items-center justify-center py-16'>
                  <div className='text-center'>
                    <div className='w-8 h-8 mx-auto mb-4 border-b-2 border-blue-600 rounded-full animate-spin'></div>
                    <p className='text-sm text-gray-600'>Loading meeting data...</p>
                  </div>
                </div>
              ) : (
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
                                onKeyDown={e => handleAttendeeKeyDown(e, field)}
                                onBlur={() => handleAttendeeBlur(field)}
                                placeholder={
                                  field.value.length === 0 ? 'Type name and press Enter' : ''
                                }
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
                              <SelectItem value='monthly_checking'>Monthly Checkin</SelectItem>
                              <SelectItem value='coaching_call'>Coaching Call</SelectItem>
                              <SelectItem value='school_visit_summary'>
                                School Visit Summary
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        )}
                      />
                    </div>

                    {watchedValues.meeting_type && (
                      <>
                        {/* Students Table Section */}
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
                              studentIdsWithConsent={studentIdsWithConsent}
                            />
                          </div>
                        </div>

                        <div className='space-y-2'>
                          <Label htmlFor='additional_notes'>Additional Notes</Label>
                          <Textarea
                            id='additional_notes'
                            {...register('additional_notes')}
                            placeholder='Additional notes to be added...'
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
                  </div>

                  <div className='flex justify-between pt-4'>
                    <div>
                      {isDirty && (
                        <Button
                          type='button'
                          variant='ghost'
                          onClick={() => {
                            discardChanges()
                            toast({
                              title: 'Draft Discarded',
                              description: 'Your changes have been discarded.',
                            })
                          }}
                          disabled={isSubmitting}
                          className='text-red-600 hover:text-red-700 hover:bg-red-50'>
                          Discard Changes
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
                        {isSubmitting ? 'Updating...' : 'Update Meeting'}
                      </Button>
                    </div>
                  </div>
                </form>
              )}
            </CardContent>
          </Card>

          {/* Student Details Modal */}
          <StudentDetailsModal
            open={showStudentModal}
            onClose={() => {
              setShowStudentModal(false)
              setSelectedStudent(null)
            }}
            selectedStudent={selectedStudent}
            studentData={studentData}
            setStudentData={setStudentData}
            meetingId={meetingId}
          />
        </div>
      </div>

      <DraftRestoreDialog
        open={showRestoreDialog}
        onRestore={() => {
          loadDraft()
          toast({
            title: 'Draft Restored',
            description: 'Your previous changes have been restored.',
          })
        }}
        onDiscard={() => {
          if (originalData) {
            reset(originalData.formData)
            setStudentData(originalData.studentData)
            clearDraft()
          }
          setShowRestoreDialog(false)
        }}
      />

      <UnsavedChangesDialog
        open={showLeaveDialog}
        onKeepEditing={() => setShowLeaveDialog(false)}
        onLeave={confirmLeave}
      />
    </>
  )
}

const EditMonthlyMeeting = () => {
  return <EditMonthlyMeetingContent />
}

export default EditMonthlyMeeting
