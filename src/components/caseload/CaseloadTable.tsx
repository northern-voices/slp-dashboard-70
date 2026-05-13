import { useState, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'
import { ChevronUp, ChevronDown, MoreHorizontal, Loader2, FileCheck, FileX } from 'lucide-react'
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
  SelectSeparator,
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
import {
  RESULT_OPTIONS,
  PROGRAM_OPTIONS,
  SERVICE_STATUS_OPTIONS,
} from '@/constants/screeningOptions'
import { GRADE_MAPPING } from '@/constants/app'
import { Student } from '@/types/database'
import { schoolGradesApi, type SchoolGrade } from '@/api/schoolGrades'
import { useSchoolDetails } from '@/hooks/school/useSchoolDetails'
import { useOrganization } from '@/contexts/OrganizationContext'
import { useScreeningsBySchool } from '@/hooks/screenings/use-screenings'
import { SCREENING_RESULTS } from '@/constants/screeningResults'
import type { Screening } from '@/types/database'
import { useUpdateStudent } from '@/hooks/students'
import { useToast } from '@/hooks/use-toast'
import { useConsentFormPresence } from '@/hooks/students/use-consent-forms'
import { useUpdateSpeechScreening } from '@/hooks/screenings'
import { ProgramStatus, ServiceStatus } from '@/types/database'
import { ErrorPatterns } from '@/types/screening-form'
import CaseloadStats from './CaseloadStats'
import CaseloadFilters from './CaseloadFilter'
import CreateEADialog from './CreateEADialog'
import ConsentFormModal from '../students/ConsentFormModal'

interface CaseloadTableProps {
  students: Student[]
  isLoading: boolean
  schoolId?: string
  searchTerm: string
}

const CaseloadTable = ({ students, isLoading, schoolId, searchTerm }: CaseloadTableProps) => {
  const [gradesMap, setGradesMap] = useState<Map<string, SchoolGrade>>(new Map())
  const [sortField, setSortField] = useState<
    'grade' | 'program_status' | 'name' | 'result' | 'consent' | null
  >('program_status')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc' | null>('asc')
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState<number | 'all'>(50)
  const [consentStudent, setConsentStudent] = useState<Student | null>(null)

  const [gradeFilter, setGradeFilter] = useState<string>('all')
  const [resultFilter, setResultFilter] = useState<string>('all')
  const [consentFilter, setConsentFilter] = useState<'all' | 'yes' | 'no'>('all')
  const [eaFilter, setEaFilter] = useState<string>('all')
  const [dateFilter, setDateFilter] = useState<string>('school_year')
  const [createEAOpen, setCreateEAOpen] = useState(false)
  const [programStatusFilter, setProgramStatusFilter] = useState<string>('all')

  const navigate = useNavigate()

  const handleNavigate = (path: string) => {
    if (schoolId) {
      navigate(`/school/${schoolId}/students/${path}`)
    } else {
      navigate(`/students/${path}`)
    }
  }

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

  const { data: allScreeningsData } = useScreeningsBySchool(schoolId, 'all', 1, 10000)
  const allSchoolScreenings = useMemo(
    () => allScreeningsData?.screenings ?? [],
    [allScreeningsData]
  )

  const apiDateFilter = dateFilter === 'school_year' ? 'school_year' : 'all'
  const { data: screeningsData } = useScreeningsBySchool(schoolId, apiDateFilter, 1, 10000)
  const schoolScreenings = useMemo(() => screeningsData?.screenings ?? [], [screeningsData])

  const availableSchoolYears = useMemo(() => {
    const years = new Set<string>()
    allSchoolScreenings.forEach(s => {
      const date = new Date(s.created_at)
      const month = date.getMonth()
      const year = date.getFullYear()
      const schoolYear = month >= 8 ? `${year}-${year + 1}` : `${year - 1}-${year}`
      years.add(schoolYear)
    })
    return Array.from(years).sort().reverse()
  }, [allSchoolScreenings])

  const latestScreeningByStudent = useMemo(() => {
    const map = new Map<string, Screening>()

    let screeningsToProcess = allSchoolScreenings.filter(s => s.source_table === 'speech')

    if (dateFilter.startsWith('sy_')) {
      const [startYear, endYear] = dateFilter.replace('sy_', '').split('-').map(Number)
      const syStart = new Date(startYear, 8, 1)
      const syEnd = new Date(endYear, 7, 31, 23, 59, 59)
      screeningsToProcess = screeningsToProcess.filter(s => {
        const d = new Date(s.created_at)
        return d >= syStart && d <= syEnd
      })
    }

    screeningsToProcess.forEach(screening => {
      const existing = map.get(screening.student_id)
      if (!existing || new Date(screening.created_at) > new Date(existing.created_at)) {
        map.set(screening.student_id, screening)
      }
    })

    return map
  }, [allSchoolScreenings, dateFilter])

  const { mutate: updateStudent } = useUpdateStudent()
  const { mutate: updateSpeechScreening } = useUpdateSpeechScreening()

  const [updatingStudentId, setUpdatingStudentId] = useState<string | null>(null)

  const { toast } = useToast()

  const handleAssignEA = (student: Student, staffId: string) => {
    const newEaId = staffId === 'none' ? null : staffId

    updateStudent(
      { id: student.id, studentData: { speech_ea_id: newEaId } },
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

  const getResultBadge = (result?: string | null) => {
    if (!result) return <span className='text-gray-400 text-sm'>—</span>

    const config = SCREENING_RESULTS[result as keyof typeof SCREENING_RESULTS]
    if (!config) return <span className='text-gray-400 text-sm'>—</span>

    return <Badge className={`${config.color} font-medium text-[10px]`}>{config.label}</Badge>
  }

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
        return <Badge className='bg-gray-100 text-gray-800 font-medium text-[10px]'>None</Badge>
    }
  }

  const isCurrentSchoolYear = (dateStr: string): boolean => {
    const date = new Date(dateStr)
    const syStartYear = date.getMonth() >= 8 ? date.getFullYear() : date.getFullYear() - 1
    const now = new Date()
    const currentSyStartYear = now.getMonth() >= 8 ? now.getFullYear() : now.getFullYear() - 1

    return syStartYear === currentSyStartYear
  }

  const getSchoolYearLabel = (dateStr: string): string => {
    const date = new Date(dateStr)
    const startYear = date.getMonth() >= 8 ? date.getFullYear() : date.getFullYear() - 1

    return `${startYear}-${String(startYear + 1).slice(2)}`
  }

  const handleSort = (field: 'grade' | 'program_status' | 'name' | 'result' | 'consent') => {
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

  const handleResultChange = (student: Student, newResult: string) => {
    const screening = latestScreeningByStudent.get(student.id)
    if (!screening) return

    setUpdatingStudentId(student.id)
    updateSpeechScreening(
      { id: screening.id, data: { result: newResult } },
      {
        onSuccess: () => {
          setUpdatingStudentId(null)
          toast({ title: 'Result updated' })
        },
        onError: error => {
          setUpdatingStudentId(null)
          toast({
            title: 'Error updating result',
            description: error.message,
            variant: 'destructive',
          })
        },
      }
    )
  }

  const handleProgramChange = (student: Student, newProgram: ProgramStatus) => {
    const screening = latestScreeningByStudent.get(student.id)
    if (!screening) return

    setUpdatingStudentId(student.id)
    const currentErrorPatterns = screening.error_patterns || ({} as ErrorPatterns)

    const cleanErrorPatterns: Partial<ErrorPatterns> = {
      articulation: currentErrorPatterns.articulation || ({} as ErrorPatterns['articulation']),
      add_areas_of_concern:
        currentErrorPatterns.add_areas_of_concern || ({} as ErrorPatterns['add_areas_of_concern']),
      attendance: currentErrorPatterns.attendance || ({} as ErrorPatterns['attendance']),
      additional_observations: currentErrorPatterns.additional_observations || '',
      consent: {
        ...(currentErrorPatterns.consent || {}),
        no_consent: newProgram === 'no_consent',
      },
      screening_metadata: {
        ...(currentErrorPatterns.screening_metadata || {}),
        qualifies_for_speech_program: newProgram === 'qualified',
        sub: newProgram === 'sub',
      } as ErrorPatterns['screening_metadata'],
    }

    updateSpeechScreening(
      {
        id: screening.id,
        data: { error_patterns: cleanErrorPatterns as ErrorPatterns },
      },
      {
        onSuccess: () => {
          updateStudent(
            { id: student.id, studentData: { program_status: newProgram, service_status: null } },
            {
              onSuccess: () => {
                setUpdatingStudentId(null)
                toast({ title: 'Program updated' })
              },
              onError: () => {
                setUpdatingStudentId(null)
                toast({
                  title: 'Warning',
                  description: 'Screening update but failed to update the student',
                  variant: 'destructive',
                })
              },
            }
          )
        },
        onError: error => {
          setUpdatingStudentId(null)
          toast({
            title: 'Error updating program',
            description: error.message,
            variant: 'destructive',
          })
        },
      }
    )
  }

  const handleStatusChange = (student: Student, newStatus: ServiceStatus) => {
    setUpdatingStudentId(student.id)

    updateStudent(
      {
        id: student.id,
        studentData: { service_status: newStatus === 'none' ? null : newStatus },
      },
      {
        onSuccess: () => {
          setUpdatingStudentId(null)
          toast({ title: 'Status updated' })
        },
        onError: () => {
          setUpdatingStudentId(null)
          toast({
            title: 'Error updating status',
            description: 'Failed to update student status',
            variant: 'destructive',
          })
        },
      }
    )
  }

  const getSortIcon = (field: 'grade' | 'program_status' | 'name' | 'result' | 'consent') => {
    if (sortField !== field) return <ChevronUp className='w-4 h-4 opacity-30' />
    if (sortOrder === 'asc') return <ChevronUp className='w-4 h-4' />

    return <ChevronDown className='w-4 h-4' />
  }

  const hasActiveFilters =
    gradeFilter !== 'all' ||
    resultFilter !== 'all' ||
    consentFilter !== 'all' ||
    eaFilter !== 'all' ||
    dateFilter !== 'school_year' ||
    programStatusFilter !== 'all'

  const clearAllFilters = () => {
    setGradeFilter('all')
    setResultFilter('all')
    setConsentFilter('all')
    setEaFilter('all')
    setDateFilter('school_year')
    setProgramStatusFilter('all')
    setCurrentPage(1)
  }

  const studentIds = useMemo(() => students.map(student => student.id), [students])
  const { data: consentStudentIds = [] } = useConsentFormPresence(studentIds)
  const consentSet = useMemo(() => new Set(consentStudentIds), [consentStudentIds])

  const getConsentBadge = (student: Student) => {
    if (consentSet.has(student.id)) {
      return <FileCheck className='h-5 w-5 text-green-600 mx-auto' />
    }

    return <FileX className='h-5 w-5 text-red-400 mx-auto' />
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

  const filteredStudents = students.filter(student => {
    const fullName = `${student.first_name} ${student.last_name}`.toLowerCase()
    const matchesSearch = fullName.includes(searchTerm.toLowerCase())

    const screening = latestScreeningByStudent.get(student.id)

    const matchesCaseload =
      dateFilter === 'school_year'
        ? student.program_status === 'qualified' || student.program_status === 'sub'
        : screening?.program_status === 'qualified' || screening?.program_status === 'sub'

    // TODO: Code for getting caseload for only this school year
    // const matchesCaseload =
    //   dateFilter === 'school_year'
    //     ? (student.program_status === 'qualified' || student.program_status === 'sub') &&
    //       !!screening
    //     : screening?.program_status === 'qualified' || screening?.program_status === 'sub'

    const matchesGrade = gradeFilter === 'all' || getStudentGrade(student).includes(gradeFilter)

    const matchesResult = resultFilter === 'all' || (screening?.result ?? 'none') === resultFilter

    const hasConsent = consentSet.has(student.id)
    const matchesConsent =
      consentFilter === 'all' || (consentFilter === 'yes' ? hasConsent : !hasConsent)

    const matchesEA =
      eaFilter === 'all' ||
      (eaFilter === 'none' ? !student.speech_ea_id : student.speech_ea_id === eaFilter)

    return (
      matchesSearch &&
      matchesCaseload &&
      matchesGrade &&
      matchesResult &&
      matchesConsent &&
      matchesEA
    )
  })

  const caseloadStats = {
    qualified: filteredStudents.filter(
      student =>
        student.program_status === 'qualified' &&
        student.service_status !== 'paused' &&
        student.service_status !== 'graduated' &&
        student.service_status !== 'transferred'
    ).length,
    sub: filteredStudents.filter(
      student =>
        student.program_status === 'sub' &&
        student.service_status !== 'paused' &&
        student.service_status !== 'graduated' &&
        student.service_status !== 'transferred'
    ).length,
    paused: filteredStudents.filter(s => s.service_status === 'paused').length,
  }

  const sortedStudents = [...filteredStudents].sort((a, b) => {
    if (!sortField || !sortOrder) {
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    }

    let comparison = 0

    if (sortField === 'name') {
      const nameA = `${a.last_name} ${a.first_name}`.toLowerCase()
      const nameB = `${b.last_name} ${b.first_name}`.toLowerCase()
      comparison = nameA.localeCompare(nameB)
    }

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
      if (comparison === 0) {
        const indexA = GRADE_MAPPING.findIndex(g => getStudentGrade(a).includes(g.value))
        const indexB = GRADE_MAPPING.findIndex(g => getStudentGrade(b).includes(g.value))
        if (indexA === -1 && indexB === -1) comparison = 0
        else if (indexA === -1) comparison = 1
        else if (indexB === -1) comparison = -1
        else comparison = indexA - indexB
      }
    }

    if (sortField === 'result') {
      const resultOrder = [
        'no_errors',
        'age_appropriate',
        'monitor',
        'mild',
        'moderate',
        'severe',
        'profound',
        'complex_needs',
        'unable_to_screen',
        'absent',
        'non_registered_no_consent',
      ]
      const rA = latestScreeningByStudent.get(a.id)?.result ?? ''
      const rB = latestScreeningByStudent.get(b.id)?.result ?? ''
      const iA = resultOrder.indexOf(rA)
      const iB = resultOrder.indexOf(rB)
      comparison = (iA === -1 ? 99 : iA) - (iB === -1 ? 99 : iB)
    }

    if (sortField === 'consent') {
      const cA = consentSet.has(a.id) ? 0 : 1
      const cB = consentSet.has(b.id) ? 0 : 1
      comparison = cA - cB
    }

    return sortOrder === 'asc' ? comparison : -comparison
  })

  const inactiveStatuses = ['paused', 'graduated', 'transferred']

  let programFilteredStudents = sortedStudents

  if (programStatusFilter === 'paused') {
    programFilteredStudents = sortedStudents.filter(student => student.service_status === 'paused')
  } else if (programStatusFilter !== 'all') {
    programFilteredStudents = sortedStudents.filter(
      student =>
        student.program_status === programStatusFilter &&
        !inactiveStatuses.includes(student.service_status ?? '')
    )
  }

  const totalStudents = programFilteredStudents.length
  const effectiveItemsPerPage = itemsPerPage === 'all' ? totalStudents : itemsPerPage
  const totalPages = Math.max(1, Math.ceil(totalStudents / effectiveItemsPerPage))
  const startIndex = (currentPage - 1) * effectiveItemsPerPage
  const paginatedStudents = programFilteredStudents.slice(
    startIndex,
    startIndex + effectiveItemsPerPage
  )

  return (
    <div className='space-y-4'>
      {/* Caseload Stats */}
      <CaseloadStats
        stats={caseloadStats}
        activeFilter={programStatusFilter}
        onFilterChange={setProgramStatusFilter}
      />

      <CaseloadFilters
        gradeFilter={gradeFilter}
        setGradeFilter={setGradeFilter}
        resultFilter={resultFilter}
        setResultFilter={setResultFilter}
        consentFilter={consentFilter}
        setConsentFilter={setConsentFilter}
        eaFilter={eaFilter}
        setEaFilter={setEaFilter}
        dateFilter={dateFilter}
        setDateFilter={setDateFilter}
        programStatusFilter={programStatusFilter}
        speechEAs={speechEAs}
        availableSchoolYears={availableSchoolYears}
        onClearAll={clearAllFilters}
        onPageReset={() => setCurrentPage(1)}
      />

      <div className='flex justify-end mb-3'>
        <span className='inline-flex items-center px-3 py-1 text-sm font-medium text-blue-800 bg-blue-100 rounded-full'>
          {totalStudents} student{totalStudents !== 1 ? 's' : ''} found
        </span>
      </div>

      <div className='overflow-hidden bg-white border border-gray-200 rounded-lg'>
        <ResponsiveTable className='w-full'>
          <TableHeader>
            <tr>
              <TableHead className='w-1/5 min-w-[180px]'>
                <Button
                  variant='ghost'
                  onClick={() => handleSort('name')}
                  className='h-auto p-0 font-medium hover:bg-transparent'>
                  Student
                  <span className='ml-1'>{getSortIcon('name')}</span>
                </Button>
              </TableHead>

              <TableHead className='w-[55px]'>
                <Button
                  variant='ghost'
                  onClick={() => handleSort('grade')}
                  className='h-auto p-0 font-medium hover:bg-transparent'>
                  Grade
                  <span className='ml-1'>{getSortIcon('grade')}</span>
                </Button>
              </TableHead>

              <TableHead className='w-[70px]'>
                <Button
                  variant='ghost'
                  onClick={() => handleSort('program_status')}
                  className='h-auto p-0 font-medium hover:bg-transparent'>
                  Program
                  <span className='ml-1'>{getSortIcon('program_status')}</span>
                </Button>
              </TableHead>

              <TableHead className='w-[190px]'>
                <Button
                  variant='ghost'
                  onClick={() => handleSort('result')}
                  className='h-auto p-0 font-medium hover:bg-transparent'>
                  Result
                  <span className='ml-1'>{getSortIcon('result')}</span>
                </Button>
              </TableHead>

              <TableHead className='w-[55px]'>Status</TableHead>

              <TableHead className='w-[55px] text-center'>
                <Button
                  variant='ghost'
                  onClick={() => handleSort('consent')}
                  className='h-auto p-0 font-medium hover:bg-transparent'>
                  <span className='w-4 h-4 mr-1 inline-block opacity-0' />
                  Consent
                  <span className='ml-1'>{getSortIcon('consent')}</span>
                </Button>
              </TableHead>

              <TableHead className='w-[150px]'>Speech EA</TableHead>

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

                {/* <TableCell>{getProgramBadge(student)}</TableCell> */}

                {/* Functionality to be able to change the program but leave it out for now */}
                <TableCell>
                  <Select
                    value={student.program_status ?? 'none'}
                    onValueChange={value => handleProgramChange(student, value as ProgramStatus)}
                    disabled={updatingStudentId === student.id}>
                    <SelectTrigger className='w-full h-8 p-0 border-none hover:bg-transparent focus:ring-0'>
                      <SelectValue>
                        <div className='flex items-center gap-2'>
                          {updatingStudentId === student.id && (
                            <Loader2 className='w-3 h-3 text-blue-600 animate-spin' />
                          )}
                          {getProgramBadge(student)}
                        </div>
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      {PROGRAM_OPTIONS.map(option => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </TableCell>

                <TableCell>
                  {latestScreeningByStudent.get(student.id)
                    ? (() => {
                        const screening = latestScreeningByStudent.get(student.id)
                        return (
                          <Select
                            value={screening?.result ?? ''}
                            onValueChange={value => handleResultChange(student, value)}
                            disabled={updatingStudentId === student.id || !screening}>
                            <SelectTrigger className='w-full h-8 p-0 border-none hover:bg-transparent focus:ring-0'>
                              <SelectValue>
                                <div className='flex items-center gap-1.5'>
                                  {updatingStudentId === student.id && (
                                    <Loader2 className='w-3 h-3 text-blue-600 animate-spin' />
                                  )}
                                  {getResultBadge(screening?.result)}
                                  {screening && !isCurrentSchoolYear(screening.created_at) && (
                                    <span className='text-[10px] text-gray-400 whitespace-nowrap'>
                                      {getSchoolYearLabel(screening.created_at)}
                                    </span>
                                  )}
                                </div>
                              </SelectValue>
                            </SelectTrigger>
                            <SelectContent>
                              {RESULT_OPTIONS.map(option => (
                                <SelectItem key={option.value} value={option.value}>
                                  {option.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        )
                      })()
                    : getResultBadge(undefined)}
                </TableCell>

                <TableCell>
                  <Select
                    value={student.service_status ?? 'none'}
                    onValueChange={value => handleStatusChange(student, value as ServiceStatus)}
                    disabled={updatingStudentId === student.id}>
                    <SelectTrigger className='w-full h-8 p-0 border-none hover:bg-transparent focus:ring-0'>
                      <SelectValue>
                        <div className='flex items-center gap-2'>
                          {updatingStudentId === student.id && (
                            <Loader2 className='w-3 h-3 text-blue-600 animate-spin' />
                          )}
                          {getStatusBadge(student)}
                        </div>
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      {SERVICE_STATUS_OPTIONS.map(option => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </TableCell>

                <TableCell className='text-center'>{getConsentBadge(student)}</TableCell>

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
                    <SelectTrigger className='w-full h-8 p-0 border-none hover:bg-transparent focus:ring-0'>
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
                      <SelectItem value='__create_new__' className='text-blue-600 font-medium'>
                        + Create new EA
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </TableCell>

                <TableCell className='text-center'>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant='ghost' size='sm' className='h-8 w-8 p-0'>
                        <MoreHorizontal className='h-4 w-4' />
                      </Button>
                    </DropdownMenuTrigger>

                    <DropdownMenuContent align='end'>
                      <DropdownMenuItem onClick={() => handleNavigate(student.id)}>
                        View Student
                      </DropdownMenuItem>

                      <DropdownMenuItem onClick={() => setConsentStudent(student)}>
                        Add Consent
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </ResponsiveTableRow>
            ))}
          </TableBody>
        </ResponsiveTable>

        {totalStudents === 0 && (
          <div className='py-8 text-center'>
            <p className='text-gray-500'>
              {searchTerm || hasActiveFilters
                ? 'No students found matching your filters.'
                : 'No students found in your caseload.'}
            </p>
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalStudents > 0 && (
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
      )}

      {consentStudent && (
        <ConsentFormModal
          isOpen={true}
          onClose={() => setConsentStudent(null)}
          student={consentStudent}
        />
      )}

      <CreateEADialog open={createEAOpen} onOpenChange={setCreateEAOpen} schoolId={schoolId} />
    </div>
  )
}

export default CaseloadTable
