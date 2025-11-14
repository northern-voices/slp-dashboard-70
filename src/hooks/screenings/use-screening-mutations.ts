import { useMutation, useQueryClient } from '@tanstack/react-query'
import { screeningsApi } from '@/api/screenings'
import { useAuth } from '@/contexts/AuthContext'
import { useOrganization } from '@/contexts/OrganizationContext'
import { Screening } from '@/types/database'
import { ErrorPatterns } from '@/types/screening-form'

// Type for the create speech screening input
type CreateSpeechScreeningInput = {
  student_id: string
  screener_id: string
  grade_id: string
  error_patterns?: ErrorPatterns
  result?: string | null
  vocabulary_support?: boolean
  clinical_notes?: string | null
  referral_notes?: string | null
}

// Type for the update speech screening input
type UpdateSpeechScreeningInput = {
  student_id?: string
  screener_id?: string
  grade_id?: string
  screening_type?: string
  error_patterns?: ErrorPatterns
  result?: string | null
  vocabulary_support?: boolean
  suspected_cas?: boolean
  clinical_notes?: string | null
  referral_notes?: string | null
}

export const useCreateSpeechScreening = () => {
  const queryClient = useQueryClient()
  const { user } = useAuth()
  const { userProfile, currentOrganization } = useOrganization()

  return useMutation<Screening, Error, CreateSpeechScreeningInput>({
    mutationFn: (data: CreateSpeechScreeningInput) => screeningsApi.createSpeechScreening(data),

    onSuccess: newScreening => {
      // Invalidate and refetch all screening-related queries
      // Use exact matching for the main queries to ensure proper invalidation
      queryClient.invalidateQueries({
        queryKey: ['screenings', user?.id, userProfile?.role, currentOrganization?.id],
      })
      queryClient.invalidateQueries({
        queryKey: ['speech-screenings', user?.id, userProfile?.role, currentOrganization?.id],
      })
      queryClient.invalidateQueries({
        queryKey: ['hearing-screenings', user?.id, userProfile?.role, currentOrganization?.id],
      })

      // Also invalidate partial matches to catch any other variations
      queryClient.invalidateQueries({
        queryKey: ['screenings'],
      })
      queryClient.invalidateQueries({
        queryKey: ['speech-screenings'],
      })
      queryClient.invalidateQueries({
        queryKey: ['hearing-screenings'],
      })
      queryClient.invalidateQueries({
        queryKey: ['recent-screenings'],
      })
      queryClient.invalidateQueries({
        queryKey: ['screenings', 'by-school'],
      })

      // Force refetch of the main screenings query to ensure immediate update
      queryClient.refetchQueries({
        queryKey: ['screenings', user?.id, userProfile?.role, currentOrganization?.id],
      })
    },

    onError: error => {
      console.error('Failed to create speech screening:', error)
      // You could add toast notifications here
    },
  })
}

export const useUpdateSpeechScreening = () => {
  const queryClient = useQueryClient()
  const { user } = useAuth()
  const { userProfile, currentOrganization } = useOrganization()

  return useMutation<
    Screening,
    Error,
    { id: string; data: Partial<UpdateSpeechScreeningInput> },
    { previousScreenings: Array<[import('@tanstack/react-query').QueryKey, unknown]> }
  >({
    mutationFn: ({ id, data }) => screeningsApi.updateSpeechScreening(id, data),

    onMutate: async ({ id, data }) => {
      await queryClient.cancelQueries({ queryKey: ['screenings'] })

      const previousScreenings = queryClient.getQueriesData({ queryKey: ['screenings'] })

      queryClient.setQueriesData<Screening[]>({ queryKey: ['screenings'] }, old => {
        if (!old) return old
        return old.map(screening =>
          screening.id === id
            ? {
                ...screening,
                ...data,
                error_patterns: data.error_patterns || screening.error_patterns,
              }
            : screening
        )
      })

      return { previousScreenings }
    },

    onSuccess: () => {
      // Invalidate and refetch all screening-related queries
      queryClient.invalidateQueries({
        queryKey: ['screenings', user?.id, userProfile?.role, currentOrganization?.id],
      })
      queryClient.invalidateQueries({
        queryKey: ['speech-screenings', user?.id, userProfile?.role, currentOrganization?.id],
      })

      // Force refetch of the main screenings query to ensure immediate update
      queryClient.refetchQueries({
        queryKey: ['screenings', user?.id, userProfile?.role, currentOrganization?.id],
      })
    },
    onError: (error, variables, context) => {
      if (context?.previousScreenings) {
        context.previousScreenings.forEach(([queryKey, data]) => {
          queryClient.setQueryData(queryKey, data)
        })
      }
      console.error('Failed to update speech screening:', error)
    },
  })
}

