import { useState, useEffect } from 'react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { useToast } from '@/hooks/use-toast'
import { ChevronUp, ChevronDown } from 'lucide-react'
import {
  ResponsiveTable,
  TableHeader,
  TableHead,
  TableBody,
} from '@/components/ui/responsive-table'
import { useMonthlyMeetingsBySchool } from '@/hooks/monthly-meetings/use-monthly-meetings-queries'
import { useDeleteMonthlyMeeting } from '@/hooks/monthly-meetings/use-monthly-meetings-mutations'
import { useOrganization } from '@/contexts/OrganizationContext'
import { MonthlyMeeting } from '@/api/monthlymeetings'
import MonthlyMeetingDetailsModal from '@/pages/monthly-meetings/MonthlyMeetingDetailsModal'
import MonthlyMeetingBulkActions from '@/components/monthly-meetings/MonthlyMeetingBulkActions'
import MonthlyMeetingsSkeleton from '@/components/skeletons/MonthlyMeetingsSkeleton'
import MonthlyMeetingTableRow from '@/components/monthly-meetings/MonthlyMeetingTableRow'
import MonthlyMeetingDeleteDialog from '@/components/monthly-meetings/MonthlyMeetingDeleteDialog'
import MonthlyMeetingsSendReportDialog from '@/components/monthly-meetings/MonthlyMeetingsSendReportDialog'

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
  const [selectedMeetingForDetails, setSelectedMeetingForDetails] = useState<MonthlyMeeting | null>(
    null
  )
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false)
  const [meetingToDelete, setMeetingToDelete] = useState<MonthlyMeeting | null>(null)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [meetingToSend, setMeetingToSend] = useState<MonthlyMeeting | null>(null)
  const [isSendReportDialogOpen, setIsSendReportDialogOpen] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(50)

  const { toast } = useToast()
  const deleteMonthlyMeeting = useDeleteMonthlyMeeting()

  useEffect(() => {
    setCurrentPage(1)
  }, [searchTerm, dateRangeFilter, facilitatorFilter, sortField, sortOrder])

  const {
    data: meetings = [],
    isLoading,
    error,
  } = useMonthlyMeetingsBySchool(
    currentSchool?.id,
    dateRangeFilter === 'school_year' || dateRangeFilter === 'all' ? dateRangeFilter : 'all'
  )

  const filteredMeetings = meetings.filter(meeting => {
    const matchesSearch =
      meeting.meeting_title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      meeting.attendees?.some(p => p?.toLowerCase().includes(searchTerm.toLowerCase())) ||
      meeting.student_updates?.some(
        update =>
          update.student?.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          update.student?.last_name?.toLowerCase().includes(searchTerm.toLowerCase())
      )

    const matchesFacilitator =
      facilitatorFilter === 'all' || meeting.facilitator_id === facilitatorFilter

    let matchesDateRange = true
    if (dateRangeFilter !== 'all' && dateRangeFilter !== 'school_year') {
      const meetingDate = new Date(meeting.meeting_date)
      const now = new Date()
      switch (dateRangeFilter) {
        case 'today':
          matchesDateRange = meetingDate.toLocaleDateString() === now.toLocaleDateString()
          break
        case 'week':
          matchesDateRange = meetingDate >= new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
          break
        case 'month':
          matchesDateRange = meetingDate >= new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
          break
        case 'quarter':
          matchesDateRange = meetingDate >= new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000)
          break
      }
    }

    return matchesSearch && matchesFacilitator && matchesDateRange
  })

  const sortedMeetings = [...filteredMeetings].sort((a, b) => {
    if (!sortOrder || !sortField) return 0
    switch (sortField) {
      case 'meeting_date':
        return sortOrder === 'asc'
          ? new Date(a.meeting_date).getTime() - new Date(b.meeting_date).getTime()
          : new Date(b.meeting_date).getTime() - new Date(a.meeting_date).getTime()
      case 'meeting_title':
        return sortOrder === 'asc'
          ? (a.meeting_title || '').localeCompare(b.meeting_title || '')
          : (b.meeting_title || '').localeCompare(a.meeting_title || '')
      default:
        return 0
    }
  })

  const totalCount = sortedMeetings.length
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize))
  const paginatedMeetings = sortedMeetings.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  )

  const handleSort = (field: 'meeting_date' | 'meeting_title') => {
    if (sortField !== field) {
      setSortField(field)
      setSortOrder('desc')
    } else if (sortOrder === 'desc') {
      setSortOrder('asc')
    } else {
      setSortField(null)
      setSortOrder(null)
    }
  }

  const getSortIcon = (field: 'meeting_date' | 'meeting_title') => {
    if (sortField !== field) return <ChevronUp className='w-4 h-4 opacity-30' />
    if (sortOrder === 'asc') return <ChevronUp className='w-4 h-4' />
    if (sortOrder === 'desc') return <ChevronDown className='w-4 h-4' />
    return <ChevronUp className='w-4 h-4 opacity-30' />
  }

  // const getStatusBadge = (meetingDate: string) => {
  //   const now = new Date()
  //   const date = new Date(meetingDate)

  //   if (date > now) {
  //     return <Badge className='bg-blue-100 text-blue-800 font-medium text-[10px]'>Scheduled</Badge>
  //   } else {
  //     return (
  //       <Badge className='bg-green-100 text-green-800 font-medium text-[10px]'>Completed</Badge>
  //     )
  //   }
  // }

  const handleSelectAll = (checked: boolean) => {
    setSelectedMeetings(checked ? paginatedMeetings : [])
  }

  const handleSelectMeeting = (meeting: MonthlyMeeting, checked: boolean) => {
    setSelectedMeetings(
      checked ? [...selectedMeetings, meeting] : selectedMeetings.filter(m => m.id !== meeting.id)
    )
  }

  const confirmDeleteMeeting = () => {
    if (!meetingToDelete) return
    deleteMonthlyMeeting.mutate(meetingToDelete.id, {
      onSuccess: () => {
        toast({
          title: 'Meeting Deleted',
          description: 'The monthly meeting has been successfully deleted.',
        })
        setIsDeleteDialogOpen(false)
        setMeetingToDelete(null)
        setSelectedMeetings(selectedMeetings.filter(m => m.id !== meetingToDelete.id))
      },
      onError: error => {
        console.error('Failed to delete meeting:', error)
        toast({
          title: 'Error',
          description: 'Failed to delete the meeting. Please try again.',
          variant: 'destructive',
        })
      },
    })
  }

  const isAllSelected =
    paginatedMeetings.length > 0 &&
    paginatedMeetings.every(m => selectedMeetings.some(sel => sel.id === m.id))
  const isSomeSelected = selectedMeetings.length > 0

  if (isLoading) return <MonthlyMeetingsSkeleton />

  if (error) {
    return (
      <div className='bg-red-50 border border-red-200 rounded-lg p-4'>
        <p className='text-red-800'>Error loading monthly meetings: {error.message}</p>
      </div>
    )
  }

  return (
    <div className='space-y-4'>
      {isSomeSelected && (
        <MonthlyMeetingBulkActions
          selectedCount={selectedMeetings.length}
          selectedMeetings={selectedMeetings}
          onClearSelection={() => setSelectedMeetings([])}
        />
      )}

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

              <TableHead className='w-1/6 min-w-[150px]'>Type</TableHead>

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
            {paginatedMeetings.map(meeting => (
              <MonthlyMeetingTableRow
                key={meeting.id}
                meeting={meeting}
                isSelected={selectedMeetings.some(m => m.id === meeting.id)}
                onSelect={handleSelectMeeting}
                onViewDetails={m => {
                  setSelectedMeetingForDetails(m)
                  setIsDetailsModalOpen(true)
                }}
                onSendReport={m => {
                  setMeetingToSend(m)
                  setIsSendReportDialogOpen(true)
                }}
                onDelete={m => {
                  setMeetingToDelete(m)
                  setIsDeleteDialogOpen(true)
                }}
              />
            ))}
          </TableBody>
        </ResponsiveTable>

        {filteredMeetings.length === 0 && (
          <div className='text-center py-8'>
            <p className='text-gray-500'>No monthly meetings found matching your criteria.</p>
          </div>
        )}

        <MonthlyMeetingDetailsModal
          isOpen={isDetailsModalOpen}
          onClose={() => {
            setIsDetailsModalOpen(false)
            setSelectedMeetingForDetails(null)
          }}
          meeting={selectedMeetingForDetails}
        />
      </div>

      {totalCount > 0 && (
        <div className='flex items-center justify-between px-2 py-3'>
          <div className='flex items-center gap-2 text-sm text-gray-600'>
            <span>Rows per page:</span>
            <Select
              value={String(pageSize)}
              onValueChange={val => {
                setPageSize(Number(val))
                setCurrentPage(1)
              }}>
              <SelectTrigger className='w-20 h-8'>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {[10, 25, 50, 100].map(size => (
                  <SelectItem key={size} value={String(size)}>
                    {size}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className='flex items-center gap-1 text-sm text-gray-600'>
            <span>
              {(currentPage - 1) * pageSize + 1}–{Math.min(currentPage * pageSize, totalCount)} of{' '}
              {totalCount}
            </span>
            <Button
              variant='ghost'
              size='sm'
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}>
              <ChevronUp className='w-4 h-4 rotate-[-90deg]' />
            </Button>
            <Button
              variant='ghost'
              size='sm'
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}>
              <ChevronDown className='w-4 h-4 rotate-[-90deg]' />
            </Button>
          </div>
        </div>
      )}

      <MonthlyMeetingDeleteDialog
        open={isDeleteDialogOpen}
        meeting={meetingToDelete}
        isPending={deleteMonthlyMeeting.isPending}
        onConfirm={confirmDeleteMeeting}
        onCancel={() => {
          setIsDeleteDialogOpen(false)
          setMeetingToDelete(null)
        }}
      />

      <MonthlyMeetingsSendReportDialog
        open={isSendReportDialogOpen}
        meeting={meetingToSend}
        onClose={() => {
          setIsSendReportDialogOpen(false)
          setMeetingToSend(null)
        }}
      />
    </div>
  )
}

export default MonthlyMeetingsTable
