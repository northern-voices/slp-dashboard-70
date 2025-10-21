import { useState } from 'react'
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
import { Loader2 } from 'lucide-react'

interface StudentPageMonthlyMeetingsTableProps {
  studentId?: string // Optional: pass if showing meetings for a specific student
  schoolId?: string // Optional: pass if showing all meetings for a school
}

const StudentPageMonthlyMeetingsTable = ({
  studentId,
  schoolId,
}: StudentPageMonthlyMeetingsTableProps) => {
  const { data: meetings = [], isLoading, error } = useMonthlyMeetingsByStudent(studentId)

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

  if (meetings.length === 0) {
    return (
      <div className='text-center py-8 text-gray-500'>
        No monthly meetings found for this student.
      </div>
    )
  }

  return (
    <div className='space-y-4'>
      <h3 className='text-lg font-semibold'>Monthly Meetings ({meetings.length})</h3>

      <div className='bg-white rounded-lg border border-gray-200 overflow-hidden'>
        <ResponsiveTable className='w-full'>
          <TableHeader>
            <tr>
              <TableHead>Meeting Title</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Sessions Attended</TableHead>
              <TableHead>Notes</TableHead>
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
                  <TableCell>{meeting.meeting_title}</TableCell>
                  <TableCell>{format(new Date(meeting.meeting_date), 'MMM d, yyyy')}</TableCell>
                  <TableCell>{studentUpdate?.sessions_attended ?? 'N/A'}</TableCell>
                  <TableCell>
                    <div className='max-w-xs truncate'>
                      {studentUpdate?.meeting_notes || 'No notes'}
                    </div>
                  </TableCell>
                </ResponsiveTableRow>
              )
            })}
          </TableBody>
        </ResponsiveTable>
      </div>
    </div>
  )
}

export default StudentPageMonthlyMeetingsTable
