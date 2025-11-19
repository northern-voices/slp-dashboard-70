import { useQuery } from '@tanstack/react-query'
import { hearingScreeningsApi } from '@/api/hearingscreenings'
import { useAuth } from '@/contexts/AuthContext'
import { useOrganization } from '@/contexts/OrganizationContext'

export const useHearingScreenings = (schoolId?: string) => {
  const { user } = useAuth()
  const { userProfile, currentOrganization } = useOrganization()

  return useQuery({
    queryKey: ['hearing-screenings', user?.id, userProfile?.role, currentOrganization?.id, schoolId],
    queryFn: () =>
      hearingScreeningsApi.getHearingScreeningsList(
        user?.id,
        userProfile?.role as 'admin' | 'slp' | 'supervisor',
        currentOrganization?.id,
        schoolId
      ),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    enabled: !!user && !!userProfile && !!currentOrganization,
  })
}

export const useHearingScreeningsByStudent = (studentId?: string) => {
  const { user } = useAuth()
  const { userProfile } = useOrganization()

  return useQuery({
    queryKey: ['hearing-screenings', 'by-student', studentId, user?.id, userProfile?.role],
    queryFn: () =>
      hearingScreeningsApi.getHearingScreeningsByStudent(
        studentId!,
        user?.id,
        userProfile?.role as 'admin' | 'slp' | 'supervisor'
      ),
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    enabled: !!studentId && !!user && !!userProfile,
  })
}
