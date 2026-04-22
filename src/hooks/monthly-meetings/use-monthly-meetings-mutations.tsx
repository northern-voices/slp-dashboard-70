import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useAuth } from '@/contexts/AuthContext'
import { useOrganization } from '@/contexts/OrganizationContext'

import { monthlyMeetingsApi, MonthlyMeeting, StudentUpdate } from '@/api/monthlymeetings'

// Type for the create monthly meeting input
type CreateMonthlyMeetingInput = {
  meeting_title: string
  meeting_date: string
  attendees: string[]
  school_id: string
  additional_notes?: string | null
  facilitator_id?: string | null
  student_updates?: Array<{
    student_id: string
    sessions_attended?: number | null
    meeting_notes?: string | null
  }>
}

// Type for the update monthly meeting input
type UpdateMonthlyMeetingInput = {
  meeting_title?: string
  meeting_date?: string
  attendees?: string[]
  school_id: string
  additional_notes?: string | null
  facilitator_id?: string | null
  student_updates?: Array<{
    student_id: string
    sessions_attended?: number | null
    meeting_notes?: string | null
  }>
}

// Type for student update operations
type AddStudentUpdateInput = {
  monthly_meeting_id: string
  student_id: string
  sessions_attended?: number | null
  meeting_notes?: string | null
}

type UpdateStudentUpdateInput = {
  sessions_attended?: number | null
  meeting_notes?: string | null
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
    },
  })
}

// Hooks for managing student updates
export const useAddStudentUpdate = () => {
  const queryClient = useQueryClient()

  return useMutation<StudentUpdate, Error, AddStudentUpdateInput>({
    mutationFn: data => monthlyMeetingsApi.addStudentUpdate(data),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['monthly-meetings'],
      })
    },

    onError: error => {
      console.error('Failed to add student update:', error)
    },
  })
}

export const useUpdateStudentUpdate = () => {
  const queryClient = useQueryClient()

  return useMutation<StudentUpdate, Error, { id: string; data: UpdateStudentUpdateInput }>({
    mutationFn: ({ id, data }) => monthlyMeetingsApi.updateStudentUpdate(id, data),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['monthly-meetings'],
      })
    },

    onError: error => {
      console.error('Failed to update student update:', error)
    },
  })
}

export const useDeleteStudentUpdate = () => {
  const queryClient = useQueryClient()

  return useMutation<void, Error, string>({
    mutationFn: id => monthlyMeetingsApi.deleteStudentUpdate(id),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['monthly-meetings'],
      })
    },

    onError: error => {
      console.error('Failed to delete student update:', error)
    },
  })
}
