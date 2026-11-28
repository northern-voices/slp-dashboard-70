import { useQuery } from '@tanstack/react-query'
import { compassProfilesApi } from '@/api/compassProfiles'
import type { CompassProfileSummary, CompassProfileWithItems } from '@/types/compass'

export const compassProfileKeys = {
  all: ['compass-profiles'] as const,
  byId: (id?: string) => ['compass-profiles', 'by-id', id] as const,
  byStudent: (studentId?: string) => ['compass-profiles', 'by-student', studentId] as const,
}

export const useCompassProfile = (id?: string) => {
  return useQuery<CompassProfileWithItems, Error>({
    queryKey: compassProfileKeys.byId(id),
    queryFn: () => {
      if (!id) throw new Error('COMPASS profile ID is required')
      return compassProfilesApi.getProfileById(id)
    },
    enabled: !!id,
    staleTime: 1000 * 60 * 5,
  })
}

export const useCompassProfilesByStudent = (studentId?: string) => {
  return useQuery<CompassProfileSummary[], Error>({
    queryKey: compassProfileKeys.byStudent(studentId),
    queryFn: () => {
      if (!studentId) throw new Error('Student ID is required')

      return compassProfilesApi.getProfilesByStudent(studentId)
    },
    enabled: !!studentId,
    staleTime: 1000 * 60 * 5,
  })
}
