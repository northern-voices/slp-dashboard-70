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
    <div className='p-4 mt-3 border border-gray-200 shadow-sm bg-gradient-to-br from-gray-50 to-white rounded-xl'>
      {/* Header row */}
      <div className='flex items-center justify-between'>
        <div className='flex items-center gap-2'>
          <div className='w-2 h-2 bg-green-500 rounded-full' />
          <span className='text-sm font-semibold text-gray-800'>Last Meeting</span>
          <Badge className='text-xs font-medium text-green-700 bg-green-100 border border-green-200'>
            {parseDateSafely(meeting.meeting_date).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
            })}
          </Badge>
        </div>
        <Button
          variant='ghost'
          size='sm'
          className='h-8 text-xs text-blue-600 hover:text-blue-700 hover:bg-blue-50'
          onClick={onViewDetails}>
          <Eye className='w-3.5 h-3.5 mr-1.5' />
          View More Details
        </Button>
      </div>

      {/* Facilitator row */}
      {meeting.facilitator && (
        <div className='flex items-center gap-1 mt-2 text-sm text-gray-500'>
          <Users className='w-3 h-3' />
          <span>
            {meeting.facilitator.first_name} {meeting.facilitator.last_name}
          </span>
        </div>
      )}
    </div>
  )
}

export default LastMeetingCard
