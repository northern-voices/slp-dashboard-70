import { useQuery } from '@tanstack/react-query'
import { dynamicGoalSheetsApi } from '@/api/dynamicGoalSheets'
import type { DynamicGoalSheetWithPages } from '@/types/database'

export const useDynamicGoalSheet = (id?: string) => {
  return useQuery<DynamicGoalSheetWithPages, Error>({
    queryKey: ['dynamic-goal-sheets', 'by-id', id],
    queryFn: () => {
      if (!id) throw new Error('Goal sheet ID is required')
      return dynamicGoalSheetsApi.getGoalSheetById(id)
    },
    enabled: !!id,
    staleTime: 1000 * 60 * 5,
  })
}

export const useDynamicGoalSheetsByStudent = (studentId?: string) => {
  return useQuery<DynamicGoalSheetWithPages[], Error>({
    queryKey: ['dynamic-goal-sheets', 'by-student', studentId],
    queryFn: () => {
      if (!studentId) throw new Error('Student ID is required')
      return dynamicGoalSheetsApi.getGoalSheetsByStudent(studentId)
    },
    enabled: !!studentId,
    staleTime: 1000 * 60 * 5,
  })
}

export const useDynamicGoalSheetsBySchool = (schoolId?: string) => {
  return useQuery<DynamicGoalSheetWithPages[], Error>({
    queryKey: ['dynamic-goal-sheets', 'by-school', schoolId],
    queryFn: () => {
      if (!schoolId) throw new Error('School ID is required')
      return dynamicGoalSheetsApi.getGoalSheetsBySchool(schoolId)
    },
    enabled: !!schoolId,
    staleTime: 1000 * 60 * 5,
  })
}
