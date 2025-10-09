import React, { useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Eye,
  MoreHorizontal,
  ChevronUp,
  ChevronDown,
  Trash2,
  Edit,
} from 'lucide-react'
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

interface MonthlyMeeting {
  id: string
  title: string
  date: string
  participants: string[]
  status: 'scheduled' | 'completed' | 'cancelled'
  notes?: string
  created_at: string
}

interface MonthlyMeetingsTableProps {
  searchTerm: string
  dateRangeFilter: string
  statusFilter: string
}

const MonthlyMeetingsTable = ({
  searchTerm,
  dateRangeFilter,
  statusFilter,
}: MonthlyMeetingsTableProps) => {
  const [selectedMeetings, setSelectedMeetings] = useState<MonthlyMeeting[]>([])
  const [sortField, setSortField] = useState<'date' | 'title' | null>(null)
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc' | null>(null)

  // Mock data - replace with actual data fetching
  const mockMeetings: MonthlyMeeting[] = [
    {
      id: '1',
      title: 'September Monthly Review',
      date: '2024-09-15',
      participants: ['Dr. Sarah Johnson', 'Ms. Emily Davis'],
      status: 'completed',
      notes: 'Discussed student progress and upcoming screenings',
      created_at: '2024-09-01',
    },
    {
      id: '2',
      title: 'October Planning Meeting',
      date: '2024-10-08',
      participants: ['Dr. Sarah Johnson', 'Mr. John Smith'],
      status: 'scheduled',
      created_at: '2024-10-01',
    },
  ]

  // Apply filters
  const filteredMeetings = mockMeetings.filter(meeting => {
    const matchesSearch =
      meeting.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      meeting.participants?.some(p => p.toLowerCase().includes(searchTerm.toLowerCase()))

    const matchesStatus = statusFilter === 'all' || meeting.status === statusFilter

    // Apply date range filter
    let matchesDateRange = true
    if (dateRangeFilter !== 'all') {
      const meetingDate = new Date(meeting.date)
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
        case 'school_year': {
          const currentDate = new Date()
          const currentYear = currentDate.getFullYear()
          const currentMonth = currentDate.getMonth()

          let schoolYearStart: Date
          if (currentMonth >= 8) {
            schoolYearStart = new Date(currentYear, 8, 1)
          } else {
            schoolYearStart = new Date(currentYear - 1, 8, 1)
          }

          matchesDateRange = meetingDate >= schoolYearStart
          break
        }
      }
    }

    return matchesSearch && matchesStatus && matchesDateRange
  })

  // Sort meetings
  const sortedMeetings = [...filteredMeetings].sort((a, b) => {
    if (!sortOrder || !sortField) return 0

    let comparison = 0

    switch (sortField) {
      case 'date': {
        const dateA = new Date(a.date).getTime()
        const dateB = new Date(b.date).getTime()
        comparison = dateA - dateB
        break
      }
      case 'title': {
        comparison = (a.title || '').localeCompare(b.title || '')
        break
      }
    }

    return sortOrder === 'asc' ? comparison : -comparison
  })

  const handleSort = (field: 'date' | 'title') => {
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

  const getSortIcon = (field: 'date' | 'title') => {
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

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'scheduled':
        return <Badge className='bg-blue-100 text-blue-800 font-medium text-[10px]'>Scheduled</Badge>
      case 'completed':
        return <Badge className='bg-green-100 text-green-800 font-medium text-[10px]'>Completed</Badge>
      case 'cancelled':
        return <Badge className='bg-red-100 text-red-800 font-medium text-[10px]'>Cancelled</Badge>
      default:
        return <Badge className='bg-gray-100 text-gray-800 font-medium text-[10px]'>Unknown</Badge>
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
                  onClick={() => handleSort('title')}
                  className='h-auto p-0 font-medium hover:bg-transparent'>
                  Meeting Title
                  <span className='ml-1'>{getSortIcon('title')}</span>
                </Button>
              </TableHead>
              <TableHead className='w-1/6 min-w-[120px]'>
                <Button
                  variant='ghost'
                  onClick={() => handleSort('date')}
                  className='h-auto p-0 font-medium hover:bg-transparent'>
                  Date
                  <span className='ml-1'>{getSortIcon('date')}</span>
                </Button>
              </TableHead>
              <TableHead className='w-1/4 min-w-[180px]'>Participants</TableHead>
              <TableHead className='w-1/6 min-w-[100px]'>Status</TableHead>
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
                        <h3 className='font-medium'>{meeting.title}</h3>
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
                    <div className='flex items-center gap-2'>{getStatusBadge(meeting.status)}</div>
                    <div className='text-sm text-gray-600 space-y-1'>
                      <p>
                        <span className='font-medium'>Date:</span>{' '}
                        {format(new Date(meeting.date), 'MMM d, yyyy')}
                      </p>
                      <p>
                        <span className='font-medium'>Participants:</span>{' '}
                        {meeting.participants.join(', ')}
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
                    <div className='font-medium text-base truncate' title={meeting.title}>
                      {meeting.title}
                    </div>
                  </div>
                </TableCell>
                <TableCell className='max-w-0'>
                  <div className='truncate' title={format(new Date(meeting.date), 'MMM d, yyyy')}>
                    {format(new Date(meeting.date), 'MMM d, yyyy')}
                  </div>
                </TableCell>
                <TableCell className='max-w-0'>
                  <div className='truncate' title={meeting.participants.join(', ')}>
                    {meeting.participants.join(', ')}
                  </div>
                </TableCell>
                <TableCell className='max-w-0'>
                  <div className='w-full'>{getStatusBadge(meeting.status)}</div>
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
