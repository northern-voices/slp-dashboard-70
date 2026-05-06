import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'
import { ChevronUp, ChevronDown, MoreHorizontal } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  ResponsiveTable,
  ResponsiveTableRow,
  TableHeader,
  TableHead,
  TableBody,
  TableCell,
} from '@/components/ui/responsive-table'
import { GRADE_MAPPING } from '@/constants/app'
import { Student } from '@/types/database'
import { schoolGradesApi, type SchoolGrade } from '@/api/schoolGrades'
import { useSchoolDetails } from '@/hooks/school/useSchoolDetails'
import { useOrganization } from '@/contexts/OrganizationContext'

interface CaseloadTableProps {
  students: Student[]
  isLoading: boolean
  schoolId?: string
}

const CaseloadTable = ({ students, isLoading, schoolId }: CaseloadTableProps) => {
  const [gradesMap, setGradesMap] = useState<Map<string, SchoolGrade>>(new Map())
  const [sortField, setSortField] = useState<'grade' | 'program_status' | null>('program_status')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc' | null>('asc')
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState<number | 'all'>(50)

  useEffect(() => {
    const fetchGrades = async () => {
      if (!schoolId) return setGradesMap(new Map())

      try {
        const grades = await schoolGradesApi.getSchoolGradesBySchool(schoolId)
        const map = new Map<string, SchoolGrade>()

        grades.forEach(grade => map.set(grade.id, grade))

        setGradesMap(map)
      } catch {
        setGradesMap(new Map())
      }
    }

    fetchGrades()
  }, [schoolId])

  const { currentSchool } = useOrganization()
  const { data: schoolDetails } = useSchoolDetails(currentSchool ?? null)

  const speechEAs =
    schoolDetails?.schoolTeam?.filter(member => member.roles.includes('speech_ea')) ?? []

  const getSpeechEAName = (student: Student): string => {
    if (!student.speech_ea_id) return '-'

    return speechEAs.find(ea => ea.id === student.speech_ea_id)?.name ?? '-'
  }

  const getStudentGrade = (student: Student): string => {
    if (student.current_grade_id) {
      const grade = gradesMap.get(student.current_grade_id)
      if (grade) return grade.grade_level
    }

    return 'N/A'
  }

  const getProgramStatus = (student: Student): string => {
    if (student.service_status === 'graduated') return 'graduated'
    if (student.service_status === 'paused') return 'paused'
    if (student.service_status === 'transferred') return 'transferred'
    return student.program_status || 'none'
  }

  const getProgramBadge = (student: Student) => {
    switch (getProgramStatus(student)) {
      case 'graduated':
        return (
          <Badge className='bg-blue-100 text-blue-800 font-medium text-[10px]'>Graduated</Badge>
        )
      case 'paused':
        return (
          <Badge className='bg-purple-100 text-purple-800 font-medium text-[10px]'>Paused</Badge>
        )
      case 'sub':
        return <Badge className='bg-orange-100 text-orange-800 font-medium text-[10px]'>Sub</Badge>
      case 'qualified':
        return <Badge className='bg-red-100 text-red-800 font-medium text-[10px]'>Qualified</Badge>
      case 'not_in_program':
        return (
          <Badge className='bg-green-100 text-green-800 font-medium text-[10px]'>
            Not In Program
          </Badge>
        )
      default:
        return <Badge className='bg-gray-100 text-gray-800 font-medium text-[10px]'>Not Set</Badge>
    }
  }

  const getStatusBadge = (student: Student) => {
    switch (student.service_status) {
      case 'graduated':
        return (
          <Badge className='bg-blue-100 text-blue-800 font-medium text-[10px]'>Graduated</Badge>
        )
      case 'paused':
        return (
          <Badge className='bg-purple-100 text-purple-800 font-medium text-[10px]'>Paused</Badge>
        )
      case 'transferred':
        return (
          <Badge className='bg-gray-100 text-gray-800 font-medium text-[10px]'>Transferred</Badge>
        )
      default:
        return <Badge className='bg-green-100 text-green-800 font-medium text-[10px]'>Active</Badge>
    }
  }

  const handleSort = (field: 'grade' | 'program_status') => {
    if (sortField !== field) {
      setSortField(field)
      setSortOrder('desc')
    } else if (sortOrder === 'desc') {
      setSortOrder('asc')
    } else {
      setSortField(null)
      setSortOrder(null)
    }

    setCurrentPage(1)
  }

  const getSortIcon = (field: 'grade' | 'program_status') => {
    if (sortField !== field) return <ChevronUp className='w-4 h-4 opacity-30' />
    if (sortOrder === 'asc') return <ChevronUp className='w-4 h-4' />

    return <ChevronDown className='w-4 h-4' />
  }

  if (isLoading) {
    return (
      <div className='flex items-center justify-center py-8'>
        <div className='text-center'>
          <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4' />
          <p className='text-gray-600 text-sm'>Loading caseload...</p>
        </div>
      </div>
    )
  }

  const sortedStudents = [...students].sort((a, b) => {
    if (!sortField || !sortOrder) return 0

    let comparison = 0

    if (sortField === 'grade') {
      const indexA = GRADE_MAPPING.findIndex(g => getStudentGrade(a).includes(g.value))
      const indexB = GRADE_MAPPING.findIndex(g => getStudentGrade(b).includes(g.value))
      if (indexA === -1 && indexB === -1) comparison = 0
      else if (indexA === -1) comparison = 1
      else if (indexB === -1) comparison = -1
      else comparison = indexA - indexB
    }

    if (sortField === 'program_status') {
      const order = { qualified: 0, sub: 1, paused: 2, graduated: 3, transferred: 4, none: 5 }
      comparison = (order[getProgramStatus(a)] ?? 99) - (order[getProgramStatus(b)] ?? 99)
    }

    return sortOrder === 'asc' ? comparison : -comparison
  })

  const totalStudents = sortedStudents.length
  const effectiveItemsPerPage = itemsPerPage === 'all' ? totalStudents : itemsPerPage
  const totalPages = Math.max(1, Math.ceil(totalStudents / effectiveItemsPerPage))
  const startIndex = (currentPage - 1) * effectiveItemsPerPage
  const paginatedStudents = sortedStudents.slice(startIndex, startIndex + effectiveItemsPerPage)

  if (totalStudents === 0) {
    return (
      <div className='text-center py-8 text-gray-500 text-sm'>
        No students found in your caseload.
      </div>
    )
  }

  return (
    <div className='space-y-4'>
      <div className='overflow-hidden bg-white border border-gray-200 rounded-lg'>
        <ResponsiveTable className='w-full'>
          <TableHeader>
            <tr>
              <TableHead className='w-1/4 min-w-[180px]'>Student</TableHead>

              <TableHead>
                <Button
                  variant='ghost'
                  onClick={() => handleSort('grade')}
                  className='h-auto p-0 font-medium hover:bg-transparent'>
                  Grade
                  <span className='ml-1'>{getSortIcon('grade')}</span>
                </Button>
              </TableHead>

              <TableHead>
                <Button
                  variant='ghost'
                  onClick={() => handleSort('program_status')}
                  className='h-auto p-0 font-medium hover:bg-transparent'>
                  Program
                  <span className='ml-1'>{getSortIcon('program_status')}</span>
                </Button>
              </TableHead>

              <TableHead>Result</TableHead>

              <TableHead>Status</TableHead>

              <TableHead>Speech EA</TableHead>

              <TableHead className='w-[60px]' />
            </tr>
          </TableHeader>

          <TableBody>
            {paginatedStudents.map(student => (
              <ResponsiveTableRow key={student.id}>
                <TableCell className='font-medium'>
                  {student.first_name} {student.last_name}
                </TableCell>

                <TableCell>{getStudentGrade(student)}</TableCell>

                <TableCell>{getProgramBadge(student)}</TableCell>

                <TableCell>
                  <span className='text-gray-400 text-sm'>—</span>
                </TableCell>

                <TableCell>{getStatusBadge(student)}</TableCell>

                <TableCell>{getSpeechEAName(student)}</TableCell>

                <TableCell className='text-center'>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant='ghost' size='sm' className='h-8 w-8 p-0'>
                        <MoreHorizontal className='h-4 w-4' />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align='end'>
                      <DropdownMenuItem>View Profile</DropdownMenuItem>
                      <DropdownMenuItem>View Screenings</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </ResponsiveTableRow>
            ))}
          </TableBody>
        </ResponsiveTable>
      </div>

      {/* Pagination */}
      <div className='flex items-center justify-between px-4 py-3 border-t border-gray-200'>
        <div className='flex items-center gap-2'>
          <Label className='text-sm text-gray-600'>Rows per page:</Label>
          <Select
            value={itemsPerPage.toString()}
            onValueChange={value => {
              setItemsPerPage(value === 'all' ? 'all' : Number(value))
              setCurrentPage(1)
            }}>
            <SelectTrigger className='w-[80px] h-9'>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='10'>10</SelectItem>
              <SelectItem value='25'>25</SelectItem>
              <SelectItem value='50'>50</SelectItem>
              <SelectItem value='all'>All</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className='flex items-center gap-2'>
          <span className='text-sm text-gray-600'>
            {startIndex + 1}–{Math.min(startIndex + effectiveItemsPerPage, totalStudents)} of{' '}
            {totalStudents}
          </span>
          <div className='flex gap-1'>
            <Button
              variant='outline'
              size='sm'
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className='h-9 w-9 p-0'>
              &larr;
            </Button>
            <Button
              variant='outline'
              size='sm'
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className='h-9 w-9 p-0'>
              &rarr;
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CaseloadTable
