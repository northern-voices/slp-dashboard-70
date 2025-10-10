import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useAuth } from '@/contexts/AuthContext'
import { useOrganization } from '@/contexts/OrganizationContext'

import { monthlyMeetingsApi, MonthlyMeeting } from '@/api/monthlymeetings'

// Type for the create monthly meeting input
type CreateMonthlyMeetingInput = {
  meeting_title: string
  student_id: string | null
  meeting_facilitator?: string | null
  attendees: string[]
  sessions_attended?: number | null
  meeting_notes?: string | null
  additional_notes?: string | null
  meeting_date: string
}

// Type for the update monthly meeting input
type UpdateMonthlyMeetingInput = {
  student_id?: string
  attendees?: string[]
  sessions_attended?: number | null
  meeting_notes?: string | null
  additional_notes?: string | null
  meeting_date?: string
}

export const useCreateMonthlyMeeting = () => {
  const queryClient = useQueryClient()
  const { user } = useAuth()
  const { userProfile, currentOrganization } = useOrganization()

  return useMutation<MonthlyMeeting, Error, CreateMonthlyMeetingInput>({
    mutationFn: (data: CreateMonthlyMeetingInput) => monthlyMeetingsApi.createMonthlyMeeting(data),

    onSuccess: () => {
      // Invalidate and refetch all monthly meeting-related queries
      // Use exact matching for the main queries to ensure proper invalidation
      queryClient.invalidateQueries({
        queryKey: ['monthly-meetings', user?.id, userProfile?.role, currentOrganization?.id],
      })

      // Also invalidate partial matches to catch any other variations
      queryClient.invalidateQueries({
        queryKey: ['monthly-meetings'],
      })
      queryClient.invalidateQueries({
        queryKey: ['monthly-meetings', 'by-school'],
      })
      queryClient.invalidateQueries({
        queryKey: ['monthly-meetings', 'by-student'],
      })

      // Force refetch of the main monthly meetings query to ensure immediate update
      queryClient.refetchQueries({
        queryKey: ['monthly-meetings', user?.id, userProfile?.role, currentOrganization?.id],
      })
    },

    onError: error => {
      console.error('Failed to create monthly meeting:', error)
      // You could add toast notifications here
    },
  })
}

export const useUpdateMonthlyMeeting = () => {
  const queryClient = useQueryClient()
  const { user } = useAuth()
  const { userProfile, currentOrganization } = useOrganization()

  return useMutation<
    MonthlyMeeting,
    Error,
    { id: string; data: Partial<UpdateMonthlyMeetingInput> }
  >({
    mutationFn: ({ id, data }) => monthlyMeetingsApi.updateMonthlyMeeting(id, data),

    onSuccess: () => {
      // Invalidate and refetch all monthly meeting-related queries
      queryClient.invalidateQueries({
        queryKey: ['monthly-meetings', user?.id, userProfile?.role, currentOrganization?.id],
      })

      queryClient.invalidateQueries({
        queryKey: ['monthly-meetings'],
      })

      // Force refetch of the main monthly meetings query to ensure immediate update
      queryClient.refetchQueries({
        queryKey: ['monthly-meetings', user?.id, userProfile?.role, currentOrganization?.id],
      })
    },

    onError: error => {
      console.error('Failed to update monthly meeting:', error)
      // You could add toast notifications here
    },
  })
}

export const useDeleteMonthlyMeeting = () => {
  const queryClient = useQueryClient()
  const { user } = useAuth()
  const { userProfile, currentOrganization } = useOrganization()

  return useMutation<void, Error, string>({
    mutationFn: (id: string) => monthlyMeetingsApi.deleteMonthlyMeeting(id),

    onSuccess: () => {
      // Invalidate and refetch all monthly meeting-related queries
      queryClient.invalidateQueries({
        queryKey: ['monthly-meetings', user?.id, userProfile?.role, currentOrganization?.id],
      })

      queryClient.invalidateQueries({
        queryKey: ['monthly-meetings'],
      })

      // Force refetch of the main monthly meetings query to ensure immediate update
      queryClient.refetchQueries({
        queryKey: ['monthly-meetings', user?.id, userProfile?.role, currentOrganization?.id],
      })
    },

    onError: error => {
      console.error('Failed to delete monthly meeting:', error)
      // You could add toast notifications here
    },
  })
}

export const useBulkDeleteMonthlyMeetings = () => {
  const queryClient = useQueryClient()
  const { user } = useAuth()
  const { userProfile, currentOrganization } = useOrganization()

  return useMutation<void, Error, { meetingIds: string[] }>({
    mutationFn: async ({ meetingIds }) => {
      // Delete meetings in parallel
      await Promise.all(meetingIds.map(id => monthlyMeetingsApi.deleteMonthlyMeeting(id)))
    },

    onSuccess: () => {
      // Invalidate and refetch all monthly meeting-related queries
      queryClient.invalidateQueries({
        queryKey: ['monthly-meetings', user?.id, userProfile?.role, currentOrganization?.id],
      })

      queryClient.invalidateQueries({
        queryKey: ['monthly-meetings'],
      })

      // Force refetch of the main monthly meetings query to ensure immediate update
      queryClient.refetchQueries({
        queryKey: ['monthly-meetings', user?.id, userProfile?.role, currentOrganization?.id],
      })
    },

    onError: error => {
      console.error('Failed to delete monthly meetings:', error)
      // You could add toast notifications here
    },
  })
}
