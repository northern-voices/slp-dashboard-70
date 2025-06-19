import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { speechScreeningsApi } from '@/api/screenings'

export const useSpeechScreenings = () => {
  return useQuery({
    queryKey: ['speech-screenings'],
    queryFn: speechScreeningsApi.getSpeechScreeningsList,
  })
}
