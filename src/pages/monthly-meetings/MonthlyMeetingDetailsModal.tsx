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
  const [isEditingNotes, setIsEditingNotes] = useState(false)
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

        <div className='space-y-6'>
          {/* Header Information */}
          <div className='grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg'>
            <div>
              <h3 className='font-medium text-gray-900 mb-2'>Meeting Information</h3>
              <div className='space-y-2'>
                <div className='flex items-center gap-2'>
                  <FileText className='w-4 h-4 text-gray-500' />
                  <span className='font-medium text-lg'>{meeting.meeting_title}</span>
                </div>
                <div className='flex items-center gap-2 ml-6'>
                  <Calendar className='w-4 h-4 text-gray-500' />
                  <span className='text-sm text-gray-600'>
                    {format(new Date(meeting.meeting_date), 'EEEE, MMMM d, yyyy')}
                  </span>
                </div>
                <div className='ml-6'>{getStatusBadge(meeting.meeting_date)}</div>
              </div>
            </div>

            <div>
              <h3 className='font-medium text-gray-900 mb-2'>Facilitator</h3>
              <div className='space-y-1'>
                <div className='flex items-center gap-2'>
                  <User className='w-4 h-4 text-gray-500' />
                  <span className='text-sm text-gray-600'>
                    {meeting.facilitator
                      ? `${meeting.facilitator.first_name} ${meeting.facilitator.last_name}`
                      : 'N/A'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Attendees Section */}
          {meeting.attendees && meeting.attendees.length > 0 && (
            <div className='space-y-4'>
              <div className='flex items-center gap-2'>
                <Users className='w-5 h-5 text-gray-700' />
                <h3 className='font-medium text-gray-900'>
                  Attendees ({meeting.attendees.length})
                </h3>
              </div>
              <div className='flex flex-wrap gap-2'>
                {meeting.attendees.map((attendee, index) => (
                  <Badge key={index} className='bg-blue-100 text-blue-800 font-medium'>
                    {attendee}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Student Updates Section */}
          {meeting.student_updates && meeting.student_updates.length > 0 && (
            <div className='space-y-4'>
              <h3 className='font-medium text-gray-900'>
                Student Updates ({meeting.student_updates.length})
              </h3>
              <div className='grid grid-cols-1 gap-4'>
                {meeting.student_updates.map((update, index) => (
                  <div key={index} className='p-4 bg-gray-50 rounded-lg border border-gray-200'>
                    <div className='flex items-center gap-2 mb-2'>
                      <User className='w-4 h-4 text-gray-500' />
                      <span className='font-medium text-gray-900'>
                        {update.student?.first_name} {update.student?.last_name}
                      </span>
                      {update.student?.grade && (
                        <Badge variant='outline' className='text-xs'>
                          Grade {update.student.grade}
                        </Badge>
                      )}
                    </div>
                    {update.notes && (
                      <p className='text-sm text-gray-700 mt-2 pl-6'>{update.notes}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Meeting Notes Section (if you have a notes field) */}
          {/* This can be added if your MonthlyMeeting type has a notes field */}
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default MonthlyMeetingDetailsModal
