import { supabase } from '@/lib/supabase'
import { Screening } from '@/types/database'

interface RawSpeechScreening {
  id: string
  student_id: string
  screener_id: string
  grade_id: string
  result: string | null
  vocabulary_support: boolean
  suspected_cas: boolean
  clinical_notes: string | null
  referral_notes: string | null
  created_at: string
  updated_at: string
  students: {
    id: string
    first_name: string
    last_name: string
    school_id: string
  } | null
  school_grades: {
    id: string
    grade_level: string
    academic_year: string
  } | null
  users: {
    id: string
    first_name: string
    last_name: string
  } | null
}

interface RawHearingScreening {
  id: string
  student_id: string
  screener_id: string
  grade_id: string
  right_volume_db: number | null
  right_pressure: number | null
  right_compliance: number | null
  left_volume_db: number | null
  left_pressure: number | null
  left_compliance: number | null
  clinical_notes: string | null
  referral_notes: string | null
  created_at: string
  updated_at: string
  students: {
    id: string
    first_name: string
    last_name: string
    school_id: string
  } | null
  school_grades: {
    id: string
    grade_level: string
    academic_year: string
  } | null
  users: {
    id: string
    first_name: string
    last_name: string
  } | null
}

// Helper function to determine screening status
const getScreeningStatus = (
  screening: RawSpeechScreening | RawHearingScreening
): 'completed' | 'in_progress' | 'scheduled' => {
  // Since status isn't in the schema, we'll determine it based on available data
  if ('result' in screening && screening.result) {
    return 'completed'
  }
  if (screening.clinical_notes || screening.referral_notes) {
    return 'completed'
  }
  // If we have hearing measurements
  if (
    'right_volume_db' in screening &&
    (screening.right_volume_db !== null || screening.left_volume_db !== null)
  ) {
    return 'completed'
  }
  return 'in_progress'
}

// Helper function to determine hearing screening result
const getHearingResult = (screening: RawHearingScreening): 'P' | 'M' | 'Q' | 'NR' | 'NC' => {
  // Basic logic - you may want to implement more sophisticated rules
  if (screening.right_volume_db === null && screening.left_volume_db === null) {
    return 'NR' // No Response
  }

  // Simple pass/fail logic - adjust thresholds as needed
  const rightFail = screening.right_volume_db !== null && screening.right_volume_db > 25
  const leftFail = screening.left_volume_db !== null && screening.left_volume_db > 25

  if (rightFail || leftFail) {
    return 'Q' // Qualified for further evaluation
  }

  return 'P' // Passed
}

