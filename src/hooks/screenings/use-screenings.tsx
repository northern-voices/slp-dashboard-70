import { useQuery } from '@tanstack/react-query'
import { screeningsApi } from '@/api/screenings'
import { useAuth } from '@/contexts/AuthContext'
import { useOrganization } from '@/contexts/OrganizationContext'
import { speechScreeningsApi } from '@/api/speechscreenings'
import { UserRole } from '@/types/database'

export const useScreenings = () => {
  const { user } = useAuth()
  const { userProfile, currentOrganization } = useOrganization()

  return useQuery({
    queryKey: ['screenings', user?.id, userProfile?.role, currentOrganization?.id],
    queryFn: () =>
      screeningsApi.getScreeningsList(
        user?.id,
        userProfile?.role as UserRole,
        currentOrganization?.id
      ),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
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
        screeningsApi.getSpeechScreeningsList(user?.id, userProfile?.role as UserRole),
        screeningsApi.getHearingScreeningsList(user?.id, userProfile?.role as UserRole),
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
  dateFilter?: 'all' | 'school_year',
  page: number = 1,
  pageSize: number = 50
) => {
  const { user } = useAuth()
  const { userProfile } = useOrganization()

  return useQuery({
    queryKey: [
      'screenings',
      'by-school',
      schoolId,
      user?.id,
      userProfile?.role,
      dateFilter,
      page,
      pageSize,
    ],
    queryFn: async () => {
      if (!schoolId) return { screenings: [], totalCount: 0 }

      // Fetch speech screenings for the school with date filter
      const speechScreenings = await speechScreeningsApi.getSpeechScreeningsBySchool(
        schoolId,
        user?.id,
        userProfile?.role as UserRole,
        dateFilter || 'school_year',
        page,
        pageSize
      )

      // Add source table information
      const allScreenings = speechScreenings.data.map(screening => ({
        ...screening,
        source_table: 'speech' as const,
      }))

      return { screenings: allScreenings, totalCount: speechScreenings.totalCount }
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
        userProfile?.role as UserRole
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
          userProfile?.role as UserRole
        ),
        screeningsApi.getHearingScreeningsByStudent(
          studentId!,
          user?.id,
          userProfile?.role as UserRole
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

export const useScreeningStats = (
  schoolId?: string,
  dateFilter: 'school_year' | 'all' = 'school_year'
) => {
  const { user } = useAuth()
  const { userProfile } = useOrganization()

  return useQuery({
    queryKey: ['screening-stats', schoolId, dateFilter, user?.id],
    queryFn: () => speechScreeningsApi.getScreeningStats(schoolId!, dateFilter),
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    enabled: !!schoolId && !!user && !!userProfile,
  })
}
