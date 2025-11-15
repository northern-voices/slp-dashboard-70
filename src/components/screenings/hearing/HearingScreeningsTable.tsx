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

interface HearingScreening {
  id: string
  student_name: string
  grade: string
  date: string
  screener: string
  result: string
  right_vol: number
  right_compliance: number
  right_press: number
  left_vol: number
  left_compliance: number
  left_press: number
}

interface HearingScreeningsTableProps {
  searchTerm: string
  dateRangeFilter: string
  gradeFilter: string
  selectedScreenings: HearingScreening[]
  setSelectedScreenings: (screenings: HearingScreening[]) => void
}

// Dummy data
const DUMMY_SCREENINGS: HearingScreening[] = [
  {
    id: '1',
    student_name: 'Emma Thompson',
    grade: 'Kindergarten',
    date: '2025-01-10',
    screener: 'Dr. Sarah Johnson',
    result: 'Pass',
    right_vol: 1.2,
    right_compliance: 0.5,
    right_press: -50,
    left_vol: 1.3,
    left_compliance: 0.6,
    left_press: -45,
  },
  {
    id: '2',
    student_name: 'Liam Rodriguez',
    grade: '1st Grade',
    date: '2025-01-09',
    screener: 'Dr. Sarah Johnson',
    result: 'Refer',
    right_vol: 0.8,
    right_compliance: 0.3,
    right_press: -120,
    left_vol: 1.1,
    left_compliance: 0.5,
    left_press: -60,
  },
  {
    id: '3',
    student_name: 'Sophia Chen',
    grade: '2nd Grade',
    date: '2025-01-08',
    screener: 'Dr. Sarah Johnson',
    result: 'Pass',
    right_vol: 1.4,
    right_compliance: 0.7,
    right_press: -40,
    left_vol: 1.3,
    left_compliance: 0.6,
    left_press: -35,
  },
  {
    id: '4',
    student_name: 'Noah Patel',
    grade: '3rd Grade',
    date: '2025-01-07',
    screener: 'Dr. Michael Lee',
    result: 'Pass',
    right_vol: 1.5,
    right_compliance: 0.8,
    right_press: -30,
    left_vol: 1.4,
    left_compliance: 0.7,
    left_press: -25,
  },
  {
    id: '5',
    student_name: 'Olivia Martinez',
    grade: '4th Grade',
    date: '2025-01-06',
    screener: 'Dr. Michael Lee',
    result: 'Refer',
    right_vol: 0.9,
    right_compliance: 0.4,
    right_press: -150,
    left_vol: 0.8,
    left_compliance: 0.3,
    left_press: -180,
  },
  {
    id: '6',
    student_name: 'Ethan Williams',
    grade: '5th Grade',
    date: '2025-01-05',
    screener: 'Dr. Sarah Johnson',
    result: 'Pass',
    right_vol: 1.6,
    right_compliance: 0.9,
    right_press: -20,
    left_vol: 1.5,
    left_compliance: 0.8,
    left_press: -15,
  },
  {
    id: '7',
    student_name: 'Ava Johnson',
    grade: 'Kindergarten',
    date: '2025-01-04',
    screener: 'Dr. Michael Lee',
    result: 'Pass',
    right_vol: 1.1,
    right_compliance: 0.5,
    right_press: -55,
    left_vol: 1.2,
    left_compliance: 0.6,
    left_press: -50,
  },
  {
    id: '8',
    student_name: 'Mason Brown',
    grade: '1st Grade',
    date: '2025-01-03',
    screener: 'Dr. Sarah Johnson',
    result: 'Refer',
    right_vol: 0.7,
    right_compliance: 0.2,
    right_press: -200,
    left_vol: 1.0,
    left_compliance: 0.4,
    left_press: -90,
  },
]

const HearingScreeningsTable = ({
  searchTerm,
  dateRangeFilter,
  gradeFilter,
  selectedScreenings,
  setSelectedScreenings,
}: HearingScreeningsTableProps) => {
  const [sortField, setSortField] = useState<'date' | 'name' | 'grade' | null>(null)
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc' | null>(null)

  // Apply filters
  const filteredScreenings = DUMMY_SCREENINGS.filter(screening => {
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
        comparison = new Date(a.date).getTime() - new Date(b.date).getTime()
        break
      case 'name':
        comparison = a.student_name.localeCompare(b.student_name)
        break
      case 'grade':
        comparison = a.grade.localeCompare(b.grade)
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

  const handleSelectScreening = (screening: HearingScreening, checked: boolean) => {
    if (checked) {
      setSelectedScreenings([...selectedScreenings, screening])
    } else {
      setSelectedScreenings(selectedScreenings.filter(s => s.id !== screening.id))
    }
  }

  const getResultBadge = (result: string) => {
    if (result === 'Pass') {
      return <Badge className='bg-green-100 text-green-800 hover:bg-green-100'>Pass</Badge>
    }
    return <Badge className='bg-red-100 text-red-800 hover:bg-red-100'>Refer</Badge>
  }

  const SortIcon = ({ field }: { field: 'date' | 'name' | 'grade' }) => {
    if (sortField !== field) return null
    return sortOrder === 'asc' ? (
      <ChevronUp className='w-4 h-4 inline ml-1' />
    ) : (
      <ChevronDown className='w-4 h-4 inline ml-1' />
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
            <TableHead
              className='cursor-pointer hover:bg-gray-50'
              onClick={() => handleSort('date')}>
              Date
              <SortIcon field='date' />
            </TableHead>
            <TableHead>Screener</TableHead>
            <TableHead>Result</TableHead>
            <TableHead>Right Ear</TableHead>
            <TableHead>Left Ear</TableHead>
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
                <TableCell className='font-medium'>{screening.student_name}</TableCell>
                <TableCell>{screening.grade}</TableCell>
                <TableCell>{format(new Date(screening.date), 'MMM d, yyyy')}</TableCell>
                <TableCell>{screening.screener}</TableCell>
                <TableCell>{getResultBadge(screening.result)}</TableCell>
                <TableCell>
                  <div className='text-xs space-y-1'>
                    <div>Vol: {screening.right_vol} ml</div>
                    <div>Comp: {screening.right_compliance} ml</div>
                    <div>Press: {screening.right_press} daPa</div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className='text-xs space-y-1'>
                    <div>Vol: {screening.left_vol} ml</div>
                    <div>Comp: {screening.left_compliance} ml</div>
                    <div>Press: {screening.left_press} daPa</div>
                  </div>
                </TableCell>
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
