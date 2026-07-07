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
