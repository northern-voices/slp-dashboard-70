import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useAuth } from '@/contexts/AuthContext'
import { useOrganization } from '@/contexts/OrganizationContext'

import { monthlyMeetingsApi, MonthlyMeeting } from '@/api/monthlymeetings'

// Type for the create monthly meeting input
type CreateMonthlyMeetingInput = {
  student_id: string
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
