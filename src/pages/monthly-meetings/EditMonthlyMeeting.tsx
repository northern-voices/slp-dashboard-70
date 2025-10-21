import React, { useState, useEffect } from 'react'
  import { useParams, useNavigate } from 'react-router-dom'
  import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar'
  import AppSidebar from '@/components/AppSidebar'
  import Header from '@/components/Header'
  import { useOrganization } from '@/contexts/OrganizationContext'
  import { useAuth } from '@/contexts/AuthContext'
  import { Button } from '@/components/ui/button'
  import {
    ChevronLeft,
    Calendar,
    UserPlus,
    ChevronUp,
    ChevronDown,
    CheckCircle2,
    X,
  } from 'lucide-react'
  import { cn } from '@/lib/utils'
  import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
  import { Input } from '@/components/ui/input'
  import { Label } from '@/components/ui/label'
  import { Textarea } from '@/components/ui/textarea'
  import { useToast } from '@/hooks/use-toast'
  import {
    useUpdateMonthlyMeeting,
    useGetMonthlyMeetingById
  } from '@/hooks/monthly-meetings/use-monthly-meetings-mutations'
  import { useStudentsBySchool } from '@/hooks/students/use-students'
  import { useGetUsers } from '@/hooks/users/use-users'
  import { GRADE_MAPPING } from '@/constants/app'
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
  import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
  } from '@/components/ui/dialog'
  import LoadingSpinner from '@/components/common/LoadingSpinner'

  const EditMonthlyMeetingContent = () => {
    const { meetingId } = useParams<{ meetingId: string }>()
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [isLoading, setIsLoading] = useState(true)
    const navigate = useNavigate()
    const { toast } = useToast()
    const { userProfile, currentSchool } = useOrganization()

    const updateMonthlyMeeting = useUpdateMonthlyMeeting()
    const { data: students = [], isLoading: isLoadingStudents } = useStudentsBySchool(
      currentSchool?.id
    )
    const { data: users = [], isLoading: isLoadingUsers } = useGetUsers()
    const { user } = useAuth()

    const [formData, setFormData] = useState({
      meeting_title: '',
      facilitator_id: user?.id || '',
      attendees: [] as string[],
      meeting_date: '',
      additional_notes: '',
    })

    const [sortField, setSortField] = useState<'grade' | 'program_status' | null>('program_status')
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc' | null>('asc')
    const [currentPage, setCurrentPage] = useState(1)
    const [itemsPerPage, setItemsPerPage] = useState<number | 'all'>('all')
    const [showStudentModal, setShowStudentModal] = useState(false)
    const [selectedStudent, setSelectedStudent] = useState<any>(null)
    const [studentData, setStudentData] = useState<
      Record<string, { sessions_attended: number | null; meeting_notes: string }>
    >({})
    const [attendeeInput, setAttendeeInput] = useState('')

    // Fetch meeting data on mount
    useEffect(() => {
      const fetchMeetingData = async () => {
        if (!meetingId) return

        setIsLoading(true)
        try {
          // TODO: Replace this with actual API call to fetch single meeting
          // For now, you'll need to implement useGetMonthlyMeetingById hook
          // Example: const meeting = await monthlyMeetingsApi.getById(meetingId)

          // Temporary: fetch from list and find by ID
          // You should create a proper API endpoint for fetching a single meeting
          const { monthlyMeetingsApi } = await import('@/api/monthlymeetings')
          const meetings = await monthlyMeetingsApi.getMonthlyMeetingsList()
          const meeting = meetings.find(m => m.id === meetingId)

          if (!meeting) {
            throw new Error('Meeting not found')
          }

          // Populate form with existing data
          setFormData({
            meeting_title: meeting.meeting_title || '',
            facilitator_id: meeting.facilitator_id || user?.id || '',
            attendees: meeting.attendees || [],
            meeting_date: meeting.meeting_date ? meeting.meeting_date.split('T')[0] : '',
            additional_notes: meeting.additional_notes || '',
          })

          // Populate student data if exists
          if (meeting.student_updates && meeting.student_updates.length > 0) {
            const studentDataMap: Record<
              string,
              { sessions_attended: number | null; meeting_notes: string }
            > = {}

            meeting.student_updates.forEach(update => {
              studentDataMap[update.student_id] = {
                sessions_attended: update.sessions_attended,
                meeting_notes: update.meeting_notes || '',
              }
            })

            setStudentData(studentDataMap)
          }
        } catch (error) {
          console.error('Failed to fetch meeting:', error)
          toast({
            title: 'Error',
            description: 'Failed to load meeting data',
            variant: 'destructive',
          })
          handleCancel()
        } finally {
          setIsLoading(false)
        }
      }

      fetchMeetingData()
    }, [meetingId, user?.id, toast])

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

    const handleSort = (field: 'grade' | 'program_status') => {
      if (sortField !== field) {
        setSortField(field)
        setSortOrder('desc')
      } else if (sortOrder === 'desc') {
        setSortOrder('asc')
      } else if (sortOrder === 'asc') {
        setSortField(null)
        setSortOrder(null)
      }
      setCurrentPage(1)
    }

    const getSortIcon = (field: 'grade' | 'program_status') => {
      if (sortField !== field) {
        return <ChevronUp className='w-4 h-4 opacity-30' />
      }
      if (sortOrder === 'asc') {
        return <ChevronUp className='w-4 h-4' />
      } else if (sortOrder === 'desc') {
        return <ChevronDown className='w-4 h-4' />
      }
      return <ChevronUp className='w-4 h-4 opacity-30' />
    }

    const getProgramStatus = (student): string => {
      const speechScreenings = student.speech_screenings || []
      if (speechScreenings.length === 0) {
        return 'no_screening'
      }

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

      if (!formData.meeting_title.trim()) {
        toast({
          title: 'Validation Error',
          description: 'Meeting title cannot be empty.',
          variant: 'destructive',
        })
        setIsSubmitting(false)
        return
      }

      if (formData.attendees.length === 0) {
        toast({
          title: 'Validation Error',
          description: 'Please add at least one attendee.',
          variant: 'destructive',
        })
        setIsSubmitting(false)
        return
      }

      const student_updates = Object.entries(studentData)
        .filter(([_, data]) => data.sessions_attended !== null || data.meeting_notes.trim() !== '')
        .map(([student_id, data]) => ({
          student_id,
          sessions_attended: data.sessions_attended,
          meeting_notes: data.meeting_notes.trim() || null,
        }))

      const submitData = {
        meeting_title: formData.meeting_title.trim(),
        meeting_date: formData.meeting_date,
        attendees: formData.attendees,
        facilitator_id: formData.facilitator_id || null,
        additional_notes: formData.additional_notes.trim() || null,
        student_updates: student_updates.length > 0 ? student_updates : undefined,
      }

      updateMonthlyMeeting.mutate(
        { id: meetingId!, data: submitData },
        {
          onSuccess: () => {
            toast({
              title: 'Monthly Meeting Updated',
              description: 'The monthly meeting has been successfully updated.',
            })

            if (currentSchool?.id) {
              navigate(`/school/${currentSchool.id}/monthly-meetings`)
            } else {
              navigate('/monthly-meetings')
            }
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
      if (currentSchool?.id) {
        navigate(`/school/${currentSchool.id}/monthly-meetings`)
      } else {
        navigate('/monthly-meetings')
      }
    }

    const hasStudentData = (studentId: string) => {
      const data = studentData[studentId]
      return data && (data.sessions_attended !== null || data.meeting_notes.trim() !== '')
    }

    if (isLoading) {
      return <LoadingSpinner />
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

                        <div className='space-y-2'>
                          <Label htmlFor='attendees'>Attendees *</Label>
                          <div
                            className={cn(
                              'min-h-[42px] w-full rounded-md border border-input bg-background',
                              'px-3 py-2 text-sm ring-offset-background',
                              'focus-within:outline-none focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2'
                            )}>
                            <div className='flex flex-wrap gap-2'>
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

                        {/* Students Table Section - Same as Create */}
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
                            ) : (
                              (() => {
                                const filteredStudents = students
                                  .filter(student => {
                                    const status = getProgramStatus(student)
                                    return status === 'sub' || status === 'qualifies'
                                  })
                                  .sort((a, b) => {
                                    if (!sortField || !sortOrder) {
                                      const dateA = new Date(a.created_at).getTime()
                                      const dateB = new Date(b.created_at).getTime()
                                      return dateB - dateA
                                    }

                                    let comparison = 0

                                    if (sortField === 'grade') {
                                      const gradeA = a.grade || 'N/A'
                                      const gradeB = b.grade || 'N/A'

                                      const indexA = GRADE_MAPPING.findIndex(g => g.value === gradeA)
                                      const indexB = GRADE_MAPPING.findIndex(g => g.value === gradeB)

                                      if (indexA === -1 && indexB === -1) {
                                        comparison = 0
                                      } else if (indexA === -1) {
                                        comparison = 1
                                      } else if (indexB === -1) {
                                        comparison = -1
                                      } else {
                                        comparison = indexA - indexB
                                      }
                                    } else if (sortField === 'program_status') {
                                      const statusA = getProgramStatus(a)
                                      const statusB = getProgramStatus(b)
                                      const statusOrder = { qualifies: 0, sub: 1 }
                                      comparison = statusOrder[statusA] - statusOrder[statusB]
                                    }

                                    return sortOrder === 'asc' ? comparison : -comparison
                                  })

                                const totalStudents = filteredStudents.length
                                const effectiveItemsPerPage =
                                  itemsPerPage === 'all' ? totalStudents : itemsPerPage
                                const totalPages = Math.ceil(totalStudents / effectiveItemsPerPage)
                                const startIndex = (currentPage - 1) * effectiveItemsPerPage
                                const endIndex = startIndex + effectiveItemsPerPage
                                const paginatedStudents = filteredStudents.slice(startIndex, endIndex)

                                return filteredStudents.length > 0 ? (
                                  <div className='space-y-4'>
                                    <ResponsiveTable className='w-full'>
                                      <TableHeader>
                                        <tr>
                                          <TableHead className='w-1/4 min-w-[200px]'>Name</TableHead>
                                          <TableHead className='w-1/6 min-w-[100px]'>
                                            <Button
                                              type='button'
                                              variant='ghost'
                                              onClick={() => handleSort('grade')}
                                              className='h-auto p-0 font-medium hover:bg-transparent'>
                                              Grade
                                              <span className='ml-1'>{getSortIcon('grade')}</span>
                                            </Button>
                                          </TableHead>
                                          <TableHead className='w-1/5 min-w-[150px]'>
                                            <Button
                                              type='button'
                                              variant='ghost'
                                              onClick={() => handleSort('program_status')}
                                              className='h-auto p-0 font-medium hover:bg-transparent'>
                                              Program Status
                                              <span className='ml-1'>
                                                {getSortIcon('program_status')}
                                              </span>
                                            </Button>
                                          </TableHead>
                                          <TableHead className='w-1/6 min-w-[120px]'>
                                            Date Created
                                          </TableHead>
                                          <TableHead className='w-[60px] text-center'></TableHead>
                                          <TableHead className='w-[60px] text-center'></TableHead>
                                        </tr>
                                      </TableHeader>
                                      <TableBody>
                                        {paginatedStudents.map(student => (
                                          <ResponsiveTableRow key={student.id}>
                                            <TableCell>
                                              {student.first_name} {student.last_name}
                                            </TableCell>
                                            <TableCell>{student.grade || 'N/A'}</TableCell>
                                            <TableCell>{getQualificationBadge(student)}</TableCell>
                                            <TableCell>
                                              {new Date(student.created_at).toLocaleDateString(
                                                'en-US',
                                                {
                                                  month: 'short',
                                                  day: 'numeric',
                                                  year: 'numeric',
                                                }
                                              )}
                                            </TableCell>
                                            <TableCell className='text-center'>
                                              <Button
                                                type='button'
                                                size='sm'
                                                variant='outline'
                                                onClick={() => {
                                                  setSelectedStudent(student)
                                                  setShowStudentModal(true)
                                                }}
                                                className='h-8 w-8 p-0'>
                                                <UserPlus className='h-4 w-4' />
                                              </Button>
                                            </TableCell>
                                            <TableCell className='text-center'>
                                              {hasStudentData(student.id) && (
                                                <CheckCircle2 className='h-5 w-5 text-green-600 mx-auto' />
                                              )}
                                            </TableCell>
                                          </ResponsiveTableRow>
                                        ))}
                                      </TableBody>
                                    </ResponsiveTable>

                                    {/* Pagination Controls */}
                                    <div className='flex items-center justify-between px-4 py-3 border-t border-gray-200'>
                                      <div className='flex items-center gap-2'>
                                        <Label
                                          htmlFor='itemsPerPage'
                                          className='text-sm text-gray-600'>
                                          Rows per page:
                                        </Label>
                                        <Select
                                          value={itemsPerPage.toString()}
                                          onValueChange={value => {
                                            setItemsPerPage(value === 'all' ? 'all' : Number(value))
                                            setCurrentPage(1)
                                          }}>
                                          <SelectTrigger id='itemsPerPage' className='w-[80px] h-9'>
                                            <SelectValue />
                                          </SelectTrigger>
                                          <SelectContent>
                                            <SelectItem value='5'>5</SelectItem>
                                            <SelectItem value='10'>10</SelectItem>
                                            <SelectItem value='20'>20</SelectItem>
                                            <SelectItem value='50'>50</SelectItem>
                                            <SelectItem value='all'>All</SelectItem>
                                          </SelectContent>
                                        </Select>
                                      </div>

                                      <div className='flex items-center gap-2'>
                                        <span className='text-sm text-gray-600'>
                                          Showing {startIndex + 1}-{Math.min(endIndex, totalStudents)}{' '}
                                          of {totalStudents}
                                        </span>
                                        <div className='flex gap-1'>
                                          <Button
                                            type='button'
                                            variant='outline'
                                            size='sm'
                                            onClick={() =>
                                              setCurrentPage(prev => Math.max(1, prev - 1))
                                            }
                                            disabled={currentPage === 1}
                                            className='h-9 w-9 p-0'>
                                            &larr;
                                          </Button>
                                          <Button
                                            type='button'
                                            variant='outline'
                                            size='sm'
                                            onClick={() =>
                                              setCurrentPage(prev => Math.min(totalPages, prev + 1))
                                            }
                                            disabled={currentPage === totalPages}
                                            className='h-9 w-9 p-0'>
                                            &rarr;
                                          </Button>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                ) : (
                                  <div className='text-center py-8 text-gray-500 text-sm'>
                                    No students with Sub or Qualifies status found for this school.
                                  </div>
                                )
                              })()
                            )}
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
                          {isSubmitting ? 'Updating...' : 'Update Meeting'}
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
                              ? studentData[selectedStudent.id]?.sessions_attended ?? ''
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
                </Dialog>
              </div>
            </div>
          </SidebarInset>
        </div>
      </SidebarProvider>
    )
  }

  const EditMonthlyMeeting = () => {
    return <EditMonthlyMeetingContent />
  }

  export default EditMonthlyMeeting