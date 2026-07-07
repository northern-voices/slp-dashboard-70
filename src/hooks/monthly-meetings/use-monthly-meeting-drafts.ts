import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { monthlyMeetingDraftsApi } from '@/api/monthlyMeetingDrafts'

export const useCreateMonthlyMeetingDrafts = (schoolId?: string) => {
  return useQuery({
    queryKey: ['monthly-meeting-drafts', 'create', schoolId],
    queryFn: () => monthlyMeetingDraftsApi.getCreateDrafts(schoolId!),
    enabled: !!schoolId,
  })
}

export const useEditMonthlyMeetingDraft = (meetingId?: string) => {
  return useQuery({
    queryKey: ['monthly-meeting-drafts', 'edit', meetingId],
    queryFn: () => monthlyMeetingDraftsApi.getEditDraft(meetingId!),
    enabled: !!meetingId,
  })
}

export const useCreateMonthlyMeetingDraft = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: monthlyMeetingDraftsApi.createDraft,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['monthly-meeting-drafts'] })
    },
  })
}

export const useUpdateMonthlyMeetingDraft = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (
      params: Parameters<typeof monthlyMeetingDraftsApi.updateDraft>[1] & { id: string }
    ) => monthlyMeetingDraftsApi.updateDraft(params.id, params),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['monthly-meeting-drafts'] })
    },
  })
}

export const useRenameMonthlyMeetingDraft = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, label }: { id: string; label: string }) =>
      monthlyMeetingDraftsApi.renameDraft(id, label),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['monthly-meeting-drafts'] })
    },
  })
}

export const useDeleteMonthlyMeetingDraft = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => monthlyMeetingDraftsApi.deleteDraft(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['monthly-meeting-drafts'] })
    },
  })
}
