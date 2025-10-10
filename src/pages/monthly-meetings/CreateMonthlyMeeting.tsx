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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

const CreateMonthlyMeetingContent = () => {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const navigate = useNavigate()
  const { toast } = useToast()
  const { userProfile, currentSchool } = useOrganization()

  const createMonthlyMeetings = useCreateMonthlyMeeting()

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

    // Convert attendees string to array
    const submitData = {
      meeting_title: formData.meeting_title,
      student_id: formData.student_id || null,
      meeting_facilitator: formData.meeting_facilitator || null,
      attendees: formData.attendees
        .split(',')
        .map(a => a.trim())
        .filter(a => a.length > 0),
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

                      <div className='space-y-2'>
                        <Label htmlFor='sessions_attended'>Sessions Attended</Label>
                        <Input
                          id='sessions_attended'
                          name='sessions_attended'
                          type='number'
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
