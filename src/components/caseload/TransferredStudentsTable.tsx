import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSchoolTransfers } from '@/hooks/students/use-students'
import {
  ResponsiveTable,
  ResponsiveTableRow,
  TableHeader,
  TableHead,
  TableBody,
  TableCell,
} from '@/components/ui/responsive-table'
import { Input } from '@/components/ui/input'
import { Search } from 'lucide-react'

interface TransferredStudentsTableProps {
  schoolId?: string
}

const TransferredStudentsTable = ({ schoolId }: TransferredStudentsTableProps) => {
  const [searchTerm, setSearchTerm] = useState('')

  const navigate = useNavigate()

  const { data: transfers = [], isLoading } = useSchoolTransfers(schoolId ?? '')

  const outgoingTransfers = useMemo(
    () => transfers.filter(transfer => transfer.from_school_id === schoolId),
    [transfers, schoolId]
  )

  const filteredTransfers = useMemo(() => {
    return outgoingTransfers.filter(t => {
      const fullName = `${t.student?.first_name ?? ''} ${t.student?.last_name ?? ''}`.toLowerCase()
      return fullName.includes(searchTerm.toLowerCase())
    })
  }, [outgoingTransfers, searchTerm])

  const handleNavigate = (studentId: string) => {
    if (schoolId) {
      navigate(`/school/${schoolId}/students/${studentId}`)
    } else {
      navigate(`/students/${studentId}`)
    }
  }

  if (isLoading) {
    return (
      <div className='flex items-center justify-center py-8'>
        <div className='text-center'>
          <div className='w-8 h-8 mx-auto mb-4 border-b-2 border-blue-600 rounded-full animate-spin' />
          <p className='text-sm text-gray-600'>Loading transferred students...</p>
        </div>
      </div>
    )
  }

  return (
    <div className='space-y-4'>
      <div className='relative'>
        <Search className='absolute w-4 h-4 text-gray-400 -translate-y-1/2 left-3 top-1/2' />
        <Input
          placeholder='Search by student name...'
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          className='pl-10'
        />
      </div>

      <div className='overflow-hidden bg-white border border-gray-200 rounded-lg'>
        <ResponsiveTable className='w-full'>
          <TableHeader>
            <tr>
              <TableHead className='w-1/5 min-w-[180px]'>Student</TableHead>
              <TableHead className='w-[120px]'>From Grade</TableHead>
              <TableHead className='w-1/5'>Transferred To</TableHead>
              <TableHead className='w-[120px]'>Transfer Date</TableHead>
              <TableHead>Reason</TableHead>
            </tr>
          </TableHeader>

          <TableBody>
            {filteredTransfers.map(transfer => (
              <ResponsiveTableRow key={transfer.id}>
                <TableCell
                  className='font-medium cursor-pointer hover:underline'
                  onClick={() => handleNavigate(transfer.student_id)}>
                  {transfer.student?.first_name} {transfer.student?.last_name}
                </TableCell>
                <TableCell>{transfer.from_grade?.grade_level ?? 'N/A'}</TableCell>
                <TableCell>{transfer.to_school?.name ?? '—'}</TableCell>
                <TableCell>
                  {transfer.transfer_date
                    ? new Date(transfer.transfer_date).toLocaleDateString()
                    : '—'}
                </TableCell>
                <TableCell className='text-gray-600'>{transfer.reason || '—'}</TableCell>
              </ResponsiveTableRow>
            ))}
          </TableBody>
        </ResponsiveTable>

        {filteredTransfers.length === 0 && (
          <div className='py-8 text-center text-sm text-gray-500'>
            No transferred students found.
          </div>
        )}
      </div>
    </div>
  )
}

export default TransferredStudentsTable
