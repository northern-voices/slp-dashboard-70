import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { speechScreeningsApi } from '@/api/screenings'

export const useScreenings = () => {
  return useQuery({
    queryKey: ['screenings'],
    queryFn: speechScreeningsApi.getScreeningsList,
  })
}

// Keep the old hook for backward compatibility
export const useSpeechScreenings = () => {
  return useQuery({
    queryKey: ['speech-screenings'],
    queryFn: speechScreeningsApi.getSpeechScreeningsList,
  })
}
