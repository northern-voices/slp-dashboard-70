import { useState, useMemo } from 'react'
import { ChevronUp, ChevronDown } from 'lucide-react'
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
