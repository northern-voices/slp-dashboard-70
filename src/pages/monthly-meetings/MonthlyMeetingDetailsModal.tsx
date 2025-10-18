import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useOrganization } from '@/contexts/OrganizationContext'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Calendar, User, FileText, X, Users, Edit2, Save, XCircle } from 'lucide-react'
import { format } from 'date-fns'
import { MonthlyMeeting } from '@/api/monthlymeetings'

interface MonthlyMeetingDetailsModalProps {
  isOpen: boolean
  onClose: () => void
  meeting: MonthlyMeeting | null
}

const MonthlyMeetingDetailsModal = ({
  isOpen,
  onClose,
  meeting,
}: MonthlyMeetingDetailsModalProps) => {
  const [isEditNotes, setIsEditingNotes] = useState(false)
  const [notesText, setNotesText] = useState('')
  const navigate = useNavigate()
  const { currentSchool } = useOrganization()

  if (!meeting) return null

  const handleEditMeeting = () => {
    if (currentSchool?.id) {
      navigate(`/school/${currentSchool.id}/edit-monthly-meeting/${meeting.id}`)
    } else {
      navigate(`/edit-monthly-meeting/${meeting.id}`)
    }
    onClose()
  }

  const getStatusBadge = (meetingDate: string) => {
    const now = new Date()
    const date = new Date(meetingDate)

    if (date > now) {
      return <Badge className='bg-blue-100 text-blue-800 font-medium'>Scheduled</Badge>
    } else {
      return <Badge className='bg-green-100 text-green-800 font-medium'>Completed</Badge>
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className='max-w-4xl max-h-[90vh] overflow-y-auto'>
        <DialogHeader>
          <div className='flex items-center justify-between'>
            <DialogTitle className='flex items-center gap-2'>
              <FileText className='w-5 h-5' />
              Monthly Meeting Details
            </DialogTitle>
            <div className='flex items-center gap-2'>
              <Button variant='outline' size='sm' onClick={handleEditMeeting}>
                <Edit2 className='w-4 h-4 mr-2' />
                Edit Meeting
              </Button>

              <Button variant='ghost' size='sm' onClick={onClose}>
                <X className='w-4 h-4' />
              </Button>
            </div>
          </div>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  )
}

export default MonthlyMeetingDetailsModal
