import { useMutation, useQueryClient } from '@tanstack/react-query'
import { hearingScreeningsApi } from '@/api/hearingscreenings'

export const useCreateHearingScreening = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: {
      student_id: string
      screener_id: string
      grade_id: string
      right_volume_db?: number | null
      right_pressure?: number | null
      right_compliance?: number | null
      left_volume_db?: number | null
      left_pressure?: number | null
      left_compliance?: number | null
      clinical_notes?: string | null
      referral_notes?: string | null
      result?: string | null
    }) => hearingScreeningsApi.createHearingScreening(data),
    onSuccess: () => {
      // Invalidate and refetch hearing screenings queries
      queryClient.invalidateQueries({ queryKey: ['hearing-screenings'] })
      queryClient.invalidateQueries({ queryKey: ['screenings'] })
    },
  })
}

export const useDeleteHearingScreening = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => hearingScreeningsApi.deleteHearingScreening(id),
    onSuccess: () => {
      // Invalidate and refetch hearing screenings queries
      queryClient.invalidateQueries({ queryKey: ['hearing-screenings'] })
      queryClient.invalidateQueries({ queryKey: ['screenings'] })
    },
  })
}
