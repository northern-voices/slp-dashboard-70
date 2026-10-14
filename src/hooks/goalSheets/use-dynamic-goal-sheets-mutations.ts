import { useMutation, useQueryClient } from '@tanstack/react-query'
import { dynamicGoalSheetsApi } from '@/api/dynamicGoalSheets'
import type { DynamicGoalSheetWithSessions } from '@/types/database'

type CreateDynamicGoalSheetInput = {
  studentId: string
  schoolId: string
  goalText: string
}

export const useCreateDynamicGoalSheet = () => {
  const queryClient = useQueryClient()

  return useMutation<DynamicGoalSheetWithSessions, Error, CreateDynamicGoalSheetInput>({
    mutationFn: data => dynamicGoalSheetsApi.createGoalSheet(data),

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dynamic-goal-sheets'] })
    },

    onError: error => {
      console.error('Failed to create dynamic goal sheet:', error)
    },
  })
}
