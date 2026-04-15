import { useState, useMemo } from 'react'

import { parseDateSafely } from '@/utils/dateUtils'
import type { Screening, Student } from '@/types/database'
import type { SchoolGrade } from '@/api/schoolGrades'

interface UseScreeningsFilterParams {
  screenings: Screening[]
  deduplicateByStudent?: boolean
  searchTerm: string
  resultFilter: string
  dateRangeFilter: string
  qualifiesForSpeechProgramFilter: string[]
  vocabularySupportFilter: string
  casFilter: string
  gradeFilter: string
  recommendationsFilter: string
  clinicalNotesFilter: string
  languageComprehensionFilter: string
  priorityRescreenFilter: string
  studentsMap: Map<string, Student>
  gradesMap: Map<string, SchoolGrade>
  isLoadingGrades: boolean
}

export const useScreeningsFilter = ({
  screenings,
  deduplicateByStudent,
  searchTerm,
  resultFilter,
  dateRangeFilter,
  qualifiesForSpeechProgramFilter,
  vocabularySupportFilter,
  casFilter,
  gradeFilter,
  recommendationsFilter,
  clinicalNotesFilter,
  languageComprehensionFilter,
  priorityRescreenFilter,
  studentsMap,
  gradesMap,
  isLoadingGrades,
}: UseScreeningsFilterParams) => {
  const [sortField, setSortField] = useState<'date' | 'name' | 'grade' | null>(null)
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc' | null>(null)

  const getScreeningGrade = (screening: Screening): string => {
    const student = studentsMap.get(screening.student_id)

    if (student?.current_grade_id) {
      if (isLoadingGrades) {
        return '...'
      }
      const grade = gradesMap.get(student.current_grade_id)
      if (grade) return grade.grade_level
    }

    return screening.grade || 'N/A'
  }

  const latestScreeningsByStudent = useMemo(() => {
    return Array.from(
      screenings
        .reduce((map, s) => {
          const existing = map.get(s.student_id)
          if (!existing || new Date(s.created_at) > new Date(existing.created_at)) {
            map.set(s.student_id, s)
          }
          return map
        }, new Map<string, Screening>())
        .values()
    )
  }, [screenings])

  const filteredScreenings = (deduplicateByStudent ? latestScreeningsByStudent : screenings).filter(
    screening => {
      const matchesSearch =
        screening.student_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        screening.screener?.toLowerCase().includes(searchTerm.toLowerCase())

      const matchesResult =
        resultFilter === 'all' ||
        screening.result === resultFilter ||
        screening.screening_result === resultFilter

      let matchesDateRange = true
      if (dateRangeFilter !== 'all') {
        const screeningDate = parseDateSafely(screening.created_at)
        const now = new Date()

        switch (dateRangeFilter) {
          case 'today': {
            matchesDateRange = screeningDate.toLocaleDateString() === now.toLocaleDateString()
            break
          }
          case 'week': {
            matchesDateRange = screeningDate >= new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
            break
          }
          case 'month': {
            matchesDateRange = screeningDate >= new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
            break
          }
          case 'quarter': {
            matchesDateRange = screeningDate >= new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000)
            break
          }
          case 'school_year': {
            const currentYear = now.getFullYear()
            const currentMonth = now.getMonth()
            const schoolYearStart =
              currentMonth >= 8 ? new Date(currentYear, 8, 1) : new Date(currentYear - 1, 8, 1)
            matchesDateRange = screeningDate >= schoolYearStart
            break
          }
          default: {
            if (dateRangeFilter.startsWith('sy_')) {
              const [startYear, endYear] = dateRangeFilter.replace('sy_', '').split('-').map(Number)
              const syStart = new Date(startYear, 8, 1)
              const syEnd = new Date(endYear, 7, 31, 23, 59, 59)
              matchesDateRange = screeningDate >= syStart && screeningDate <= syEnd
            }
            break
          }
        }
      }

      let matchesQualifiesForSpeechProgram = true
      if (qualifiesForSpeechProgramFilter.length > 0) {
        const metadata = screening.error_patterns?.screening_metadata
        const consent = screening.error_patterns?.consent

        matchesQualifiesForSpeechProgram = qualifiesForSpeechProgramFilter.some(filter => {
          if (filter === 'qualified') return metadata?.qualifies_for_speech_program === true
          if (filter === 'not_in_program')
            return (
              metadata?.qualifies_for_speech_program === false &&
              !metadata?.sub &&
              !metadata?.paused &&
              !metadata?.graduated &&
              !consent?.no_consent
            )
          if (filter === 'sub') return metadata?.sub === true
          if (filter === 'paused') return metadata?.paused === true
          if (filter === 'graduated') return metadata?.graduated === true
          if (filter === 'no_consent') return consent?.no_consent === true
          return false
        })
      }

      let matchesGrade = true
      if (gradeFilter !== 'all') {
        const grade = getScreeningGrade(screening)
        const gradeStr = typeof grade === 'string' ? grade : ''
        matchesGrade = gradeStr === gradeFilter
      }

      let matchesVocabularySupport = true
      if (vocabularySupportFilter !== 'all') {
        matchesVocabularySupport =
          screening.vocabulary_support === (vocabularySupportFilter === 'true')
      }

      let matchesCAS = true
      if (casFilter !== 'all') {
        const suspectedCAS = screening.error_patterns?.add_areas_of_concern?.suspected_cas
        if (casFilter === 'has_text') {
          matchesCAS = suspectedCAS !== null && suspectedCAS !== undefined && suspectedCAS !== ''
        } else if (casFilter === 'no_text') {
          matchesCAS = !suspectedCAS || suspectedCAS === ''
        }
      }

      let matchesLanguageComprehension = true
      if (languageComprehensionFilter !== 'all') {
        const lc = screening.error_patterns?.add_areas_of_concern?.language_comprehension
        if (languageComprehensionFilter === 'concern') {
          matchesLanguageComprehension = lc !== null && lc !== undefined && lc !== ''
        } else if (languageComprehensionFilter === 'no_concern') {
          matchesLanguageComprehension = !lc || lc === ''
        }
      }

      let matchesPriorityRescreen = true
      if (priorityRescreenFilter !== 'all') {
        const pr = screening.error_patterns?.attendance?.priority_re_screen
        if (priorityRescreenFilter === 'true') {
          matchesPriorityRescreen = pr === true
        } else if (priorityRescreenFilter === 'false') {
          matchesPriorityRescreen = pr === false || pr === null || pr === undefined
        }
      }

      let matchesRecommendations = true
      if (recommendationsFilter !== 'all') {
        const hasReferralNotes = screening.referral_notes && screening.referral_notes.trim() !== ''
        if (recommendationsFilter === 'has_referral_notes') {
          matchesRecommendations = !!hasReferralNotes
        } else if (recommendationsFilter === 'no_referral_notes') {
          matchesRecommendations = !hasReferralNotes
        }
      }

      let matchesClinicalNotes = true
      if (clinicalNotesFilter !== 'all') {
        const hasClinicalNotes = screening.clinical_notes && screening.clinical_notes.trim() !== ''
        if (clinicalNotesFilter === 'has_notes') {
          matchesClinicalNotes = !!hasClinicalNotes
        } else if (clinicalNotesFilter === 'no_notes') {
          matchesClinicalNotes = !hasClinicalNotes
        }
      }

      return (
        matchesSearch &&
        matchesResult &&
        matchesDateRange &&
        matchesQualifiesForSpeechProgram &&
        matchesGrade &&
        matchesVocabularySupport &&
        matchesCAS &&
        matchesLanguageComprehension &&
        matchesPriorityRescreen &&
        matchesRecommendations &&
        matchesClinicalNotes
      )
    }
  )

  const sortedScreenings = [...filteredScreenings].sort((a, b) => {
    if (!sortOrder || !sortField) return 0

    let comparison = 0
    switch (sortField) {
      case 'date': {
        comparison = new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
        break
      }
      case 'name': {
        comparison = (a.student_name || '').localeCompare(b.student_name || '')
        break
      }
      case 'grade': {
        const gradeA = getScreeningGrade(a)
        const gradeB = getScreeningGrade(b)
        comparison = (typeof gradeA === 'string' ? gradeA : '').localeCompare(
          typeof gradeB === 'string' ? gradeB : ''
        )
        break
      }
    }

    return sortOrder === 'asc' ? comparison : -comparison
  })

  const handleSort = (field: 'date' | 'name' | 'grade') => {
    if (sortField !== field) {
      setSortField(field)
      setSortOrder('desc')
    } else if (sortOrder === 'desc') {
      setSortOrder('asc')
    } else {
      setSortField(null)
      setSortOrder(null)
    }
  }

  return {
    filteredScreenings,
    sortedScreenings,
    sortField,
    sortOrder,
    handleSort,
    getScreeningGrade,
  }
}
