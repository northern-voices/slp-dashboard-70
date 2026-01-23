import { useState, useEffect, useMemo } from 'react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { ChevronUp, ChevronDown, CheckCircle2, UserPlus } from 'lucide-react'
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
import { useOrganization } from '@/contexts/OrganizationContext'
import { useScreeningsBySchool } from '@/hooks/screenings/use-screenings'

interface StudentData {
  sessions_attended: number | null
  meeting_notes: string
}

interface MonthlyMeetingsStudentTableProps {
  students: Student[]
  isLoading: boolean
  studentData: Record<string, StudentData>
  onStudentClick: (student: Student) => void
  hasStudentData: (studentId: string) => boolean
}

const MonthlyMeetingsStudentTable = ({
  students,
  isLoading,
  studentData,
  onStudentClick,
  hasStudentData,
}: MonthlyMeetingsStudentTableProps) => {
  const { currentSchool } = useOrganization()
  const [gradesMap, setGradesMap] = useState<Map<string, SchoolGrade>>(new Map())
  const [sortField, setSortField] = useState<'grade' | 'program_status' | null>('program_status')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc' | null>('asc')
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState<number | 'all'>('all')

  // Fetch screenings for the current school to filter students
  const { data: schoolScreenings = [] } = useScreeningsBySchool(currentSchool?.id, 'all')

  // Create a Set of student IDs who have at least one screening
  const studentsWithScreenings = useMemo(() => {
    const studentIds = new Set<string>()
    schoolScreenings.forEach(screening => {
      studentIds.add(screening.student_id)
    })
    return studentIds
  }, [schoolScreenings])

  // Fetch grades when component mounts
  useEffect(() => {
    const fetchGrades = async () => {
      if (!currentSchool?.id) {
        setGradesMap(new Map())
        return
      }

      try {
        const grades = await schoolGradesApi.getSchoolGradesBySchool(currentSchool.id)
        const map = new Map<string, SchoolGrade>()
        grades.forEach(grade => {
          map.set(grade.id, grade)
        })
        setGradesMap(map)
      } catch (error) {
        console.error('Error fetching grades:', error)
        setGradesMap(new Map())
      }
    }

    fetchGrades()
  }, [currentSchool?.id])

  const handleSort = (field: 'grade' | 'program_status') => {
    if (sortField !== field) {
      setSortField(field)
      setSortOrder('desc')
    } else if (sortOrder === 'desc') {
      setSortOrder('asc')
    } else if (sortOrder === 'asc') {
      setSortField(null)
      setSortOrder(null)
    }
    setCurrentPage(1)
  }

  const getSortIcon = (field: 'grade' | 'program_status') => {
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

  // Helper function to get student's current grade
  const getStudentGrade = (student: Student): string => {
    if (student.current_grade_id) {
      const grade = gradesMap.get(student.current_grade_id)
      if (grade) {
        return grade.grade_level
      }
    }
    return 'N/A'
  }

  const getProgramStatus = (student: Student): string => {
    // Read directly from student.program_status field
    return student.program_status || 'none'
  }

  const getQualificationBadge = (student: Student) => {
    const programStatus = getProgramStatus(student)

    switch (programStatus) {
      case 'graduated':
        return (
          <Badge className='bg-blue-100 text-blue-800 font-medium text-[10px]'>Graduated</Badge>
        )
      case 'paused':
        return (
          <Badge className='bg-purple-100 text-purple-800 font-medium text-[10px]'>
            Pause/Away
          </Badge>
        )
      case 'sub':
        return <Badge className='bg-orange-100 text-orange-800 font-medium text-[10px]'>Sub</Badge>
      case 'qualified':
        return <Badge className='bg-red-100 text-red-800 font-medium text-[10px]'>Qualifies</Badge>
      case 'not_in_program':
        return (
          <Badge className='bg-green-100 text-green-800 font-medium text-[10px]'>
            Not In Program
          </Badge>
        )
      case 'none':
      default:
        return <Badge className='bg-gray-100 text-gray-800 font-medium text-[10px]'>Not Set</Badge>
    }
  }

  if (isLoading) {
    return (
      <div className='flex items-center justify-center py-8'>
        <div className='text-center'>
          <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4'></div>
          <p className='text-gray-600 text-sm'>Loading students...</p>
        </div>
      </div>
    )
  }

  // Filter and sort students
  const filteredStudents = students
    .filter(student => {
      const status = getProgramStatus(student)
      const isQualifiedOrSub = status === 'sub' || status === 'qualified' || status === 'paused'
      const hasScreening = studentsWithScreenings.has(student.id)
      return isQualifiedOrSub && hasScreening
    })
    .sort((a, b) => {
      if (!sortField || !sortOrder) {
        const dateA = new Date(a.created_at).getTime()
        const dateB = new Date(b.created_at).getTime()
        return dateB - dateA
      }

      let comparison = 0

      if (sortField === 'grade') {
        const gradeA = getStudentGrade(a)
        const gradeB = getStudentGrade(b)

        const indexA = GRADE_MAPPING.findIndex(g => gradeA.includes(g.value))
        const indexB = GRADE_MAPPING.findIndex(g => gradeB.includes(g.value))

        if (indexA === -1 && indexB === -1) {
          comparison = 0
        } else if (indexA === -1) {
          comparison = 1
        } else if (indexB === -1) {
          comparison = -1
        } else {
          comparison = indexA - indexB
        }
      } else if (sortField === 'program_status') {
        const statusA = getProgramStatus(a)
        const statusB = getProgramStatus(b)
        const statusOrder = { qualified: 0, sub: 1, paused: 2 }
        comparison = statusOrder[statusA] - statusOrder[statusB]
      }

      return sortOrder === 'asc' ? comparison : -comparison
    })

  // Calculate pagination
  const totalStudents = filteredStudents.length
  const effectiveItemsPerPage = itemsPerPage === 'all' ? totalStudents : itemsPerPage
  const totalPages = Math.ceil(totalStudents / effectiveItemsPerPage)
  const startIndex = (currentPage - 1) * effectiveItemsPerPage
  const endIndex = startIndex + effectiveItemsPerPage
  const paginatedStudents = filteredStudents.slice(startIndex, endIndex)

  if (filteredStudents.length === 0) {
    return (
      <div className='text-center py-8 text-gray-500 text-sm'>
        No students with Sub or Qualifies status found for this school.
      </div>
    )
  }

  return (
    <div className='space-y-4'>
      <ResponsiveTable className='w-full'>
        <TableHeader>
          <tr>
            <TableHead className='w-1/3'>Name</TableHead>
            <TableHead className='w-1/3'>
              <Button
                type='button'
                variant='ghost'
                onClick={() => handleSort('grade')}
                className='h-auto p-0 font-medium hover:bg-transparent'>
                Grade
                <span className='ml-1'>{getSortIcon('grade')}</span>
              </Button>
            </TableHead>
            <TableHead className='w-1/3'>
              <Button
                type='button'
                variant='ghost'
                onClick={() => handleSort('program_status')}
                className='h-auto p-0 font-medium hover:bg-transparent'>
                Program Status
                <span className='ml-1'>{getSortIcon('program_status')}</span>
              </Button>
            </TableHead>
            <TableHead className='w-[60px] text-center'></TableHead>
            <TableHead className='w-[60px] text-center'></TableHead>
          </tr>
        </TableHeader>
        <TableBody>
          {paginatedStudents.map(student => (
            <ResponsiveTableRow key={student.id}>
              <TableCell>
                {student.first_name} {student.last_name}
              </TableCell>
              <TableCell>{getStudentGrade(student)}</TableCell>
              <TableCell>{getQualificationBadge(student)}</TableCell>
              <TableCell className='text-center'>
                <Button
                  type='button'
                  size='sm'
                  variant='outline'
                  onClick={() => onStudentClick(student)}
                  className='h-8 w-8 p-0'>
                  <UserPlus className='h-4 w-4' />
                </Button>
              </TableCell>
              <TableCell className='text-center'>
                {hasStudentData(student.id) && (
                  <CheckCircle2 className='h-5 w-5 text-green-600 mx-auto' />
                )}
              </TableCell>
            </ResponsiveTableRow>
          ))}
        </TableBody>
      </ResponsiveTable>

      {/* Pagination Controls */}
      <div className='flex items-center justify-between px-4 py-3 border-t border-gray-200'>
        <div className='flex items-center gap-2'>
          <Label htmlFor='itemsPerPage' className='text-sm text-gray-600'>
            Rows per page:
          </Label>
          <Select
            value={itemsPerPage.toString()}
            onValueChange={value => {
              setItemsPerPage(value === 'all' ? 'all' : Number(value))
              setCurrentPage(1)
            }}>
            <SelectTrigger id='itemsPerPage' className='w-[80px] h-9'>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='5'>5</SelectItem>
              <SelectItem value='10'>10</SelectItem>
              <SelectItem value='20'>20</SelectItem>
              <SelectItem value='50'>50</SelectItem>
              <SelectItem value='all'>All</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className='flex items-center gap-2'>
          <span className='text-sm text-gray-600'>
            Showing {startIndex + 1}-{Math.min(endIndex, totalStudents)} of {totalStudents}
          </span>
          <div className='flex gap-1'>
            <Button
              type='button'
              variant='outline'
              size='sm'
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className='h-9 w-9 p-0'>
              &larr;
            </Button>
            <Button
              type='button'
              variant='outline'
              size='sm'
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
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

export default MonthlyMeetingsStudentTable
