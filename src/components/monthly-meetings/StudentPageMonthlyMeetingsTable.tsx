import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
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
import { Loader2, Calendar } from 'lucide-react'

interface StudentPageMonthlyMeetingsTableProps {
  studentId?: string
}

const StudentPageMonthlyMeetingsTable = ({ studentId }: StudentPageMonthlyMeetingsTableProps) => {
  const { data: meetings = [], isLoading, error } = useMonthlyMeetingsByStudent(studentId)

  return (
    <Card>
      <CardHeader>
        <div className='flex items-center justify-between'>
          <CardTitle className='text-lg font-semibold'>Monthly Meetings History</CardTitle>
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
          <div className='overflow-x-auto'>
            <ResponsiveTable className='w-full'>
              <TableHeader>
                <tr>
                  <TableHead className='w-1/3'>Meeting Title</TableHead>
                  <TableHead className='w-1/4'>Date</TableHead>
                  <TableHead className='w-1/6'>Sessions</TableHead>
                  <TableHead className='w-1/4'>Notes</TableHead>
                </tr>
              </TableHeader>
              <TableBody>
                {meetings.map(meeting => {
                  // Find the student update for this specific student
                  const studentUpdate = meeting.student_updates?.find(
                    update => update.student_id === studentId
                  )

                  return (
                    <ResponsiveTableRow key={meeting.id}>
                      <TableCell>
                        <div className='font-medium'>{meeting.meeting_title}</div>
                      </TableCell>
                      <TableCell>
                        <div className='flex items-center gap-2'>
                          <Calendar className='w-4 h-4 text-gray-500' />
                          {format(new Date(meeting.meeting_date), 'MMM d, yyyy')}
                        </div>
                      </TableCell>
                      <TableCell>
                        {studentUpdate?.sessions_attended !== null &&
                        studentUpdate?.sessions_attended !== undefined ? (
                          <Badge className='bg-blue-100 text-blue-800'>
                            {studentUpdate.sessions_attended}{' '}
                            {studentUpdate.sessions_attended === 1 ? 'session' : 'sessions'}
                          </Badge>
                        ) : (
                          <span className='text-sm text-gray-500 italic'>Not recorded</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className='max-w-xs truncate text-sm'>
                          {studentUpdate?.meeting_notes || (
                            <span className='text-gray-500 italic'>No notes</span>
                          )}
                        </div>
                      </TableCell>
                    </ResponsiveTableRow>
                  )
                })}
              </TableBody>
            </ResponsiveTable>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export default StudentPageMonthlyMeetingsTable
