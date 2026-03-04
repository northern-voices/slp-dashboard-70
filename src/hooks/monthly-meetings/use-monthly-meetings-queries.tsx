import { useQuery } from '@tanstack/react-query'
import { useAuth } from '@/contexts/AuthContext'
import { useOrganization } from '@/contexts/OrganizationContext'
import { monthlyMeetingsApi, MonthlyMeeting } from '@/api/monthlymeetings'
import { UserRole } from '@/types/database'

export const useMonthlyMeetingsBySchool = (
  schoolId?: string,
  dateFilter: 'all' | 'school_year' = 'school_year'
) => {
  const { user } = useAuth()
  const { userProfile } = useOrganization()

  return useQuery<MonthlyMeeting[], Error>({
    queryKey: ['monthly-meetings', 'by-school', schoolId, dateFilter, user?.id, userProfile?.role],
    queryFn: async () => {
      if (!schoolId) {
        throw new Error('School ID is required')
      }
      const result = await monthlyMeetingsApi.getMonthlyMeetingsBySchool(
        schoolId,
        user?.id,
        userProfile?.role as UserRole,
        dateFilter
      )

      return result
    },
    enabled: !!schoolId && !!user?.id,
    staleTime: 1000 * 60 * 5, // 5 minutes
  })
}

export const useMonthlyMeetingsByStudent = (studentId?: string) => {
  const { user } = useAuth()
  const { userProfile } = useOrganization()

  return useQuery<MonthlyMeeting[], Error>({
    queryKey: ['monthly-meetings', 'by-student', studentId, user?.id, userProfile?.role],
    queryFn: () => {
      if (!studentId) {
        throw new Error('Student ID is required')
      }
      return monthlyMeetingsApi.getMonthlyMeetingsByStudent(
        studentId,
        user?.id,
        userProfile?.role as UserRole
      )
    },
    enabled: !!studentId && !!user?.id,
    staleTime: 1000 * 60 * 5, // 5 minutes
  })
}

export const useMonthlyMeetingsList = () => {
  const { user } = useAuth()
  const { userProfile, currentOrganization } = useOrganization()

  return useQuery<MonthlyMeeting[], Error>({
    queryKey: ['monthly-meetings', user?.id, userProfile?.role, currentOrganization?.id],
    queryFn: () =>
      monthlyMeetingsApi.getMonthlyMeetingsList(
        user?.id,
        userProfile?.role as UserRole,
        currentOrganization?.id
      ),
    enabled: !!user?.id,
    staleTime: 1000 * 60 * 5, // 5 minutes
  })
}

export const useGetMonthlyMeetingById = (meetingId?: string) => {
  return useQuery<MonthlyMeeting, Error>({
    queryKey: ['monthly-meetings', 'by-id', meetingId],
    queryFn: () => {
      if (!meetingId) throw new Error('Meeting ID is required')
      return monthlyMeetingsApi.getById(meetingId)
    },
    enabled: !!meetingId,
    staleTime: 1000 * 60 * 5,
  })
}
