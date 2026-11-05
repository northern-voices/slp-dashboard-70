import { useQuery } from '@tanstack/react-query'
import { customizableGoalSheetsApi } from '@/api/customizableGoalSheets'
import type { CustomizableGoalSheetWithPages } from '@/types/database'

export const useCustomizableGoalSheet = (id?: string) => {
  return useQuery<CustomizableGoalSheetWithPages, Error>({
    queryKey: ['customizable-goal-sheets', 'by-id', id],
    queryFn: () => {
      if (!id) throw new Error('Goal sheet ID is required')
      return customizableGoalSheetsApi.getGoalSheetById(id)
    },
    enabled: !!id,
    staleTime: 1000 * 60 * 5,
  })
}

export const useCustomizableGoalSheetsByStudent = (studentId?: string) => {
  return useQuery<CustomizableGoalSheetWithPages[], Error>({
    queryKey: ['customizable-goal-sheets', 'by-student', studentId],
    queryFn: () => {
      if (!studentId) throw new Error('Student ID is required')
      return customizableGoalSheetsApi.getGoalSheetsByStudent(studentId)
    },
    enabled: !!studentId,
    staleTime: 1000 * 60 * 5,
  })
}

export const useCustomizableGoalSheetsBySchool = (schoolId?: string) => {
  return useQuery<CustomizableGoalSheetWithPages[], Error>({
    queryKey: ['customizable-goal-sheets', 'by-school', schoolId],
    queryFn: () => {
      if (!schoolId) throw new Error('School ID is required')
      return customizableGoalSheetsApi.getGoalSheetsBySchool(schoolId)
    },
    enabled: !!schoolId,
    staleTime: 1000 * 60 * 5,
  })
}
