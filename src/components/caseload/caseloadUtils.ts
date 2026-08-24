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
