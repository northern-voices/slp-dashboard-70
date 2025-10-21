import React from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Calendar } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useOrganization } from '@/contexts/OrganizationContext'

interface CreateMonthlyMeetingModalProps {
  isOpen: boolean
  onClose: () => void
}

const CreateMonthlyMeetingModal = ({ isOpen, onClose }: CreateMonthlyMeetingModalProps) => {
  const navigate = useNavigate()
  const { currentSchool } = useOrganization()

  const handleCreateMeeting = () => {
    onClose()
    // Navigate to the create form with school context if available
    if (currentSchool?.id) {
      navigate(`/school/${currentSchool.id}/monthly-meetings/create`)
    } else {
      navigate('/monthly-meetings/create')
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className='max-w-2xl'>
        <DialogHeader>
          <DialogTitle>Create New Monthly Meeting</DialogTitle>
        </DialogHeader>

        <div className='mt-6'>
          <Card className='cursor-pointer hover:shadow-md transition-shadow' onClick={handleCreateMeeting}>
            <CardHeader className='text-center'>
              <div className='mx-auto mb-4 w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center'>
                <Calendar className='w-6 h-6 text-blue-600' />
              </div>
              <CardTitle>Monthly Meeting</CardTitle>
            </CardHeader>
            <CardContent>
              <p className='text-center text-gray-600 mb-4'>
                Schedule a new monthly meeting to track student progress, discuss goals, and plan interventions.
              </p>
              <Button className='w-full bg-blue-600 hover:bg-blue-700' onClick={handleCreateMeeting}>
                <Calendar className='w-4 h-4 mr-2' />
                Create Monthly Meeting
              </Button>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default CreateMonthlyMeetingModal
