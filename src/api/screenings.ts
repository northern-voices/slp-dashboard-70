import { Screening } from '@/types/database'
import { speechScreeningsApi } from './speechscreenings'
import { hearingScreeningsApi } from './hearingscreenings'
import { UserRole } from '@/types/database'

// Re-export individual APIs for direct access
export { speechScreeningsApi } from './speechscreenings'
export { hearingScreeningsApi } from './hearingscreenings'

// Helper function to get user's organization schools
const getUserOrganizationSchools = async (organizationId: string): Promise<string[]> => {
  try {
    const { supabase } = await import('@/lib/supabase')
    const { data: schools, error } = await supabase
      .from('schools')
      .select('id')
      .eq('organization_id', organizationId)

    if (error) throw error
    return schools?.map(school => school.id) || []
  } catch (error) {
    console.error('Error fetching organization schools:', error)
    return []
  }
}

export const screeningsApi = {
  // Get all screenings (both speech and hearing)
  getScreeningsList: async (
    currentUserId?: string,
    userRole?: UserRole,
    organizationId?: string,
  ): Promise<Screening[]> => {
    try {
      // Get organization schools if organizationId is provided
      let organizationSchoolIds: string[] = []
      if (organizationId) {
        organizationSchoolIds = await getUserOrganizationSchools(organizationId)
      }

      // Fetch both speech and hearing screenings
      const [speechScreenings, hearingScreenings] = await Promise.all([
        speechScreeningsApi.getSpeechScreeningsList(currentUserId, userRole, organizationId),
        hearingScreeningsApi.getHearingScreeningsList(currentUserId, userRole, organizationId),
      ])

      // Combine all screenings and add source table information
      let allScreenings = [
        ...speechScreenings.map(screening => ({ ...screening, source_table: 'speech' as const })),
        ...hearingScreenings.map(screening => ({ ...screening, source_table: 'hearing' as const })),
      ]

      // Filter by organization schools if provided
      if (organizationSchoolIds.length > 0) {
        allScreenings = allScreenings.filter(screening =>
          organizationSchoolIds.includes(screening.school_id),
        )
      }

      // Sort by date
      allScreenings.sort(
        (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
      )

      return allScreenings
    } catch (error) {
      console.error('Error fetching screenings:', error)
      throw error
    }
  },

  // Re-export speech screening methods
  getSpeechScreeningsList: speechScreeningsApi.getSpeechScreeningsList,
  getSpeechScreeningsBySchool: speechScreeningsApi.getSpeechScreeningsBySchool,
  getSpeechScreeningById: speechScreeningsApi.getSpeechScreeningById,
  createSpeechScreening: speechScreeningsApi.createSpeechScreening,
  updateSpeechScreening: speechScreeningsApi.updateSpeechScreening,
  deleteSpeechScreening: speechScreeningsApi.deleteSpeechScreening,

  // Re-export hearing screening methods
  getHearingScreeningsList: hearingScreeningsApi.getHearingScreeningsList,
  getHearingScreeningsByStudent: hearingScreeningsApi.getHearingScreeningsByStudent,
  createHearingScreening: hearingScreeningsApi.createHearingScreening,
  updateHearingScreening: hearingScreeningsApi.updateHearingScreening,
  deleteHearingScreening: hearingScreeningsApi.deleteHearingScreening,
}
