import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { format } from 'date-fns'
import { useMonthlyMeetingsByStudent } from '@/hooks/monthly-meetings/use-monthly-meetings-queries'
import {
  ResponsiveTable,
  ResponsiveTableRow,
  TableHeader,
  TableHead,
  TableBody,
  TableCell,
} from '@/components/ui/responsive-table'
import { Loader2, Calendar, Eye, Edit2 } from 'lucide-react'
import { useOrganization } from '@/contexts/OrganizationContext'
import MonthlyMeetingDetailsModal from '@/pages/monthly-meetings/MonthlyMeetingDetailsModal'
import { MonthlyMeeting } from '@/api/monthlymeetings'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { MoreHorizontal } from 'lucide-react'

interface StudentPageMonthlyMeetingsTableProps {
  studentId?: string
}

const StudentPageMonthlyMeetingsTable = ({ studentId }: StudentPageMonthlyMeetingsTableProps) => {
  const navigate = useNavigate()
  const { currentSchool } = useOrganization()
  const [selectedMeetingForDetails, setSelectedMeetingForDetails] = useState<MonthlyMeeting | null>(
    null
  )
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false)

  const { data: meetings = [], isLoading, error } = useMonthlyMeetingsByStudent(studentId)

  const handleViewDetails = (meeting: MonthlyMeeting) => {
    setSelectedMeetingForDetails(meeting)
    setIsDetailsModalOpen(true)
  }

  const handleCloseDetailsModal = () => {
    setIsDetailsModalOpen(false)
    setSelectedMeetingForDetails(null)
  }

  const handleEditMeeting = (meeting: MonthlyMeeting) => {
    if (currentSchool?.id) {
      navigate(`/school/${currentSchool.id}/monthly-meetings/edit/${meeting.id}`)
    } else {
      navigate(`/monthly-meetings/edit/${meeting.id}`)
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className='flex items-center justify-between'>
          <CardTitle className='text-2xl font-semibold'>Monthly Meetings History</CardTitle>
          {meetings.length > 0 && (
            <span className='inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800'>
              {meetings.length} meeting{meetings.length !== 1 ? 's' : ''}
            </span>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className='flex items-center justify-center py-12'>
            <Loader2 className='w-8 h-8 animate-spin text-blue-600' />
          </div>
        ) : error ? (
          <div className='bg-red-50 border border-red-200 rounded-lg p-4'>
            <p className='text-red-800 text-sm'>Error loading monthly meetings: {error.message}</p>
          </div>
        ) : meetings.length === 0 ? (
          <div className='text-center py-8 text-gray-500 text-sm'>
            No monthly meetings found for this student.
          </div>
        ) : (
          <>
            <div className='overflow-x-auto'>
              <div className='bg-white rounded-lg border border-gray-200 overflow-hidden'>
                <ResponsiveTable className='w-full'>
                  <TableHeader>
                    <tr>
                      <TableHead className='w-1/3'>Meeting Title</TableHead>
                      <TableHead className='w-1/5'>Date</TableHead>
                      <TableHead className='w-1/5'>Sessions</TableHead>
                      <TableHead className='w-1/5'>Facilitator</TableHead>
                      <TableHead className='w-12'></TableHead>
                    </tr>
                  </TableHeader>
                  <TableBody>
                    {meetings.map(meeting => {
                      // Find the student update for this specific student
                      const studentUpdate = meeting.student_updates?.find(
                        update => update.student_id === studentId
                      )

                      return (
                        <ResponsiveTableRow
                          key={meeting.id}
                          mobileCardContent={
                            <div className='space-y-3'>
                              <div className='flex items-center justify-between'>
                                <h3 className='font-medium'>{meeting.meeting_title}</h3>
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button variant='ghost' size='sm'>
                                      <MoreHorizontal className='w-4 h-4' />
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align='end' className='bg-white'>
                                    <DropdownMenuItem onClick={() => handleViewDetails(meeting)}>
                                      <Eye className='w-4 h-4 mr-2' />
                                      View Details
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => handleEditMeeting(meeting)}>
                                      <Edit2 className='w-4 h-4 mr-2' />
                                      Edit
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
                                  <span className='font-medium'>Sessions:</span>{' '}
                                  {studentUpdate?.sessions_attended ?? 'N/A'}
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
                            <div className='font-medium'>{meeting.meeting_title}</div>
                          </TableCell>
                          <TableCell>
                            <div className='flex items-center gap-2'>
                              <Calendar className='w-4 h-4 text-gray-500' />
                              <span className='text-sm'>
                                {format(new Date(meeting.meeting_date), 'MMM d, yyyy')}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell>
                            {studentUpdate?.sessions_attended !== null &&
                            studentUpdate?.sessions_attended !== undefined ? (
                              <Badge className='bg-blue-100 text-blue-800 text-[10px]'>
                                {studentUpdate.sessions_attended}{' '}
                                {studentUpdate.sessions_attended === 1 ? 'session' : 'sessions'}
                              </Badge>
                            ) : (
                              <span className='text-sm text-gray-500 italic'>Not recorded</span>
                            )}
                          </TableCell>
                          <TableCell>
                            <span className='text-sm text-gray-600'>
                              {meeting.facilitator
                                ? `${meeting.facilitator.first_name} ${meeting.facilitator.last_name}`
                                : 'N/A'}
                            </span>
                          </TableCell>
                          <TableCell>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant='ghost' size='sm'>
                                  <MoreHorizontal className='w-4 h-4' />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align='end' className='bg-white'>
                                <DropdownMenuItem onClick={() => handleViewDetails(meeting)}>
                                  <Eye className='w-4 h-4 mr-2' />
                                  View Details
                                </DropdownMenuItem>
                                {/* <DropdownMenuItem onClick={() => handleEditMeeting(meeting)}>
                                <Edit2 className='w-4 h-4 mr-2' />
                                Edit
                              </DropdownMenuItem> */}
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </ResponsiveTableRow>
                      )
                    })}
                  </TableBody>
                </ResponsiveTable>
              </div>
            </div>

            {/* Monthly Meeting Details Modal */}
            <MonthlyMeetingDetailsModal
              isOpen={isDetailsModalOpen}
              onClose={handleCloseDetailsModal}
              meeting={selectedMeetingForDetails}
            />
          </>
        )}
      </CardContent>
    </Card>
  )
}

export default StudentPageMonthlyMeetingsTable
