import { Calendar, Eye, Users } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { parseDateSafely } from '@/utils/dateUtils'

interface LastMeetingCardProps {
  meeting: {
    meeting_title: string
    meeting_date: string
    facilitator?: {
      first_name: string
      last_name: string
    } | null
    student_updates?: Array<{
      sessions_attended: number | null
      meeting_notes: string | null
    }>
  }
  onViewDetails: () => void
}

const LastMeetingCard = ({ meeting, onViewDetails }: LastMeetingCardProps) => {
  if (!meeting) return null

  const studentUpdate = meeting.student_updates?.[0]
  const sessionsAttended = studentUpdate?.sessions_attended

  return (
    <div
      className='flex flex-col h-full p-4 bg-white border border-gray-200 rounded-xl shadow-sm
  overflow-hidden relative'>
      <div className='flex items-center gap-2 mb-3'>
        <div className='flex items-center justify-center w-6 h-6 rounded-full bg-green-50'>
          <Calendar className='w-3 h-3 text-green-600' />
        </div>
        <span className='text-xs font-semibold uppercase tracking-wide text-gray-500'>
          Last Meeting
        </span>
      </div>
      <div className='space-y-2 mb-3'>
        <Badge className='text-xs font-medium text-green-700 bg-green-100 border border-green-200'>
          {parseDateSafely(meeting.meeting_date).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
          })}
        </Badge>
        {meeting.facilitator && (
          <div className='flex items-center gap-1.5 text-xs text-gray-500'>
            <Users className='w-3 h-3' />
            <span>
              {meeting.facilitator.first_name} {meeting.facilitator.last_name}
            </span>
          </div>
        )}
      </div>
      <div className='mt-auto'>
        <Button
          variant='outline'
          size='sm'
          className='w-full h-8 text-xs text-green-600 border-green-200 hover:bg-green-50'
          onClick={onViewDetails}>
          <Eye className='w-3.5 h-3.5 mr-1.5' />
          View Details
        </Button>
      </div>
    </div>
  )
}

export default LastMeetingCard
