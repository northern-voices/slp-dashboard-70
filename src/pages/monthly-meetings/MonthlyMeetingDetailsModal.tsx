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

  console.log(meeting.id, 'meetingid')

  const handleEditMeeting = () => {
    if (currentSchool?.id) {
      navigate(`/school/${currentSchool.id}/monthly-meetings/edit/${meeting.id}`)
    } else {
      navigate(`/monthly-meetings/edit/${meeting.id}`)
    }
    onClose()
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
          <div className='flex flex-col md:flex-row md:justify-between gap-6 p-4 bg-gray-50 rounded-lg'>
            <div className='md:w-2/3'>
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
              </div>
            </div>

            <div className='md:w-1/3'>
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
                    {/* Student Header */}
                    <div className='flex items-center gap-2 flex-wrap mb-4'>
                      <User className='w-4 h-4 text-gray-500' />
                      <span className='font-medium text-gray-900'>
                        {update.student?.first_name} {update.student?.last_name}
                      </span>
                      {update.student?.grade?.grade_level && (
                        <Badge variant='outline' className='text-xs'>
                          Grade {update.student.grade.grade_level}
                        </Badge>
                      )}
                    </div>

                    {/* Sessions and Notes Grid */}
                    <div className='grid grid-cols-1 md:grid-cols-[200px_1fr] gap-1'>
                      {/* Sessions Attended - Left Column */}
                      <div className='flex flex-col gap-2'>
                        <h5 className='text-xs font-semibold text-gray-600'>Sessions Attended:</h5>
                        {update.sessions_attended !== null &&
                        update.sessions_attended !== undefined ? (
                          <Badge className='bg-blue-100 text-blue-800 w-fit'>
                            {update.sessions_attended}{' '}
                            {update.sessions_attended === 1 ? 'session' : 'sessions'}
                          </Badge>
                        ) : (
                          <span className='text-sm text-gray-500 italic'>Not recorded</span>
                        )}
                      </div>

                      {/* Meeting Notes - Right Column */}
                      <div className='flex flex-col gap-2'>
                        <h5 className='text-xs font-semibold text-gray-600'>Notes:</h5>
                        {update.meeting_notes ? (
                          <p className='text-sm text-gray-700 whitespace-pre-wrap'>
                            {update.meeting_notes}
                          </p>
                        ) : (
                          <p className='text-sm text-gray-500 italic'>No notes recorded</p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Meeting Additional Notes Section */}
          {meeting.additional_notes && (
            <div className='space-y-4'>
              <h3 className='font-medium text-gray-900'>Additional Notes</h3>
              <div className='p-4 bg-gray-50 rounded-lg border border-gray-200'>
                <p className='text-sm text-gray-700 whitespace-pre-wrap'>
                  {meeting.additional_notes}
                </p>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default MonthlyMeetingDetailsModal
