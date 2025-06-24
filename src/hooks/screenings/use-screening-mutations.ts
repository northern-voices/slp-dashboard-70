import { useMutation, useQueryClient } from '@tanstack/react-query'
import { screeningsApi } from '@/api/screenings'
import { useAuth } from '@/contexts/AuthContext'
import { useOrganization } from '@/contexts/OrganizationContext'
import { Screening } from '@/types/database'

// Type for the create speech screening input
type CreateSpeechScreeningInput = {
  student_id: string
  screener_id: string
  grade_id: string
  error_patterns?: any
  result?: 'P' | 'M' | 'Q' | 'NR' | 'NC' | 'C' | null
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
      queryClient.invalidateQueries({
        queryKey: ['screenings', user?.id, userProfile?.role, currentOrganization?.id],
      })
      queryClient.invalidateQueries({
        queryKey: ['speech-screenings', user?.id, userProfile?.role, currentOrganization?.id],
      })

      // Optional: You could also optimistically update the cache
      // queryClient.setQueryData(['screenings', ...], (old) => {
      //   return old ? [...old, newScreening] : [newScreening]
      // })
    },

    onError: error => {
      console.error('Failed to create speech screening:', error)
      // You could add toast notifications here
    },
  })
}

// TODO: add other mutation hooks here
// export const useUpdateSpeechScreening = () => {
//   const queryClient = useQueryClient()

//   return useMutation<Screening, Error, { id: string; data: Partial<CreateSpeechScreeningInput> }>({
//     mutationFn: ({ id, data }) => screeningsApi.updateSpeechScreening(id, data),
//     onSuccess: () => {
//       queryClient.invalidateQueries({ queryKey: ['screenings'] })
//       queryClient.invalidateQueries({ queryKey: ['speech-screenings'] })
//     },
//   })
// }

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
