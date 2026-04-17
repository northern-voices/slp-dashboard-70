import { MonthlyMeeting } from '@/api/monthlymeetings'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { ResponsiveTableRow, TableCell } from '@/components/ui/responsive-table'
import { Eye, Mail, MoreHorizontal, Trash2 } from 'lucide-react'
import { format } from 'date-fns'

interface MonthlyMeetingTableRowProps {
  meeting: MonthlyMeeting
  isSelected: boolean
  onSelect: (meeting: MonthlyMeeting, checked: boolean) => void
  onViewDetails: (meeting: MonthlyMeeting) => void
  onSendReport: (meeting: MonthlyMeeting) => void
  onDelete: (meeting: MonthlyMeeting) => void
}

const MonthlyMeetingTableRow = ({
  meeting,
  isSelected,
  onSelect,
  onViewDetails,
  onSendReport,
  onDelete,
}: MonthlyMeetingTableRowProps) => {
  const menuItems = (
    <DropdownMenuContent align='end' className='bg-white'>
      <DropdownMenuItem onClick={() => onViewDetails(meeting)}>
        <Eye className='w-4 h-4 mr-2' />
        View Details
      </DropdownMenuItem>
      <DropdownMenuItem onClick={() => onSendReport(meeting)}>
        <Mail className='w-4 h-4 mr-2' />
        Send Report
      </DropdownMenuItem>
      <DropdownMenuItem className='text-red-600' onClick={() => onDelete(meeting)}>
        <Trash2 className='w-4 h-4 mr-2' />
        Delete
      </DropdownMenuItem>
    </DropdownMenuContent>
  )

  return (
    <ResponsiveTableRow
      mobileCardContent={
        <div className='space-y-3'>
          <div className='flex items-center justify-between'>
            <div className='flex items-center gap-2'>
              <Checkbox
                checked={isSelected}
                onCheckedChange={checked => onSelect(meeting, checked as boolean)}
              />
              <h3 className='font-medium'>{meeting.meeting_title}</h3>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant='ghost' size='sm'>
                  <MoreHorizontal className='w-4 h-4' />
                </Button>
              </DropdownMenuTrigger>
              {menuItems}
            </DropdownMenu>
          </div>
          <div className='text-sm text-gray-600 space-y-1'>
            <p>
              <span className='font-medium'>Date:</span>{' '}
              {format(new Date(meeting.meeting_date), 'MMM d, yyyy')}
            </p>
            <p>
              <span className='font-medium'>Attendees:</span> {meeting.attendees.join(', ')}
            </p>
            <p>
              <span className='font-medium'>Facilitator:</span>{' '}
              {meeting.facilitator
                ? `${meeting.facilitator.first_name} ${meeting.facilitator.last_name}`
                : 'N/A'}
            </p>
          </div>
        </div>
      }>
      <TableCell>
        <Checkbox
          className='mt-1.5'
          checked={isSelected}
          onCheckedChange={checked => onSelect(meeting, checked as boolean)}
        />
      </TableCell>
      <TableCell className='max-w-0'>
        <div className='truncate'>
          <div className='font-medium text-base truncate' title={meeting.meeting_title}>
            {meeting.meeting_title}
          </div>
        </div>
      </TableCell>
      <TableCell className='max-w-0'>
        <div className='truncate' title={format(new Date(meeting.meeting_date), 'MMM d, yyyy')}>
          {format(new Date(meeting.meeting_date), 'MMM d, yyyy')}
        </div>
      </TableCell>
      <TableCell className='max-w-0'>
        <div className='truncate' title={meeting.attendees.join(', ')}>
          {meeting.attendees.join(', ')}
        </div>
      </TableCell>
      <TableCell className='max-w-0'>
        <div className='truncate'>
          {meeting.facilitator
            ? `${meeting.facilitator.first_name} ${meeting.facilitator.last_name}`
            : 'N/A'}
        </div>
      </TableCell>
      <TableCell>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant='ghost' size='sm'>
              <MoreHorizontal className='w-4 h-4' />
            </Button>
          </DropdownMenuTrigger>
          {menuItems}
        </DropdownMenu>
      </TableCell>
    </ResponsiveTableRow>
  )
}

export default MonthlyMeetingTableRow
