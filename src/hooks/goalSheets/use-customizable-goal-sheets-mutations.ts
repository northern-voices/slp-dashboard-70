import { useMutation, useQueryClient } from '@tanstack/react-query'
import { customizableGoalSheetsApi } from '@/api/customizableGoalSheets'
import type {
  CustomizableGoalSheetRating,
  CustomizableGoalSheetSession,
  CustomizableGoalSheetPageWithSessions,
  CustomizableGoalSheetWithPages,
} from '@/types/database'

type CreateCustomizableGoalSheetInput = {
  studentId: string
  schoolId: string
  goalTexts: string[]
}

export const useCreateCustomizableGoalSheet = () => {
  const queryClient = useQueryClient()

  return useMutation<CustomizableGoalSheetWithPages, Error, CreateCustomizableGoalSheetInput>({
    mutationFn: data => customizableGoalSheetsApi.createGoalSheet(data),

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customizable-goal-sheets'] })
    },

    onError: error => {
      console.error('Failed to create customizable goal sheet:', error)
    },
  })
}

export const useUpdatePageGoalText = () => {
  const queryClient = useQueryClient()

  return useMutation<void, Error, { pageId: string; goalText: string }>({
    mutationFn: ({ pageId, goalText }) => customizableGoalSheetsApi.updatePageGoalText(pageId, goalText),

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customizable-goal-sheets'] })
    },

    onError: error => {
      console.error('Failed to update goal text:', error)
    },
  })
}

export const useAddPage = () => {
  const queryClient = useQueryClient()

  return useMutation<
    CustomizableGoalSheetPageWithSessions,
    Error,
    { goalSheetId: string; goalText: string }
  >({
    mutationFn: ({ goalSheetId, goalText }) => customizableGoalSheetsApi.addPage(goalSheetId, goalText),

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customizable-goal-sheets'] })
    },

    onError: error => {
      console.error('Failed to add goal sheet page:', error)
    },
  })
}

export const useAddSession = () => {
  const queryClient = useQueryClient()

  return useMutation<CustomizableGoalSheetSession, Error, string>({
    mutationFn: (pageId: string) => customizableGoalSheetsApi.addSession(pageId),

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customizable-goal-sheets'] })
    },

    onError: error => {
      console.error('Failed to add session:', error)
    },
  })
}

export const useUpdateSession = () => {
  const queryClient = useQueryClient()

  return useMutation<
    CustomizableGoalSheetSession,
    Error,
    {
      sessionId: string
      data: Partial<{
        session_date: string | null
        sound_rating: CustomizableGoalSheetRating | null
        activities: string | null
        progress_notes: string | null
        additional_comments: string | null
      }>
    }
  >({
    mutationFn: ({ sessionId, data }) => customizableGoalSheetsApi.updateSession(sessionId, data),

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customizable-goal-sheets'] })
    },

    onError: error => {
      console.error('Failed to update session:', error)
    },
  })
}

export const useDeleteCustomizableGoalSheet = () => {
  const queryClient = useQueryClient()

  return useMutation<void, Error, string>({
    mutationFn: (id: string) => customizableGoalSheetsApi.deleteGoalSheet(id),

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customizable-goal-sheets'] })
    },

    onError: error => {
      console.error('Failed to delete customizable goal sheet:', error)
    },
  })
}
