import { useQuery } from '@tanstack/react-query'
import { screeningsApi } from '@/api/screenings'
import { useAuth } from '@/contexts/AuthContext'
import { useOrganization } from '@/contexts/OrganizationContext'

export const useScreenings = () => {
  const { user } = useAuth()
  const { userProfile, currentOrganization } = useOrganization()

  return useQuery({
    queryKey: ['screenings', user?.id, userProfile?.role, currentOrganization?.id],
    queryFn: () =>
      screeningsApi.getScreeningsList(
        user?.id,
        userProfile?.role as 'admin' | 'slp',
        currentOrganization?.id
      ),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    enabled: !!user && !!userProfile && !!currentOrganization,
  })
}

export const useSpeechScreenings = () => {
  const { user } = useAuth()
  const { userProfile, currentOrganization } = useOrganization()

  return useQuery({
    queryKey: ['speech-screenings', user?.id, userProfile?.role, currentOrganization?.id],
    queryFn: () =>
      screeningsApi.getSpeechScreeningsList(
        user?.id,
        userProfile?.role as 'admin' | 'slp',
        currentOrganization?.id
      ),
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    enabled: !!user && !!userProfile && !!currentOrganization,
  })
}

export const useHearingScreenings = () => {
  const { user } = useAuth()
  const { userProfile, currentOrganization } = useOrganization()

  return useQuery({
    queryKey: ['hearing-screenings', user?.id, userProfile?.role, currentOrganization?.id],
    queryFn: () =>
      screeningsApi.getHearingScreeningsList(
        user?.id,
        userProfile?.role as 'admin' | 'slp',
        currentOrganization?.id
      ),
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    enabled: !!user && !!userProfile && !!currentOrganization,
  })
}
