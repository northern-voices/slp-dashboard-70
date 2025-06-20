import { useQuery } from '@tanstack/react-query'
import { screeningsApi } from '@/api/screenings'

export const useScreenings = () => {
  return useQuery({
    queryKey: ['screenings'],
    queryFn: screeningsApi.getScreeningsList,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  })
}

export const useSpeechScreenings = () => {
  return useQuery({
    queryKey: ['speech-screenings'],
    queryFn: screeningsApi.getSpeechScreeningsList,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  })
}

export const useHearingScreenings = () => {
  return useQuery({
    queryKey: ['hearing-screenings'],
    queryFn: screeningsApi.getHearingScreeningsList,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  })
}
