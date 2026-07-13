import React, { useState, useEffect, useMemo } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { parseDateSafely } from '@/utils/dateUtils'
import { School, Student } from '@/types/database'
import {
  ResponsiveTable,
  TableHeader,
  TableHead,
  TableBody,
  TableCell,
} from '@/components/ui/responsive-table'
import { TableRow } from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { ChevronUp, ChevronDown, Plus, UserPlus, FileCheck, FileX } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import StudentTableFilters from './StudentTableFilters'
import { GRADE_MAPPING } from '@/constants/app'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useToast } from '@/hooks/use-toast'
import { useOrganization } from '@/contexts/OrganizationContext'
import { useStudentsBySchool, useSchoolTransfers } from '@/hooks/students/use-students'
import { useCreateStudent, useUpdateStudent } from '@/hooks/students/use-students-mutations'
import { studentsApi } from '@/api/students'
import { schoolGradesApi, type SchoolGrade } from '@/api/schoolGrades'
import StudentsSkeleton from '@/components/skeletons/StudentsSkeleton'
import { useConsentFormPresence } from '@/hooks/students/use-consent-forms'
import { useSchoolDetails } from '@/hooks/school/useSchoolDetails'
import SortControls, { SortOption } from '@/components/ui/SortControls'

interface StudentTableProps {
  selectedSchool?: School | null
}

const newStudentSchema = z.object({
  first_name: z.string().min(1, 'First name is required'),
  last_name: z.string().min(1, 'Last name is required'),
  // date_of_birth: z.string().optional(),
  grade_level: z.string().optional(),
})

type NewStudentFormData = z.infer<typeof newStudentSchema>

