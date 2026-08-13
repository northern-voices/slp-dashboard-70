import { Student } from '@/types/database'
import { SchoolGrade } from '@/api/schoolGrades'

export interface SpeechEA {
  id: string
  name: string
}

export const RESULT_SORT_ORDER = [
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

export const getStudentGrade = (student: Student, gradesMap: Map<string, SchoolGrade>): string => {
  if (student.current_grade_id) {
    const grade = gradesMap.get(student.current_grade_id)
    if (grade) return grade.grade_level
  }

  return 'N/A'
}

export const getSpeechEAName = (student: Student, speechEAs: SpeechEA[]): string => {
  return speechEAs.find(ea => ea.id === student.speech_ea_id)?.name ?? ''
}

export const isCurrentSchoolYear = (dateStr: string): boolean => {
  const date = new Date(dateStr)
  const syStartYear = date.getMonth() >= 8 ? date.getFullYear() : date.getFullYear() - 1
  const now = new Date()
  const currentSyStartYear = now.getMonth() >= 8 ? now.getFullYear() : now.getFullYear() - 1

  return syStartYear === currentSyStartYear
}

export const getSchoolYearLabel = (dateStr: string): string => {
  const date = new Date(dateStr)
  const startYear = date.getMonth() >= 8 ? date.getFullYear() : date.getFullYear() - 1

  return `${startYear}-${String(startYear + 1).slice(2)}`
}

// 0-indexed, August = 7, September = 8
export const getCurrentSchoolYearStart = (): Date => {
  const now = new Date()
  const month = now.getMonth()
  const year = now.getFullYear()

  // Sep 1 of this year else Sep 1 of last year
  return month >= 8 ? new Date(year, 8, 1) : new Date(year - 1, 8, 1)
}