// Helper function to get user's organization schools
const getUserOrganizationSchools = async (organizationId: string): Promise<string[]> => {
  try {
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
  getScreeningsList: async (
    currentUserId?: string,
    userRole?: 'admin' | 'slp',
    organizationId?: string
  ): Promise<Screening[]> => {
    try {
      // Get organization schools if organizationId is provided
      let organizationSchoolIds: string[] = []
      if (organizationId) {
        organizationSchoolIds = await getUserOrganizationSchools(organizationId)
      }

      // Build base query for speech screenings
      let speechQuery = supabase.from('speech_screenings').select(
        `
          *,
          students (
            id,
            first_name,
            last_name,
            school_id
          ),
          school_grades (
            id,
            grade_level,
            academic_year
          ),
          users (
            id,
            first_name,
            last_name
          )
        `
      )

      // Build base query for hearing screenings
      let hearingQuery = supabase.from('hearing_screenings').select(
        `
          *,
          students (
            id,
            first_name,
            last_name,
            school_id
          ),
          school_grades (
            id,
            grade_level,
            academic_year
          ),
          users (
            id,
            first_name,
            last_name
          )
        `
      )

      // Apply filters based on user role
      if (userRole === 'slp' && currentUserId) {
        // SLPs can only see their own screenings within their organization
        speechQuery = speechQuery.eq('screener_id', currentUserId)
        hearingQuery = hearingQuery.eq('screener_id', currentUserId)
      }

      const { data: speechData, error: speechError } = await speechQuery.order('created_at', {
        ascending: false,
      })
      if (speechError) throw speechError

      const { data: hearingData, error: hearingError } = await hearingQuery.order('created_at', {
        ascending: false,
      })
      if (hearingError) throw hearingError

      // Transform speech screenings
      const speechScreenings: Screening[] = (speechData || []).map(
        (screening: RawSpeechScreening) => ({
          id: screening.id,
          student_id: screening.student_id,
          student_name: screening.students
            ? `${screening.students.first_name} ${screening.students.last_name}`
            : 'Unknown Student',
          grade: screening.school_grades?.grade_level || '',
          type: 'speech' as const,
          status: getScreeningStatus(screening),
          date: screening.created_at?.split('T')[0] || '',
          screening_date: screening.created_at?.split('T')[0] || '',
          screening_type: 'initial',
          screener: screening.users
            ? `${screening.users.first_name} ${screening.users.last_name}`
            : 'Unknown Screener',
          slp_id: screening.screener_id,
          results: screening.clinical_notes || screening.referral_notes || '',
          result: (screening.result as 'P' | 'M' | 'Q' | 'NR' | 'NC' | 'C') || undefined,
          screening_result: (screening.result as 'P' | 'M' | 'Q' | 'NR' | 'NC' | 'C') || undefined,
          notes: screening.clinical_notes || '',
          referral_notes: screening.referral_notes || '',
          vocabulary_support: screening.vocabulary_support,
          suspected_cas: screening.suspected_cas,
          created_at: screening.created_at,
          updated_at: screening.updated_at,
          school_id: screening.students?.school_id || '',
          grade_id: screening.grade_id,
          screener_id: screening.screener_id,
        })
      )

      // Transform hearing screenings
      const hearingScreenings: Screening[] = (hearingData || []).map(
        (screening: RawHearingScreening) => ({
          id: screening.id,
          student_id: screening.student_id,
          student_name: screening.students
            ? `${screening.students.first_name} ${screening.students.last_name}`
            : 'Unknown Student',
          grade: screening.school_grades?.grade_level || '',
          type: 'hearing' as const,
          status: getScreeningStatus(screening),
          date: screening.created_at?.split('T')[0] || '',
          screening_date: screening.created_at?.split('T')[0] || '',
          screening_type: 'initial',
          screener: screening.users
            ? `${screening.users.first_name} ${screening.users.last_name}`
            : 'Unknown Screener',
          slp_id: screening.screener_id,
          results: screening.clinical_notes || screening.referral_notes || '',
          result: getHearingResult(screening),
          screening_result: getHearingResult(screening),
          notes: screening.clinical_notes || '',
          referral_notes: screening.referral_notes || '',
          // Hearing-specific fields
          right_volume_db: screening.right_volume_db,
          right_pressure: screening.right_pressure,
          right_compliance: screening.right_compliance,
          left_volume_db: screening.left_volume_db,
          left_pressure: screening.left_pressure,
          left_compliance: screening.left_compliance,
          created_at: screening.created_at,
          updated_at: screening.updated_at,
          school_id: screening.students?.school_id || '',
          grade_id: screening.grade_id,
          screener_id: screening.screener_id,
        })
      )

      // Combine all screenings
      let allScreenings = [...speechScreenings, ...hearingScreenings]

      // Filter by organization schools if provided
      if (organizationSchoolIds.length > 0) {
        allScreenings = allScreenings.filter(screening =>
          organizationSchoolIds.includes(screening.school_id)
        )
      }

      // Sort by date
      allScreenings.sort(
        (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      )

      return allScreenings
    } catch (error) {
      console.error('Error fetching screenings:', error)
      throw error
    }
  },

  getSpeechScreeningsList: async (
    currentUserId?: string,
    userRole?: 'admin' | 'slp' | 'supervisor',
    organizationId?: string
  ): Promise<Screening[]> => {
    try {
      // Get organization schools if organizationId is provided
      let organizationSchoolIds: string[] = []
      if (organizationId) {
        organizationSchoolIds = await getUserOrganizationSchools(organizationId)
      }

      // Build base query
      let query = supabase.from('speech_screenings').select(
        `
          *,
          students (
            id,
            first_name,
            last_name,
            school_id
          ),
          school_grades (
            id,
            grade_level,
            academic_year
          ),
          users (
            id,
            first_name,
            last_name
          )
        `
      )

      // Apply filters based on user role
      if (userRole === 'slp' && currentUserId) {
        // SLPs can only see their own screenings within their organization
        query = query.eq('screener_id', currentUserId)
      }

      const { data, error } = await query.order('created_at', { ascending: false })

      if (error) throw error

      const transformedData: Screening[] = (data || []).map((screening: RawSpeechScreening) => ({
        id: screening.id,
        student_id: screening.student_id,
        student_name: screening.students
          ? `${screening.students.first_name} ${screening.students.last_name}`
          : 'Unknown Student',
        grade: screening.school_grades?.grade_level || '',
        type: 'speech' as const,
        status: getScreeningStatus(screening),
        date: screening.created_at?.split('T')[0] || '',
        screening_date: screening.created_at?.split('T')[0] || '',
        screening_type: 'initial',
        screener: screening.users
          ? `${screening.users.first_name} ${screening.users.last_name}`
          : 'Unknown Screener',
        slp_id: screening.screener_id,
        results: screening.clinical_notes || screening.referral_notes || '',
        result: (screening.result as 'P' | 'M' | 'Q' | 'NR' | 'NC' | 'C') || undefined,
        screening_result: (screening.result as 'P' | 'M' | 'Q' | 'NR' | 'NC' | 'C') || undefined,
        notes: screening.clinical_notes || '',
        referral_notes: screening.referral_notes || '',
        vocabulary_support: screening.vocabulary_support,
        suspected_cas: screening.suspected_cas,
        created_at: screening.created_at,
        updated_at: screening.updated_at,
        school_id: screening.students?.school_id || '',
        grade_id: screening.grade_id,
        screener_id: screening.screener_id,
      }))

      // Filter by organization schools if provided
      if (organizationSchoolIds.length > 0) {
        return transformedData.filter(screening =>
          organizationSchoolIds.includes(screening.school_id)
        )
      }

      return transformedData
    } catch (error) {
      console.error('Error fetching speech screenings:', error)
      throw error
    }
  },

  getHearingScreeningsList: async (
    currentUserId?: string,
    userRole?: 'admin' | 'slp' | 'supervisor',
    organizationId?: string
  ): Promise<Screening[]> => {
    try {
      // Get organization schools if organizationId is provided
      let organizationSchoolIds: string[] = []
      if (organizationId) {
        organizationSchoolIds = await getUserOrganizationSchools(organizationId)
      }

      // Build base query
      let query = supabase.from('hearing_screenings').select(
        `
          *,
          students (
            id,
            first_name,
            last_name,
            school_id
          ),
          school_grades (
            id,
            grade_level,
            academic_year
          ),
          users (
            id,
            first_name,
            last_name
          )
        `
      )

      // Apply filters based on user role
      if (userRole === 'slp' && currentUserId) {
        // SLPs can only see their own screenings within their organization
        query = query.eq('screener_id', currentUserId)
      }

      const { data, error } = await query.order('created_at', { ascending: false })

      if (error) throw error

      const transformedData: Screening[] = (data || []).map((screening: RawHearingScreening) => ({
        id: screening.id,
        student_id: screening.student_id,
        student_name: screening.students
          ? `${screening.students.first_name} ${screening.students.last_name}`
          : 'Unknown Student',
        grade: screening.school_grades?.grade_level || '',
        type: 'hearing' as const,
        status: getScreeningStatus(screening),
        date: screening.created_at?.split('T')[0] || '',
        screening_date: screening.created_at?.split('T')[0] || '',
        screening_type: 'initial',
        screener: screening.users
          ? `${screening.users.first_name} ${screening.users.last_name}`
          : 'Unknown Screener',
        slp_id: screening.screener_id,
        results: screening.clinical_notes || screening.referral_notes || '',
        result: getHearingResult(screening),
        screening_result: getHearingResult(screening),
        notes: screening.clinical_notes || '',
        referral_notes: screening.referral_notes || '',
        right_volume_db: screening.right_volume_db,
        right_pressure: screening.right_pressure,
        right_compliance: screening.right_compliance,
        left_volume_db: screening.left_volume_db,
        left_pressure: screening.left_pressure,
        left_compliance: screening.left_compliance,
        created_at: screening.created_at,
        updated_at: screening.updated_at,
        school_id: screening.students?.school_id || '',
        grade_id: screening.grade_id,
        screener_id: screening.screener_id,
      }))

      // Filter by organization schools if provided
      if (organizationSchoolIds.length > 0) {
        return transformedData.filter(screening =>
          organizationSchoolIds.includes(screening.school_id)
        )
      }

      return transformedData
    } catch (error) {
      console.error('Error fetching hearing screenings:', error)
      throw error
    }
  },
}
