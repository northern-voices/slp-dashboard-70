import { useEffect, useMemo, useState } from 'react'
import { Student, Screening } from '@/types/database'
import { schoolGradesApi, type SchoolGrade } from '@/api/schoolGrades'
import { useSchoolDetails } from '@/hooks/school/useSchoolDetails'
import { useOrganization } from '@/contexts/OrganizationContext'
import { useScreeningsBySchool } from '@/hooks/screenings/use-screenings'
import { useConsentFormPresence } from '@/hooks/students/use-consent-forms'
import { GRADE_MAPPING } from '@/constants/app'
import { getStudentGrade, getSpeechEAName, RESULT_SORT_ORDER } from './caseloadUtils'
import {
  getCurrentAcademicYear,
  getCurrentAcademicYearStartDate,
  getAcademicYearRange,
} from '@/lib/academicYear'

export const useCaseloadTableData = (students: Student[], schoolId?: string) => {
  const [gradesMap, setGradesMap] = useState<Map<string, SchoolGrade>>(new Map())
  const [sortField, setSortField] = useState<string | null>('program_status')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc' | null>('asc')
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState<number | 'all'>(50)

  const [gradeFilter, setGradeFilter] = useState<string>('all')
  const [resultFilter, setResultFilter] = useState<string>('all')
  const [consentFilter, setConsentFilter] = useState<'all' | 'yes' | 'no'>('all')
  const [eaFilter, setEaFilter] = useState<string>('all')
  const [dateFilter, setDateFilter] = useState<string>('school_year')
  const [programStatusFilter, setProgramStatusFilter] = useState<string>('all')
  const [searchTerm, setSearchTerm] = useState('')

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
  const { data: schoolDetails, refetch: refetchSchoolDetails } = useSchoolDetails(
    currentSchool ?? null
  )

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
      years.add(getCurrentAcademicYear(new Date(s.created_at)))
    })
    return Array.from(years).sort().reverse()
  }, [allSchoolScreenings])

  const latestScreeningByStudent = useMemo(() => {
    const map = new Map<string, Screening>()

    let screeningsToProcess = allSchoolScreenings.filter(s => s.source_table === 'speech')

    if (dateFilter.startsWith('sy_')) {
      const { start: syStart, end: syEnd } = getAcademicYearRange(dateFilter.replace('sy_', ''))
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

  const speechEAs =
    schoolDetails?.schoolTeam?.filter(member => member.roles.includes('speech_ea')) ?? []

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

  const schoolYearStart = getCurrentAcademicYearStartDate()

  const consentSet = useMemo(
    () =>
      new Set(
        (consentStudentIds ?? [])
          .filter(
            r => r.consent_purpose === 'therapy' && new Date(r.consent_date) >= schoolYearStart
          )
          .map(r => r.student_id)
      ),
    [consentStudentIds, schoolYearStart]
  )

  const filteredStudents = students.filter(student => {
    const fullName = `${student.first_name} ${student.last_name}`.toLowerCase()
    const matchesSearch = fullName.includes(searchTerm.toLowerCase())

    const screening = latestScreeningByStudent.get(student.id)

    const matchesCaseload = (() => {
      const programStatus =
        dateFilter === 'school_year' ? student.program_status : screening?.program_status

      return (
        programStatus === 'qualified' || programStatus === 'sub' || programStatus === 'graduated'
      )
    })()

    const matchesGrade =
      gradeFilter === 'all' || getStudentGrade(student, gradesMap).includes(gradeFilter)

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
    qualified: filteredStudents.filter(s => s.program_status === 'qualified').length,
    sub: filteredStudents.filter(s => s.program_status === 'sub').length,
    paused: filteredStudents.filter(s => s.service_status === 'paused').length,
    graduated: filteredStudents.filter(s => s.program_status === 'graduated').length,
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
      const indexA = GRADE_MAPPING.findIndex(g => getStudentGrade(a, gradesMap).includes(g.value))
      const indexB = GRADE_MAPPING.findIndex(g => getStudentGrade(b, gradesMap).includes(g.value))
      if (indexA === -1 && indexB === -1) comparison = 0
      else if (indexA === -1) comparison = 1
      else if (indexB === -1) comparison = -1
      else comparison = indexA - indexB
    }

    if (sortField === 'program_status') {
      const programOrder = { qualified: 0, sub: 1, graduated: 2, none: 3 }

      comparison =
        (programOrder[a.program_status as keyof typeof programOrder] ?? 99) -
        (programOrder[b.program_status as keyof typeof programOrder] ?? 99)

      if (comparison === 0) {
        const aIsPaused = a.service_status === 'paused'
        const bIsPaused = b.service_status === 'paused'
        if (aIsPaused !== bIsPaused) {
          comparison = aIsPaused ? 1 : -1
        }
      }

      if (comparison === 0) {
        const indexA = GRADE_MAPPING.findIndex(g => getStudentGrade(a, gradesMap).includes(g.value))
        const indexB = GRADE_MAPPING.findIndex(g => getStudentGrade(b, gradesMap).includes(g.value))
        if (indexA === -1 && indexB === -1) comparison = 0
        else if (indexA === -1) comparison = 1
        else if (indexB === -1) comparison = -1
        else comparison = indexA - indexB
      }
    }

    if (sortField === 'result') {
      const rA = latestScreeningByStudent.get(a.id)?.result ?? ''
      const rB = latestScreeningByStudent.get(b.id)?.result ?? ''
      const iA = RESULT_SORT_ORDER.indexOf(rA)
      const iB = RESULT_SORT_ORDER.indexOf(rB)
      comparison = (iA === -1 ? 99 : iA) - (iB === -1 ? 99 : iB)
    }

    if (sortField === 'consent') {
      const cA = consentSet.has(a.id) ? 0 : 1
      const cB = consentSet.has(b.id) ? 0 : 1
      comparison = cA - cB
    }

    if (sortField === 'speech_ea') {
      const eaA = getSpeechEAName(a, speechEAs)
      const eaB = getSpeechEAName(b, speechEAs)
      // Students with no EA assigned goes to bottom
      if (eaA === '-' && eaB === '-') comparison = 0
      else if (eaA === '-') return 1
      else if (eaB === '-') return -1
      else comparison = eaA.localeCompare(eaB)
    }

    return sortOrder === 'asc' ? comparison : -comparison
  })

  const inactiveStatuses = ['paused']

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

  return {
    gradesMap,
    speechEAs,
    refetchSchoolDetails,

    sortField,
    setSortField,
    sortOrder,
    setSortOrder,

    currentPage,
    setCurrentPage,
    itemsPerPage,
    setItemsPerPage,

    gradeFilter,
    setGradeFilter,
    resultFilter,
    setResultFilter,
    consentFilter,
    setConsentFilter,
    eaFilter,
    setEaFilter,
    dateFilter,
    setDateFilter,
    programStatusFilter,
    setProgramStatusFilter,
    searchTerm,
    setSearchTerm,

    hasActiveFilters,
    clearAllFilters,
    availableSchoolYears,
    latestScreeningByStudent,
    consentSet,
    caseloadStats,

    paginatedStudents,
    totalStudents,
    totalPages,
    startIndex,
    effectiveItemsPerPage,
  }
}