const StudentTable: React.FC<StudentTableProps> = ({ selectedSchool }) => {
  const navigate = useNavigate()
  const { toast } = useToast()
  const [gradeFilter, setGradeFilter] = useState('all')
  const [dateRangeFilter, setDateRangeFilter] = useState('all')
  const [programFilter, setProgramFilter] = useState('all')
  const [showAddModal, setShowAddModal] = useState(false)
  const [gradesMap, setGradesMap] = useState<Map<string, SchoolGrade>>(new Map())
  const [isLoadingGrades, setIsLoadingGrades] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(5)
  const [sortField, setSortField] = useState<string | null>(null)
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc' | null>(null)
  const [searchParams, setSearchParams] = useSearchParams()

  const searchTerm = searchParams.get('search') ?? ''
  const setSearchTerm = (value: string) => {
    setSearchParams(
      prev => {
        if (value) {
          prev.set('search', value)
        } else {
          prev.delete('search')
        }

        return prev
      },
      { replace: true }
    )
  }

  const { currentSchool } = useOrganization()
  const createStudentMutation = useCreateStudent()
  const updateStudentMutation = useUpdateStudent()

  const activeSchool = selectedSchool || currentSchool

  const { data: schoolDetails } = useSchoolDetails(activeSchool ?? null)

  const {
    data: students = [],
    isLoading,
    isPlaceholderData,
  } = useStudentsBySchool(activeSchool?.id)

  const studentIds = students.map(student => student.id)
  const { data: studentIdsWithConsent = [] } = useConsentFormPresence(studentIds)

  // 0-indexed, August = 7, September = 8
  const getCurrentSchoolYearStart = (): Date => {
    const now = new Date()
    const month = now.getMonth()
    const year = now.getFullYear()

    // Sep 1 of this year else Sep 1 of last year
    return month >= 8 ? new Date(year, 8, 1) : new Date(year - 1, 8, 1)
  }

  const schoolYearStart = getCurrentSchoolYearStart()

  const consentSet = useMemo(
    () =>
      new Set(
        (studentIdsWithConsent ?? [])
          .filter(
            r => r.consent_purpose === 'therapy' && new Date(r.consent_date) >= schoolYearStart
          )
          .map(r => r.student_id)
      ),
    [studentIdsWithConsent, schoolYearStart]
  )

  const { data: schoolTransfers = [] } = useSchoolTransfers(activeSchool?.id ?? '')

  type SchoolTransfer = (typeof schoolTransfers)[0]

  const transferByStudentId = useMemo(() => {
    const map = new Map<string, SchoolTransfer>()
    schoolTransfers.forEach(transfer => {
      if (!map.has(transfer.student_id)) {
        map.set(transfer.student_id, transfer)
      }
    })

    return map
  }, [schoolTransfers])

  // Fetch all grades for the school
  useEffect(() => {
    const fetchGrades = async () => {
      if (!activeSchool?.id) {
        setGradesMap(new Map())
        setIsLoadingGrades(false)
        return
      }

      setIsLoadingGrades(true)
      try {
        const grades = await schoolGradesApi.getSchoolGradesBySchool(activeSchool.id)
        const map = new Map<string, SchoolGrade>()
        grades.forEach(grade => {
          map.set(grade.id, grade)
        })
        setGradesMap(map)
      } catch (error) {
        console.error('Error fetching grades:', error)
        setGradesMap(new Map())
      } finally {
        setIsLoadingGrades(false)
      }
    }

    fetchGrades()
  }, [activeSchool?.id])

  const newStudentForm = useForm<NewStudentFormData>({
    resolver: zodResolver(newStudentSchema),
    defaultValues: {
      first_name: '',
      last_name: '',
      // date_of_birth: '',
      grade_level: '',
    },
  })

  const getStudentGrade = (student): string | JSX.Element => {
    if (isLoadingGrades) {
      return (
        <div className='flex items-center gap-2'>
          <div className='w-12 h-4 bg-gray-200 rounded animate-pulse'></div>
        </div>
      )
    }

    if (student.current_grade_id) {
      const grade = gradesMap.get(student.current_grade_id)
      if (grade) {
        return grade.grade_level
      }
    }

    return 'N/A'
  }

  const speechEAs = schoolDetails?.schoolTeam?.filter(m => m.roles.includes('speech_ea')) ?? []
  const getSpeechEAName = (student): string => {
    if (!student.speech_ea_id) return '-'
    return speechEAs.find(ea => ea.id === student.speech_ea_id)?.name ?? '-'
  }

  const getProgramStatus = (student): string => {
    // Read directly from student.program_status field
    return student.program_status || 'none'
  }

  const getQualificationBadge = student => {
    const serviceStatus = student.service_status
    const programStatus = getProgramStatus(student)

    if (serviceStatus === 'graduated')
      return <Badge className='bg-blue-100 text-blue-800 font-medium text-[10px]'>Graduated</Badge>
    if (serviceStatus === 'paused')
      return <Badge className='bg-purple-100 text-purple-800 font-medium text-[10px]'>Pause</Badge>

    switch (programStatus) {
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

  const getLastScreeningDate = (student: Student): string | null => {
    const speechScreenings = student.speech_screenings || []
    const hearingScreenings = student.hearing_screenings || []
    const allScreenings = [...speechScreenings, ...hearingScreenings]

    if (allScreenings.length === 0) return null

    return allScreenings.reduce(
      (latest, screening) =>
        new Date(screening.created_at) > new Date(latest) ? screening.created_at : latest,
      allScreenings[0].created_at
    )
  }

  const getLastScreeningLabel = (student: Student): string => {
    const lastScreeningDate = getLastScreeningDate(student)
    return lastScreeningDate
      ? parseDateSafely(lastScreeningDate).toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
        })
      : 'No screenings yet'
  }

  const isWithinDateRange = (dateString: string | null, range: string): boolean => {
    if (range === 'all') return true
    if (!dateString) return false

    const date = new Date(dateString)
    const now = new Date()

    switch (range) {
      case 'today':
        return date.toDateString() === now.toDateString()

      case 'week': {
        const weekAgo = new Date(now)
        weekAgo.setDate(now.getDate() - 7)
        return date >= weekAgo
      }

      case 'month': {
        const monthAgo = new Date(now)
        monthAgo.setMonth(now.getMonth() - 1)
        return date >= monthAgo
      }

      case 'school_year': {
        const currentYear = now.getFullYear()
        const currentMonth = now.getMonth() // 0-indexed (September = 8)
        let schoolYearStart: Date
        if (currentMonth >= 8) {
          // September or later
          schoolYearStart = new Date(currentYear, 8, 1) // September 1st of current year
        } else {
          schoolYearStart = new Date(currentYear - 1, 8, 1) // September 1st of previous year
        }
        return date >= schoolYearStart
      }

      case 'last_school_year': {
        const currentYear = now.getFullYear()
        const currentMonth = now.getMonth() // 0-indexed (September = 8)
        let lastSchoolYearStart: Date
        let lastSchoolYearEnd: Date

        if (currentMonth >= 8) {
          // Currently in new school year (September or later)
          lastSchoolYearStart = new Date(currentYear - 1, 8, 1) // September 1st of last year
          lastSchoolYearEnd = new Date(currentYear, 7, 31) // August 31st of current year
        } else {
          // Currently in school year that started last calendar year
          lastSchoolYearStart = new Date(currentYear - 2, 8, 1) // September 1st of two years ago
          lastSchoolYearEnd = new Date(currentYear - 1, 7, 31) // August 31st of last year
        }
        return date >= lastSchoolYearStart && date <= lastSchoolYearEnd
      }

      default:
        return true
    }
  }

  const filteredStudents = students
    .filter(student => {
      const fullName = `${student.first_name} ${student.last_name}`.toLowerCase()
      const search = searchTerm.toLowerCase()
      const matchesSearch =
        fullName.includes(search) || (student.student_id?.toLowerCase() ?? '').includes(search)

      // Get grade level from current_grade_id
      let studentGradeLevel = 'N/A'
      if (student.current_grade_id) {
        const grade = gradesMap.get(student.current_grade_id)
        if (grade) {
          studentGradeLevel = grade.grade_level
        }
      }
      const matchesGrade = gradeFilter === 'all' || studentGradeLevel === gradeFilter

      const matchesDateRange = isWithinDateRange(getLastScreeningDate(student), dateRangeFilter)

      const matchesProgram = programFilter === 'all' || getProgramStatus(student) === programFilter

      return matchesSearch && matchesGrade && matchesDateRange && matchesProgram
    })
    .sort((a, b) => {
      // Default sort by grade when no sort is selected
      if (!sortField || !sortOrder) {
        let gradeA = 'N/A'
        if (a.current_grade_id) {
          const grade = gradesMap.get(a.current_grade_id)
          if (grade) gradeA = grade.grade_level
        }

        let gradeB = 'N/A'
        if (b.current_grade_id) {
          const grade = gradesMap.get(b.current_grade_id)
          if (grade) gradeB = grade.grade_level
        }

        const indexA = GRADE_MAPPING.findIndex(g => g.value === gradeA)
        const indexB = GRADE_MAPPING.findIndex(g => g.value === gradeB)

        if (indexA === -1 && indexB === -1) return 0
        if (indexA === -1) return 1
        if (indexB === -1) return -1

        return indexA - indexB
      }

      let comparison = 0
      switch (sortField) {
        case 'name': {
          const nameA = `${a.first_name} ${a.last_name}`
          const nameB = `${b.first_name} ${b.last_name}`
          comparison = nameA.localeCompare(nameB)
          break
        }
        case 'grade': {
          let gradeA = 'N/A'

          if (a.current_grade_id) {
            const grade = gradesMap.get(a.current_grade_id)
            if (grade) gradeA = grade.grade_level
          }

          let gradeB = 'N/A'
          if (b.current_grade_id) {
            const grade = gradesMap.get(b.current_grade_id)
            if (grade) gradeB = grade.grade_level
          }

          const indexA = GRADE_MAPPING.findIndex(g => g.value === gradeA)
          const indexB = GRADE_MAPPING.findIndex(g => g.value === gradeB)

          if (indexA === -1 && indexB === -1) comparison = 0
          else if (indexA === -1) comparison = 1
          else if (indexB === -1) comparison = -1
          else comparison = indexA - indexB
          break
        }

        case 'date': {
          const dateA = getLastScreeningDate(a)
          const dateB = getLastScreeningDate(b)
          comparison =
            (dateA ? new Date(dateA).getTime() : 0) - (dateB ? new Date(dateB).getTime() : 0)
          break
        }
      }

      return sortOrder === 'asc' ? comparison : -comparison
    })

  const totalPages = Math.max(1, Math.ceil(filteredStudents.length / pageSize))
  const paginatedStudents = filteredStudents.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  )

  useEffect(() => {
    setCurrentPage(1)
    setSortField(null)
    setSortOrder(null)
  }, [searchTerm, gradeFilter, dateRangeFilter, programFilter])

  const handleRowClick = (studentId: string) => {
    if (activeSchool) {
      navigate(`/school/${activeSchool.id}/students/${studentId}`)
    } else {
      navigate(`/students/${studentId}`)
    }
  }

  const handleViewClick = (e: React.MouseEvent, studentId: string) => {
    e.stopPropagation()
    if (activeSchool) {
      navigate(`/school/${activeSchool.id}/students/${studentId}`)
    } else {
      navigate(`/students/${studentId}`)
    }
  }

  const handleAddStudent = async (data: NewStudentFormData) => {
    if (!activeSchool) {
      toast({
        title: 'Error',
        description: 'No school selected. Please select a school first.',
        variant: 'destructive',
      })
      return
    }

    // Check for duplicate student
    try {
      const duplicate = await studentsApi.checkDuplicateStudent(
        activeSchool.id,
        data.first_name,
        data.last_name
        // data.date_of_birth
      )

      if (duplicate) {
        toast({
          title: 'Duplicate Student',
          description: `A student with the name "${data.first_name} ${data.last_name}" already exists in this school.`,
          variant: 'destructive',
        })
        return
      }
    } catch (error) {
      console.error('Error checking for duplicate:', error)
      toast({
        title: 'Error',
        description: 'Failed to check for duplicate students. Please try again.',
        variant: 'destructive',
      })
      return
    }

    // Resolve grade ID if a grade level was selected
    let resolvedGradeId: string | undefined = undefined

    if (data.grade_level) {
      const currentDate = new Date()
      const currentYear = currentDate.getFullYear()
      const currentMonth = currentDate.getMonth()
      const academicYearStart = currentMonth < 7 ? currentYear - 1 : currentYear
      const academicYear = `${academicYearStart}-${academicYearStart + 1}`

      try {
        const gradeAvailability = await schoolGradesApi.checkGradeAvailability(
          activeSchool.id,
          data.grade_level,
          academicYear
        )

        if (gradeAvailability.exists && gradeAvailability.grade?.id) {
          resolvedGradeId = gradeAvailability.grade.id
        } else {
          const newGrade = await schoolGradesApi.createSchoolGrade({
            school_id: activeSchool.id,
            grade_level: data.grade_level,
            academic_year: academicYear,
          })
          resolvedGradeId = newGrade.id
        }
      } catch (error) {
        console.error('Error resolving grade:', error)
        // No return -- non-fatal can proceed without grade
      }
    }

    // Generate school abbreviation from school name
    const schoolAbbreviation = activeSchool.name
      .split(' ')
      .map(word => word.charAt(0).toUpperCase())
      .join('')
      .substring(0, 3) // Limit to 3 characters max

    // Generate a temporary unique ID using timestamp to avoid conflicts
    const timestamp = Date.now().toString(36)
    const tempStudentId = `${schoolAbbreviation}-TEMP-${timestamp}`

    // Create student with temporary ID
    createStudentMutation.mutate(
      {
        first_name: data.first_name,
        last_name: data.last_name,
        student_id: tempStudentId,
        school_id: activeSchool.id,
        qualifies_for_program: false,
        // ...(data.date_of_birth && { date_of_birth: data.date_of_birth }),
      },
      {
        onSuccess: newStudent => {
          // Generate the final student ID with school abbreviation and UUID
          const formattedStudentId = `${schoolAbbreviation}-${newStudent.id}`

          // Update the student with the formatted ID
          updateStudentMutation.mutate(
            {
              id: newStudent.id,
              studentData: {
                student_id: formattedStudentId,
                ...(resolvedGradeId && { current_grade_id: resolvedGradeId }),
              },
            },
            {
              onSuccess: () => {
                toast({
                  title: 'Success',
                  description: `Student ${newStudent.first_name} ${newStudent.last_name} added successfully.`,
                })
                setShowAddModal(false)
                newStudentForm.reset()
              },
              onError: error => {
                console.error('Error updating student ID:', error)
                toast({
                  title: 'Error',
                  description: 'Failed to finalize student ID. Please try again.',
                  variant: 'destructive',
                })
              },
            }
          )
        },
        onError: error => {
          console.error('Error adding student:', error)
          toast({
            title: 'Error',
            description: 'Failed to add student. Please try again.',
            variant: 'destructive',
          })
        },
      }
    )
  }

  const handleCloseNewStudentForm = () => {
    setShowAddModal(false)
    newStudentForm.reset()
  }

  if (isLoading || isPlaceholderData) {
    return <StudentsSkeleton />
  }

  const sortOptions: SortOption[] = [
    { label: 'Name', value: 'name', defaultDirection: 'asc' },
    { label: 'Grade', value: 'grade', defaultDirection: 'asc' },
    { label: 'Last Screening', value: 'date', defaultDirection: 'desc' },
  ]

  return (
    <div className='space-y-6'>
      {/* Header */}
      <div className='flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between'>
        <div>
          <h1 className='text-2xl font-semibold text-gray-900 lg:text-3xl'>Students</h1>
          <p className='text-gray-600'>Manage student information and records</p>
        </div>
        <Button onClick={() => setShowAddModal(true)} className='flex items-center gap-2'>
          <Plus className='w-4 h-4' />
          Add Student
        </Button>
      </div>

      {/* Filters */}
      <StudentTableFilters
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        gradeFilter={gradeFilter}
        setGradeFilter={setGradeFilter}
        dateRangeFilter={dateRangeFilter}
        setDateRangeFilter={setDateRangeFilter}
        programFilter={programFilter}
        setProgramFilter={setProgramFilter}
      />

      {/* Sort Controls */}
      <SortControls
        sortField={sortField}
        setSortField={setSortField}
        sortOrder={sortOrder}
        setSortOrder={setSortOrder}
        options={sortOptions}
      />

      {/* Students Table */}
      <div className='flex justify-end mb-3'>
        <span className='inline-flex items-center px-3 py-1 text-sm font-medium text-blue-800 bg-blue-100 rounded-full'>
          {filteredStudents.length} student{filteredStudents.length !== 1 ? 's' : ''} found
        </span>
      </div>

      <div className='overflow-hidden bg-white border border-gray-200 rounded-lg'>
        <ResponsiveTable className='w-full'>
          <TableHeader>
            <tr>
              <TableHead className='w-1/4 min-w-[200px]'>Name</TableHead>
              {/* <TableHead className='w-1/6 min-w-[120px]'>Grade</TableHead> */}
              <TableHead className='w-1/6 min-w-[150px]'>Last Screening</TableHead>

              {/* <TableHead className='w-1/6 text-center'>Consent</TableHead> */}

              {/* <TableHead className='w-1/6 min-w-[150px]'>Speech EA</TableHead> */}
            </tr>
          </TableHeader>

          <TableBody>
            {paginatedStudents.map(student => (
              <TableRow
                key={student.id}
                className='transition-colors cursor-pointer'
                onClick={() => handleRowClick(student.id)}>
                <TableCell className='p-4 font-medium transition-colors group-hover:bg-gray-100'>
                  <div className='flex flex-col gap-0.5'>
                    <span>
                      {student.first_name} {student.last_name}
                    </span>

                    {(() => {
                      const transfer = transferByStudentId.get(student.id)
                      if (transfer?.to_school_id === activeSchool?.id) {
                        return (
                          <span className='flex flex-col text-xs font-medium text-blue-600'>
                            <span>Transferred In ← {transfer.from_school?.name}</span>
                            <span>
                              {parseDateSafely(transfer.created_at).toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric',
                              })}
                            </span>
                          </span>
                        )
                      }
                      return null
                    })()}
                  </div>
                </TableCell>

                {/* <TableCell className='p-4 transition-colors group-hover:bg-gray-100'>
                  {getStudentGrade(student)}
                </TableCell> */}

                {/* <TableCell className='p-4 transition-colors group-hover:bg-gray-100'>
                  {getQualificationBadge(student)}
                </TableCell> */}

                <TableCell className='p-4 transition-colors group-hover:bg-gray-100'>
                  {getLastScreeningLabel(student)}
                </TableCell>

                {/* <TableCell className='p-4 text-center transition-colors group-hover:bg-gray-100'>
                  {consentSet.has(student.id) ? (
                    <FileCheck className='w-5 h-5 mx-auto text-green-600' />
                  ) : (
                    <FileX className='w-5 h-5 mx-auto text-red-400' />
                  )}
                </TableCell> */}

                {/* <TableCell className='p-4 transition-colors group-hover:bg-gray-100'>
                  {getSpeechEAName(student)}
                </TableCell> */}
              </TableRow>
            ))}
          </TableBody>
        </ResponsiveTable>

        {filteredStudents.length === 0 && (
          <div className='py-8 text-center'>
            <p className='text-gray-500'>
              {searchTerm
                ? 'No students found matching your search.'
                : 'No students found. Add your first student to get started.'}
            </p>
          </div>
        )}
      </div>

      {filteredStudents.length > 0 && (
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
                {[5, 10, 25, 50, 100].map(size => (
                  <SelectItem key={size} value={String(size)}>
                    {size}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className='flex items-center gap-1 text-sm text-gray-600'>
            <span>
              {(currentPage - 1) * pageSize + 1}–
              {Math.min(currentPage * pageSize, filteredStudents.length)} of{' '}
              {filteredStudents.length}
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

      {/* Add Student Modal */}
      <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
        <DialogContent className='max-w-2xl max-h-[90vh] overflow-y-auto'>
          <DialogHeader>
            <DialogTitle className='flex items-center gap-2'>
              <UserPlus className='w-4 h-4 mr-2' />
              Add New Student
            </DialogTitle>
          </DialogHeader>

          <Form {...newStudentForm}>
            <form onSubmit={newStudentForm.handleSubmit(handleAddStudent)} className='space-y-4'>
              <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
                <FormField
                  control={newStudentForm.control}
                  name='first_name'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>First Name *</FormLabel>
                      <FormControl>
                        <Input placeholder='Emma' {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={newStudentForm.control}
                  name='last_name'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Last Name *</FormLabel>
                      <FormControl>
                        <Input placeholder='Johnson' {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* <FormField
                control={newStudentForm.control}
                name='date_of_birth'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Date of Birth</FormLabel>
                    <FormControl>
                      <Input type='date' {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              /> */}

              <FormField
                control={newStudentForm.control}
                name='grade_level'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Grade Level</FormLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder='Select grade (optional)' />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {GRADE_MAPPING.map(grade => (
                          <SelectItem key={grade.value} value={grade.value}>
                            {grade.display}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className='flex justify-end pt-4 space-x-2'>
                <Button type='button' variant='outline' onClick={handleCloseNewStudentForm}>
                  Cancel
                </Button>
                <Button
                  type='submit'
                  disabled={createStudentMutation.isPending || updateStudentMutation.isPending}>
                  {createStudentMutation.isPending || updateStudentMutation.isPending
                    ? 'Adding...'
                    : 'Add Student'}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default StudentTable
