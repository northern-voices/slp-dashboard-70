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

const CreateMonthlyMeetingContent = () => {
  const navigate = useNavigate()
  const { toast } = useToast()
  const { userProfile, currentSchool } = useOrganization()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const [formData, setFormData] = useState({
    title: '',
    date: '',
    participants: '',
    agenda: '',
    notes: '',
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      // TODO: Replace with actual API call to save the monthly meeting
      console.log('Monthly meeting submitted:', formData)

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
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to create the monthly meeting. Please try again.',
        variant: 'destructive',
      })
    } finally {
      setIsSubmitting(false)
    }
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
                          <Label htmlFor='title'>Meeting Title *</Label>
                          <Input
                            id='title'
                            name='title'
                            value={formData.title}
                            onChange={handleInputChange}
                            placeholder='e.g., October Monthly Progress Review'
                            required
                          />
                        </div>
                        <div className='space-y-2'>
                          <Label htmlFor='date'>Date *</Label>
                          <Input
                            id='date'
                            name='date'
                            type='date'
                            value={formData.date}
                            onChange={handleInputChange}
                            required
                          />
                        </div>
                      </div>

                      <div className='space-y-2'>
                        <Label htmlFor='participants'>Participants</Label>
                        <Input
                          id='participants'
                          name='participants'
                          value={formData.participants}
                          onChange={handleInputChange}
                          placeholder='e.g., Dr. Sarah Johnson, Ms. Emily Davis'
                        />
                        <p className='text-sm text-gray-500'>
                          Separate multiple participants with commas
                        </p>
                      </div>

                      <div className='space-y-2'>
                        <Label htmlFor='agenda'>Agenda</Label>
                        <Textarea
                          id='agenda'
                          name='agenda'
                          value={formData.agenda}
                          onChange={handleInputChange}
                          placeholder='Meeting agenda and topics to discuss...'
                          rows={4}
                        />
                      </div>

                      <div className='space-y-2'>
                        <Label htmlFor='notes'>Notes</Label>
                        <Textarea
                          id='notes'
                          name='notes'
                          value={formData.notes}
                          onChange={handleInputChange}
                          placeholder='Additional notes or preparation required...'
                          rows={4}
                        />
                      </div>
                    </div>

                    <div className='flex justify-end gap-3 pt-4 border-t'>
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
