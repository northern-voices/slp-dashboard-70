import { useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Eye, Download, Trash2, MoreHorizontal, ChevronUp, ChevronDown } from 'lucide-react'
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
import { useHearingScreenings } from '@/hooks/screenings/use-hearing-screenings'
import { Screening } from '@/types/database'
import LoadingSpinner from '@/components/common/LoadingSpinner'

interface HearingScreeningsTableProps {
  searchTerm: string
  dateRangeFilter: string
  gradeFilter: string
  selectedScreenings: Screening[]
  setSelectedScreenings: (screenings: Screening[]) => void
}

const HearingScreeningsTable = ({
  searchTerm,
  dateRangeFilter,
  gradeFilter,
  selectedScreenings,
  setSelectedScreenings,
}: HearingScreeningsTableProps) => {
  const [sortField, setSortField] = useState<'date' | 'name' | 'grade' | null>(null)
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc' | null>(null)

  // Fetch hearing screenings from backend
  const { data: screenings = [], isLoading } = useHearingScreenings()

  // Apply filters
  const filteredScreenings = screenings.filter(screening => {
    const matchesSearch =
      screening.student_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      screening.screener?.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesGrade = gradeFilter === 'all' || screening.grade === gradeFilter

    return matchesSearch && matchesGrade
  })

  // Apply sorting
  const sortedScreenings = [...filteredScreenings].sort((a, b) => {
    if (!sortField || !sortOrder) return 0

    let comparison = 0
    switch (sortField) {
      case 'date':
        comparison = new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
        break
      case 'name':
        comparison = (a.student_name || '').localeCompare(b.student_name || '')
        break
      case 'grade':
        comparison = (a.grade || '').localeCompare(b.grade || '')
        break
    }

    return sortOrder === 'asc' ? comparison : -comparison
  })

  const handleSort = (field: 'date' | 'name' | 'grade') => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : sortOrder === 'desc' ? null : 'asc')
      if (sortOrder === 'desc') {
        setSortField(null)
      }
    } else {
      setSortField(field)
      setSortOrder('asc')
    }
  }

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedScreenings(sortedScreenings)
    } else {
      setSelectedScreenings([])
    }
  }

  const handleSelectScreening = (screening: Screening, checked: boolean) => {
    if (checked) {
      setSelectedScreenings([...selectedScreenings, screening])
    } else {
      setSelectedScreenings(selectedScreenings.filter(s => s.id !== screening.id))
    }
  }

  const formatValue = (value: number | null | undefined, result: string | null | undefined, unit: string) => {
    if (result === 'Immeasurable' || value === null || value === undefined) {
      return 'Immeasurable'
    }
    return `${value} ${unit}`
  }

  const SortIcon = ({ field }: { field: 'date' | 'name' | 'grade' }) => {
    if (sortField !== field) return null
    return sortOrder === 'asc' ? (
      <ChevronUp className='w-4 h-4 inline ml-1' />
    ) : (
      <ChevronDown className='w-4 h-4 inline ml-1' />
    )
  }

  if (isLoading) {
    return (
      <div className='flex justify-center items-center h-64'>
        <LoadingSpinner size='lg' />
      </div>
    )
  }

  return (
    <div className='space-y-4'>
      <div className='flex justify-end mb-3'>
        <span className='inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800'>
          {sortedScreenings.length} screening{sortedScreenings.length !== 1 ? 's' : ''} found
        </span>
      </div>

      <div className='bg-white rounded-lg border border-gray-200 overflow-hidden'>
        <ResponsiveTable>
          <TableHeader>
            <tr>
              <TableHead className='w-12'>
                <Checkbox
                  checked={
                    selectedScreenings.length === sortedScreenings.length &&
                    sortedScreenings.length > 0
                  }
                  onCheckedChange={handleSelectAll}
                />
              </TableHead>
              <TableHead
                className='cursor-pointer hover:bg-gray-50'
                onClick={() => handleSort('name')}>
                Student Name
                <SortIcon field='name' />
              </TableHead>
              <TableHead
                className='cursor-pointer hover:bg-gray-50'
                onClick={() => handleSort('grade')}>
                Grade
                <SortIcon field='grade' />
              </TableHead>
              <TableHead>Right Ear</TableHead>
              <TableHead>Right Ear Results</TableHead>
              <TableHead>Left Ear</TableHead>
              <TableHead>Left Ear Results</TableHead>
              {/* <TableHead>Screener</TableHead>
              <TableHead
                className='cursor-pointer hover:bg-gray-50'
                onClick={() => handleSort('date')}>
                Date
                <SortIcon field='date' />
              </TableHead> */}
              <TableHead className='text-right'></TableHead>
            </tr>
          </TableHeader>
          <TableBody>
            {sortedScreenings.length === 0 ? (
              <tr>
                <TableCell colSpan={9} className='text-center py-8 text-gray-500'>
                  No hearing screenings found
                </TableCell>
              </tr>
            ) : (
              sortedScreenings.map(screening => (
                <ResponsiveTableRow key={screening.id}>
                  <TableCell>
                    <Checkbox
                      checked={selectedScreenings.some(s => s.id === screening.id)}
                      onCheckedChange={checked =>
                        handleSelectScreening(screening, checked as boolean)
                      }
                    />
                  </TableCell>
                  <TableCell className='font-medium'>
                    {screening.student_name || 'Unknown Student'}
                  </TableCell>
                  <TableCell>{screening.grade || 'N/A'}</TableCell>
                  <TableCell>
                    <div className='text-xs space-y-1'>
                      <div>Vol: {formatValue(screening.right_volume_db, screening.right_ear_volume_result, 'ml')}</div>
                      <div>Comp: {formatValue(screening.right_compliance, screening.right_ear_compliance_result, 'ml')}</div>
                      <div>Press: {formatValue(screening.right_pressure, screening.right_ear_pressure_result, 'daPa')}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className='text-xs space-y-1'>
                      <div>Vol: {screening.right_ear_volume_result || '-'}</div>
                      <div>Comp: {screening.right_ear_compliance_result || '-'}</div>
                      <div>Press: {screening.right_ear_pressure_result || '-'}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className='text-xs space-y-1'>
                      <div>Vol: {formatValue(screening.left_volume_db, screening.left_ear_volume_result, 'ml')}</div>
                      <div>Comp: {formatValue(screening.left_compliance, screening.left_ear_compliance_result, 'ml')}</div>
                      <div>Press: {formatValue(screening.left_pressure, screening.left_ear_pressure_result, 'daPa')}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className='text-xs space-y-1'>
                      <div>Vol: {screening.left_ear_volume_result || '-'}</div>
                      <div>Comp: {screening.left_ear_compliance_result || '-'}</div>
                      <div>Press: {screening.left_ear_pressure_result || '-'}</div>
                    </div>
                  </TableCell>
                  {/* <TableCell>{screening.screener || 'Unknown Screener'}</TableCell>
                  <TableCell>{format(new Date(screening.created_at), 'MMM d, yyyy')}</TableCell> */}
                  <TableCell className='text-right'>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant='ghost' size='sm'>
                          <MoreHorizontal className='w-4 h-4' />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align='end'>
                        <DropdownMenuItem>
                          <Eye className='w-4 h-4 mr-2' />
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Download className='w-4 h-4 mr-2' />
                          Export Report
                        </DropdownMenuItem>
                        <DropdownMenuItem className='text-red-600'>
                          <Trash2 className='w-4 h-4 mr-2' />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </ResponsiveTableRow>
              ))
            )}
          </TableBody>
        </ResponsiveTable>
      </div>
    </div>
  )
}

export default HearingScreeningsTable
