import { useMutation, useQueryClient } from '@tanstack/react-query'
import { dynamicGoalSheetsApi } from '@/api/dynamicGoalSheets'
import type {
  DynamicGoalSheetRating,
  DynamicGoalSheetSession,
  DynamicGoalSheetPageWithSessions,
  DynamicGoalSheetWithPages,
} from '@/types/database'

type CreateDynamicGoalSheetInput = {
  studentId: string
  schoolId: string
  goalTexts: string[]
}

export const useCreateDynamicGoalSheet = () => {
  const queryClient = useQueryClient()

  return useMutation<DynamicGoalSheetWithPages, Error, CreateDynamicGoalSheetInput>({
    mutationFn: data => dynamicGoalSheetsApi.createGoalSheet(data),

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dynamic-goal-sheets'] })
    },

    onError: error => {
      console.error('Failed to create dynamic goal sheet:', error)
    },
  })
}

export const useUpdatePageGoalText = () => {
  const queryClient = useQueryClient()

  return useMutation<void, Error, { pageId: string; goalText: string }>({
    mutationFn: ({ pageId, goalText }) => dynamicGoalSheetsApi.updatePageGoalText(pageId, goalText),

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dynamic-goal-sheets'] })
    },

    onError: error => {
      console.error('Failed to update goal text:', error)
    },
  })
}

export const useAddPage = () => {
  const queryClient = useQueryClient()

  return useMutation<
    DynamicGoalSheetPageWithSessions,
    Error,
    { goalSheetId: string; goalText: string }
  >({
    mutationFn: ({ goalSheetId, goalText }) => dynamicGoalSheetsApi.addPage(goalSheetId, goalText),

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dynamic-goal-sheets'] })
    },

    onError: error => {
      console.error('Failed to add goal sheet page:', error)
    },
  })
}

export const useAddSession = () => {
  const queryClient = useQueryClient()

  return useMutation<DynamicGoalSheetSession, Error, string>({
    mutationFn: (pageId: string) => dynamicGoalSheetsApi.addSession(pageId),

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dynamic-goal-sheets'] })
    },

    onError: error => {
      console.error('Failed to add session:', error)
    },
  })
}

export const useUpdateSession = () => {
  const queryClient = useQueryClient()

  return useMutation<
    DynamicGoalSheetSession,
    Error,
    {
      sessionId: string
      data: Partial<{
        session_date: string | null
        sound_rating: DynamicGoalSheetRating | null
        activities: string | null
        progress_notes: string | null
        additional_comments: string | null
      }>
    }
  >({
    mutationFn: ({ sessionId, data }) => dynamicGoalSheetsApi.updateSession(sessionId, data),

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dynamic-goal-sheets'] })
    },

    onError: error => {
      console.error('Failed to update session:', error)
    },
  })
}

export const useDeleteDynamicGoalSheet = () => {
  const queryClient = useQueryClient()

  return useMutation<void, Error, string>({
    mutationFn: (id: string) => dynamicGoalSheetsApi.deleteGoalSheet(id),

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dynamic-goal-sheets'] })
    },

    onError: error => {
      console.error('Failed to delete dynamic goal sheet:', error)
    },
  })
}