// export const useDeleteSpeechScreening = () => {
//   const queryClient = useQueryClient()

//   return useMutation<void, Error, string>({
//     mutationFn: (id: string) => screeningsApi.deleteSpeechScreening(id),
//     onSuccess: () => {
//       queryClient.invalidateQueries({ queryKey: ['screenings'] })
//       queryClient.invalidateQueries({ queryKey: ['speech-screenings'] })
//     },
//   })
// }

export const useDeleteScreening = () => {
  const queryClient = useQueryClient()
  const { user } = useAuth()
  const { userProfile, currentOrganization } = useOrganization()

  return useMutation<
    void,
    Error,
    { id: string; sourceTable: 'speech' | 'hearing' },
    { previousScreenings: Array<[import('@tanstack/react-query').QueryKey, unknown]> }
  >({
    mutationFn: ({ id, sourceTable }) => {
      if (sourceTable === 'speech') {
        return screeningsApi.deleteSpeechScreening(id)
      } else {
        return screeningsApi.deleteHearingScreening(id)
      }
    },

    // Optimistically remove the screening from the UI immediately
    onMutate: async ({ id }) => {
      // Cancel any outgoing refetches to prevent them from overwriting our optimistic update
      await queryClient.cancelQueries({ queryKey: ['screenings'] })

      // Snapshot the previous value
      const previousScreenings = queryClient.getQueriesData({ queryKey: ['screenings'] })

      // Optimistically update to remove the screening
      queryClient.setQueriesData<Screening[]>({ queryKey: ['screenings'] }, old => {
        if (!old) return old
        return old.filter(screening => screening.id !== id)
      })

      // Return the context with the previous data for rollback on error
      return { previousScreenings }
    },

    onSuccess: () => {
      // Invalidate and refetch all screening-related queries
      queryClient.invalidateQueries({
        queryKey: ['screenings', user?.id, userProfile?.role, currentOrganization?.id],
      })
      queryClient.invalidateQueries({
        queryKey: ['speech-screenings', user?.id, userProfile?.role, currentOrganization?.id],
      })
      queryClient.invalidateQueries({
        queryKey: ['hearing-screenings', user?.id, userProfile?.role, currentOrganization?.id],
      })

      // Force refetch of the main screenings query to ensure immediate update
      queryClient.refetchQueries({
        queryKey: ['screenings', user?.id, userProfile?.role, currentOrganization?.id],
      })
    },

    onError: (error, variables, context) => {
      // Rollback to the previous state if the deletion fails
      if (context?.previousScreenings) {
        context.previousScreenings.forEach(([queryKey, data]) => {
          queryClient.setQueryData(queryKey, data)
        })
      }
      console.error('Failed to delete screening:', error)
    },
  })
}

export const useBulkDeleteScreenings = () => {
  const queryClient = useQueryClient()
  const { user } = useAuth()
  const { userProfile, currentOrganization } = useOrganization()

  return useMutation<
    void,
    Error,
    { screenings: Array<{ id: string; sourceTable: 'speech' | 'hearing' }> }
  >({
    mutationFn: async ({ screenings }) => {
      // Delete screenings in parallel, grouped by type
      const speechScreenings = screenings.filter(s => s.sourceTable === 'speech')
      const hearingScreenings = screenings.filter(s => s.sourceTable === 'hearing')

      const deletePromises: Promise<void>[] = []

      // Add speech screening deletions
      if (speechScreenings.length > 0) {
        deletePromises.push(
          Promise.all(
            speechScreenings.map(screening => screeningsApi.deleteSpeechScreening(screening.id))
          ).then(() => {})
        )
      }

      // Add hearing screening deletions
      if (hearingScreenings.length > 0) {
        deletePromises.push(
          Promise.all(
            hearingScreenings.map(screening => screeningsApi.deleteHearingScreening(screening.id))
          ).then(() => {})
        )
      }

      // Wait for all deletions to complete
      await Promise.all(deletePromises)
    },

    onSuccess: () => {
      // Invalidate and refetch all screening-related queries
      queryClient.invalidateQueries({
        queryKey: ['screenings', user?.id, userProfile?.role, currentOrganization?.id],
      })
      queryClient.invalidateQueries({
        queryKey: ['speech-screenings', user?.id, userProfile?.role, currentOrganization?.id],
      })
      queryClient.invalidateQueries({
        queryKey: ['hearing-screenings', user?.id, userProfile?.role, currentOrganization?.id],
      })

      // Force refetch of the main screenings query to ensure immediate update
      queryClient.refetchQueries({
        queryKey: ['screenings', user?.id, userProfile?.role, currentOrganization?.id],
      })
    },

    onError: error => {
      console.error('Failed to delete screenings:', error)
      // You could add toast notifications here
    },
  })
}
