import { useState, useEffect, useMemo } from 'react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { FileCheck, FileX, ChevronUp, ChevronDown, CheckCircle2, UserPlus } from 'lucide-react'
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
import { Student, Screening } from '@/types/database'
import { schoolGradesApi, type SchoolGrade } from '@/api/schoolGrades'
import { useSchoolDetails } from '@/hooks/school/useSchoolDetails'
import { useOrganization } from '@/contexts/OrganizationContext'
import { useUpdateStudent } from '@/hooks/students'
import CreateEADialog from '@/components/caseload/CreateEADialog'
import { SelectSeparator } from '@/components/ui/select'
import { useToast } from '@/hooks/use-toast'

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
  schoolId?: string
  screenings?: Screening[]
  studentIdsWithConsent?: string[]
}

const MonthlyMeetingsStudentTable = ({
  students,
  isLoading,
  studentData,
  onStudentClick,
  hasStudentData,
  schoolId,
  screenings = [],
  studentIdsWithConsent = [],
}: MonthlyMeetingsStudentTableProps) => {
  const [gradesMap, setGradesMap] = useState<Map<string, SchoolGrade>>(new Map())
  const [sortField, setSortField] = useState<'grade' | 'program_status' | null>('program_status')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc' | null>('asc')
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState<number | 'all'>('all')
  const [createEAOpen, setCreateEAOpen] = useState(false)

  const { toast } = useToast()

  const updateStudent = useUpdateStudent()

  // Fetch grades when component mounts
  useEffect(() => {
    const fetchGrades = async () => {
      if (!schoolId) {
        setGradesMap(new Map())
        return
      }

      try {
        const grades = await schoolGradesApi.getSchoolGradesBySchool(schoolId)
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
  }, [schoolId])

  const { currentSchool } = useOrganization()
  const { data: schoolDetails } = useSchoolDetails(currentSchool ?? null)

  const speechEAs = schoolDetails?.schoolTeam?.filter(m => m.roles.includes('speech_ea')) ?? []
  const getSpeechEAName = (student: Student): string => {
    if (!student.speech_ea_id) return '-'
    return speechEAs.find(ea => ea.id === student.speech_ea_id)?.name ?? '-'
  }

  const handleAssignEA = (student: Student, staffId: string) => {
    const newEaId = staffId === 'none' ? null : staffId

    updateStudent.mutate(
      {
        id: student.id,
        studentData: { speech_ea_id: newEaId },
      },
      {
        onSuccess: () => toast({ title: 'Speech EA updated' }),
        onError: () => {
          toast({
            title: 'Error',
            description: 'Failed to update Speech EA.',
            variant: 'destructive',
          })
        },
      }
    )
  }

  const consentSet = useMemo(() => new Set(studentIdsWithConsent), [studentIdsWithConsent])

  const mostRecentScreeningByStudent = useMemo(() => {
    const map = new Map<string, Screening>()
    screenings.forEach(screening => {
      const existing = map.get(screening.student_id)
      if (!existing || new Date(screening.created_at) > new Date(existing.created_at)) {
        map.set(screening.student_id, screening)
      }
    })
    return map
  }, [screenings])

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
    if (student.service_status === 'graduated') return 'graduated'
    if (student.service_status === 'paused') return 'paused'
    if (student.service_status === 'transferred') return 'transferred'
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
          <div className='w-8 h-8 mx-auto mb-4 border-b-2 border-blue-600 rounded-full animate-spin'></div>
          <p className='text-sm text-gray-600'>Loading students...</p>
        </div>
      </div>
    )
  }

  // Filter and sort students
  const filteredStudents = students
    .filter(student => {
      const status = getProgramStatus(student)
      return status === 'sub' || status === 'qualified' || status === 'paused'
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

        if (comparison === 0) {
          const gradeA = getStudentGrade(a)
          const gradeB = getStudentGrade(b)
          const indexA = GRADE_MAPPING.findIndex(g => gradeA.includes(g.value))
          const indexB = GRADE_MAPPING.findIndex(g => gradeB.includes(g.value))

          if (indexA === -1 && indexB === -1) comparison = 0
          else if (indexA === -1) comparison = 1
          else if (indexB === -1) comparison = -1
          else comparison = indexA - indexB
        }
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
      <div className='py-8 text-sm text-center text-gray-500'>
        No students with Sub or Qualifies status found for this school.
      </div>
    )
  }

  return (
    <div className='space-y-4'>
      <ResponsiveTable className='w-full'>
        <TableHeader>
          <tr>
            <TableHead className='w-1/2'>Name</TableHead>

            <TableHead className='w-1/2'>
              <Button
                type='button'
                variant='ghost'
                onClick={() => handleSort('grade')}
                className='h-auto p-0 font-medium hover:bg-transparent'>
                Grade
                <span className='ml-1'>{getSortIcon('grade')}</span>
              </Button>
            </TableHead>

            <TableHead className='pr-10'>
              <Button
                type='button'
                variant='ghost'
                onClick={() => handleSort('program_status')}
                className='h-auto p-0 font-medium hover:bg-transparent'>
                Program Status
                <span className='ml-1'>{getSortIcon('program_status')}</span>
              </Button>
            </TableHead>

            <TableHead className='w-[60px] text-center font-medium'>Consent</TableHead>

            <TableHead className='w-1/6 min-w-[150px] !text-center'>Speech EA</TableHead>

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

              <TableCell className='pl-2 text-center'>
                {consentSet.has(student.id) ? (
                  <FileCheck className='w-5 h-5 mx-auto text-green-600' />
                ) : (
                  <FileX className='w-5 h-5 mx-auto text-red-400' />
                )}
              </TableCell>

              <TableCell>
                <Select
                  value={student.speech_ea_id ?? 'none'}
                  onValueChange={value => {
                    if (value === '__create_new__') {
                      setCreateEAOpen(true)
                      return
                    }
                    handleAssignEA(student, value)
                  }}>
                  <SelectTrigger className='w-full h-8 p-0 truncate border-none hover:bg-transparent focus:ring-0'>
                    <SelectValue placeholder='Assign EA'>{getSpeechEAName(student)}</SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='none'>None</SelectItem>
                    {speechEAs.map(ea => (
                      <SelectItem key={ea.id} value={ea.id}>
                        {ea.name}
                      </SelectItem>
                    ))}
                    <SelectSeparator />
                    <SelectItem value='__create_new__' className='font-medium text-blue-600'>
                      + Create new EA
                    </SelectItem>
                  </SelectContent>
                </Select>
              </TableCell>

              <TableCell className='text-center'>
                <Button
                  type='button'
                  size='sm'
                  variant='outline'
                  onClick={() => onStudentClick(student)}
                  className='w-8 h-8 p-0'>
                  <UserPlus className='w-4 h-4' />
                </Button>
              </TableCell>

              <TableCell className='text-center'>
                {hasStudentData(student.id) && (
                  <CheckCircle2 className='w-5 h-5 mx-auto text-green-600' />
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
              className='p-0 h-9 w-9'>
              &larr;
            </Button>
            <Button
              type='button'
              variant='outline'
              size='sm'
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
              className='p-0 h-9 w-9'>
              &rarr;
            </Button>
          </div>
        </div>
      </div>

      <CreateEADialog open={createEAOpen} onOpenChange={setCreateEAOpen} schoolId={schoolId} />
    </div>
  )
}

export default MonthlyMeetingsStudentTable
