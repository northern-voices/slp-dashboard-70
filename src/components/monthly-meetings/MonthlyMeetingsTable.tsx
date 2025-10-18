import React, { useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Eye, MoreHorizontal, ChevronUp, ChevronDown, Trash2, Edit, Loader2 } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  ResponsiveTable,
  ResponsiveTableRow,
  TableHeader,
  TableHead,
  TableBody,
  TableCell,
} from '@/components/ui/responsive-table'
import { format } from 'date-fns'
import { useMonthlyMeetingsBySchool } from '@/hooks/monthly-meetings/use-monthly-meetings-queries'
import { useOrganization } from '@/contexts/OrganizationContext'
import { MonthlyMeeting } from '@/api/monthlymeetings'
import MonthlyMeetingDetailsModal from '@/pages/monthly-meetings/MonthlyMeetingDetailsModal'

interface MonthlyMeetingsTableProps {
  searchTerm: string
  dateRangeFilter: string
  facilitatorFilter: string
}

const MonthlyMeetingsTable = ({
  searchTerm,
  dateRangeFilter,
  facilitatorFilter,
}: MonthlyMeetingsTableProps) => {
  const { currentSchool } = useOrganization()
  const [selectedMeetings, setSelectedMeetings] = useState<MonthlyMeeting[]>([])
  const [sortField, setSortField] = useState<'meeting_date' | 'meeting_title' | null>(null)
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc' | null>(null)
  const [isOpen, setIsOpen] = useState(true)

  // Fetch monthly meetings by school
  const {
    data: meetings = [],
    isLoading,
    error,
  } = useMonthlyMeetingsBySchool(
    currentSchool?.id,
    dateRangeFilter === 'school_year' || dateRangeFilter === 'all' ? dateRangeFilter : 'all'
  )

  // Debug logging
  console.log('MonthlyMeetingsTable Debug:', {
    currentSchoolId: currentSchool?.id,
    dateRangeFilter,
    isLoading,
    error,
    meetingsCount: meetings.length,
    meetings,
  })

  // Apply filters
  const filteredMeetings = meetings.filter(meeting => {
    const matchesSearch =
      meeting.meeting_title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      meeting.attendees?.some(p => p.toLowerCase().includes(searchTerm.toLowerCase())) ||
      meeting.student_updates?.some(
        update =>
          update.student?.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          update.student?.last_name?.toLowerCase().includes(searchTerm.toLowerCase())
      )

    // Filter by facilitator
    const matchesFacilitator =
      facilitatorFilter === 'all' || meeting.facilitator_id === facilitatorFilter

    // Apply client-side date range filter for filters other than 'all' and 'school_year'
    // (those are handled at the API level)
    let matchesDateRange = true
    if (dateRangeFilter !== 'all' && dateRangeFilter !== 'school_year') {
      const meetingDate = new Date(meeting.meeting_date)
      const now = new Date()

      switch (dateRangeFilter) {
        case 'today': {
          const meetingLocalDate = meetingDate.toLocaleDateString()
          const nowLocalDate = now.toLocaleDateString()
          matchesDateRange = meetingLocalDate === nowLocalDate
          break
        }
        case 'week': {
          const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
          matchesDateRange = meetingDate >= weekAgo
          break
        }
        case 'month': {
          const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
          matchesDateRange = meetingDate >= monthAgo
          break
        }
        case 'quarter': {
          const quarterAgo = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000)
          matchesDateRange = meetingDate >= quarterAgo
          break
        }
      }
    }

    return matchesSearch && matchesFacilitator && matchesDateRange
  })

  // Sort meetings
  const sortedMeetings = [...filteredMeetings].sort((a, b) => {
    if (!sortOrder || !sortField) return 0

    let comparison = 0

    switch (sortField) {
      case 'meeting_date': {
        const dateA = new Date(a.meeting_date).getTime()
        const dateB = new Date(b.meeting_date).getTime()
        comparison = dateA - dateB
        break
      }
      case 'meeting_title': {
        comparison = (a.meeting_title || '').localeCompare(b.meeting_title || '')
        break
      }
    }

    return sortOrder === 'asc' ? comparison : -comparison
  })

  const handleSort = (field: 'meeting_date' | 'meeting_title') => {
    if (sortField !== field) {
      setSortField(field)
      setSortOrder('desc')
    } else if (sortOrder === 'desc') {
      setSortOrder('asc')
    } else if (sortOrder === 'asc') {
      setSortField(null)
      setSortOrder(null)
    }
  }

  const getSortIcon = (field: 'meeting_date' | 'meeting_title') => {
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

  const getStatusBadge = (meetingDate: string) => {
    const now = new Date()
    const date = new Date(meetingDate)

    if (date > now) {
      return <Badge className='bg-blue-100 text-blue-800 font-medium text-[10px]'>Scheduled</Badge>
    } else {
      return (
        <Badge className='bg-green-100 text-green-800 font-medium text-[10px]'>Completed</Badge>
      )
    }
  }

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedMeetings(filteredMeetings)
    } else {
      setSelectedMeetings([])
    }
  }

  const handleSelectMeeting = (meeting: MonthlyMeeting, checked: boolean) => {
    if (checked) {
      setSelectedMeetings([...selectedMeetings, meeting])
    } else {
      setSelectedMeetings(selectedMeetings.filter(m => m.id !== meeting.id))
    }
  }

  const isAllSelected =
    filteredMeetings.length > 0 && selectedMeetings.length === filteredMeetings.length

  if (isLoading) {
    return (
      <div className='flex items-center justify-center py-12'>
        <Loader2 className='w-8 h-8 animate-spin text-blue-600' />
      </div>
    )
  }

  if (error) {
    return (
      <div className='bg-red-50 border border-red-200 rounded-lg p-4'>
        <p className='text-red-800'>Error loading monthly meetings: {error.message}</p>
      </div>
    )
  }

  return (
    <div className='space-y-4'>
      <div className='flex justify-end mb-3'>
        <span className='inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800'>
          {filteredMeetings.length} meeting{filteredMeetings.length !== 1 ? 's' : ''} found
        </span>
      </div>

      <div className='bg-white rounded-lg border border-gray-200 overflow-hidden'>
        <ResponsiveTable className='w-full'>
          <TableHeader>
            <tr>
              <TableHead className='w-12'>
                <Checkbox checked={isAllSelected} onCheckedChange={handleSelectAll} />
              </TableHead>
              <TableHead className='w-1/3 min-w-[200px]'>
                <Button
                  variant='ghost'
                  onClick={() => handleSort('meeting_title')}
                  className='h-auto p-0 font-medium hover:bg-transparent'>
                  Meeting Title
                  <span className='ml-1'>{getSortIcon('meeting_title')}</span>
                </Button>
              </TableHead>
              <TableHead className='w-1/6 min-w-[120px]'>
                <Button
                  variant='ghost'
                  onClick={() => handleSort('meeting_date')}
                  className='h-auto p-0 font-medium hover:bg-transparent'>
                  Date
                  <span className='ml-1'>{getSortIcon('meeting_date')}</span>
                </Button>
              </TableHead>
              <TableHead className='w-1/4 min-w-[180px]'>Attendees</TableHead>
              <TableHead className='w-1/6 min-w-[120px]'>Facilitator</TableHead>
              <TableHead className='w-12'></TableHead>
            </tr>
          </TableHeader>
          <TableBody>
            {sortedMeetings.map(meeting => (
              <ResponsiveTableRow
                key={meeting.id}
                mobileCardContent={
                  <div className='space-y-3'>
                    <div className='flex items-center justify-between'>
                      <div className='flex items-center gap-2'>
                        <Checkbox
                          checked={selectedMeetings.some(m => m.id === meeting.id)}
                          onCheckedChange={checked =>
                            handleSelectMeeting(meeting, checked as boolean)
                          }
                        />
                        <h3 className='font-medium'>{meeting.meeting_title}</h3>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant='ghost' size='sm'>
                            <MoreHorizontal className='w-4 h-4' />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align='end' className='bg-white'>
                          <DropdownMenuItem>
                            <Eye className='w-4 h-4 mr-2' />
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Edit className='w-4 h-4 mr-2' />
                            Edit Meeting
                          </DropdownMenuItem>
                          <DropdownMenuItem className='text-red-600'>
                            <Trash2 className='w-4 h-4 mr-2' />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                    <div className='text-sm text-gray-600 space-y-1'>
                      <p>
                        <span className='font-medium'>Date:</span>{' '}
                        {format(new Date(meeting.meeting_date), 'MMM d, yyyy')}
                      </p>
                      <p>
                        <span className='font-medium'>Attendees:</span>{' '}
                        {meeting.attendees.join(', ')}
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
                    checked={selectedMeetings.some(m => m.id === meeting.id)}
                    onCheckedChange={checked => handleSelectMeeting(meeting, checked as boolean)}
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
                  <div
                    className='truncate'
                    title={format(new Date(meeting.meeting_date), 'MMM d, yyyy')}>
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
                    <DropdownMenuContent align='end' className='bg-white'>
                      <DropdownMenuItem>
                        <Eye className='w-4 h-4 mr-2' />
                        View Details
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Edit className='w-4 h-4 mr-2' />
                        Edit Meeting
                      </DropdownMenuItem>
                      <DropdownMenuItem className='text-red-600'>
                        <Trash2 className='w-4 h-4 mr-2' />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>

                <MonthlyMeetingDetailsModal isOpen={isOpen} onClose={setIsOpen} meeting={meeting} />
              </ResponsiveTableRow>
            ))}
          </TableBody>
        </ResponsiveTable>

        {filteredMeetings.length === 0 && (
          <div className='text-center py-8'>
            <p className='text-gray-500'>No monthly meetings found matching your criteria.</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default MonthlyMeetingsTable
