import { useQuery } from '@tanstack/react-query'
import { screeningsApi } from '@/api/screenings'
import { useAuth } from '@/contexts/AuthContext'
import { useOrganization } from '@/contexts/OrganizationContext'
import { speechScreeningsApi } from '@/api/speechscreenings'

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

export const useRecentScreeningsBySchool = (schoolId?: string, days: number = 7) => {
  const { user } = useAuth()
  const { userProfile } = useOrganization()

  return useQuery({
    queryKey: ['recent-screenings', schoolId, days, user?.id, userProfile?.role],
    queryFn: async () => {
      // Get both speech and hearing screenings for the school
      const [speechScreenings, hearingScreenings] = await Promise.all([
        screeningsApi.getSpeechScreeningsList(user?.id, userProfile?.role as 'admin' | 'slp'),
        screeningsApi.getHearingScreeningsList(user?.id, userProfile?.role as 'admin' | 'slp'),
      ])

      // Filter by school and recent date
      const cutoffDate = new Date()
      cutoffDate.setDate(cutoffDate.getDate() - days)

      const recentSpeech = speechScreenings.filter(
        screening =>
          screening.school_id === schoolId && new Date(screening.created_at) >= cutoffDate
      )

      const recentHearing = hearingScreenings.filter(
        screening =>
          screening.school_id === schoolId && new Date(screening.created_at) >= cutoffDate
      )

      return recentSpeech.length + recentHearing.length
    },
    staleTime: 2 * 60 * 1000, // 2 minutes for recent data
    gcTime: 10 * 60 * 1000,
    enabled: !!schoolId && !!user && !!userProfile,
  })
}

export const useScreeningsBySchool = (
  schoolId?: string,
  dateFilter?: 'all' | 'school_year'
) => {
  const { user } = useAuth()
  const { userProfile } = useOrganization()

  return useQuery({
    queryKey: ['screenings', 'by-school', schoolId, user?.id, userProfile?.role, dateFilter],
    queryFn: async () => {
      if (!schoolId) return []

      // Fetch speech screenings for the school with date filter
      const speechScreenings = await speechScreeningsApi.getSpeechScreeningsBySchool(
        schoolId,
        user?.id,
        userProfile?.role as 'admin' | 'slp' | 'supervisor',
        dateFilter || 'school_year' // Default to school_year if not provided
      )

      // Add source table information
      const allScreenings = speechScreenings.map(screening => ({
        ...screening,
        source_table: 'speech' as const,
      }))

      return allScreenings
    },
    staleTime: 30 * 60 * 1000, // 30 minutes - keep cached data longer
    gcTime: 60 * 60 * 1000, // 60 minutes - keep in cache longer
    enabled: !!schoolId && !!user && !!userProfile,
  })
}

export const useSpeechScreeningsByStudent = (studentId?: string) => {
  const { user } = useAuth()
  const { userProfile } = useOrganization()

  return useQuery({
    queryKey: ['speech-screenings', 'by-student', studentId, user?.id, userProfile?.role],
    queryFn: () =>
      speechScreeningsApi.getSpeechScreeningsByStudent(
        studentId!,
        user?.id,
        userProfile?.role as 'admin' | 'slp'
      ),
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    enabled: !!studentId && !!user && !!userProfile,
  })
}

export const useScreeningsByStudent = (studentId?: string) => {
  const { user } = useAuth()
  const { userProfile } = useOrganization()

  return useQuery({
    queryKey: ['screenings', 'by-student', studentId, user?.id, userProfile?.role],
    queryFn: async () => {
      // Get both speech and hearing screenings for the specific student
      const [speechScreenings, hearingScreenings] = await Promise.all([
        speechScreeningsApi.getSpeechScreeningsByStudent(
          studentId!,
          user?.id,
          userProfile?.role as 'admin' | 'slp'
        ),
        screeningsApi.getHearingScreeningsByStudent(
          studentId!,
          user?.id,
          userProfile?.role as 'admin' | 'slp'
        ),
      ])

      // Combine all screenings and add source table information
      const allScreenings = [
        ...speechScreenings.map(screening => ({ ...screening, source_table: 'speech' as const })),
        ...hearingScreenings.map(screening => ({ ...screening, source_table: 'hearing' as const })),
      ]

      // Sort by date
      allScreenings.sort(
        (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      )

      return allScreenings
    },
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    enabled: !!studentId && !!user && !!userProfile,
  })
}
