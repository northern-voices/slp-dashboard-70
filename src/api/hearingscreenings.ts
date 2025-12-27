import { supabase } from '@/lib/supabase'
import { Screening } from '@/types/database'

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
  right_ear_volume_result: string | null
  right_ear_pressure_result: string | null
  right_ear_compliance_result: string | null
  left_ear_volume_result: string | null
  left_ear_pressure_result: string | null
  left_ear_compliance_result: string | null
  right_ear_result: string | null
  left_ear_result: string | null
  result: string | null
  clinical_notes: string | null
  referral_notes: string | null
  created_at: string
  updated_at: string
  students: {
    id: string
    first_name: string
    last_name: string
    school_id: string
    student_id: string
    schools: {
      id: string
      name: string
    } | null
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

// Transform raw hearing screening data to unified Screening interface
const transformHearingScreening = (screening: RawHearingScreening): Screening => {
  return {
    id: screening.id,
    student_id: screening.students?.student_id || '',
    student_name: screening.students
      ? `${screening.students.first_name} ${screening.students.last_name}`
      : 'Unknown Student',
    grade: screening.school_grades?.grade_level || '',
    date: screening.created_at?.split('T')[0] || '',
    screening_date: screening.created_at?.split('T')[0] || '',
    screening_type: 'initial',
    screener: screening.users
      ? `${screening.users.first_name} ${screening.users.last_name}`
      : 'Unknown Screener',
    slp_id: screening.screener_id,
    result: screening.result,
    school_name: screening.students?.schools?.name || 'Unknown School',
    referral_notes: screening.referral_notes || '',
    clinical_notes: screening.clinical_notes || '',
    source_table: 'hearing',
    // Hearing-specific fields
    right_volume_db: screening.right_volume_db,
    right_pressure: screening.right_pressure,
    right_compliance: screening.right_compliance,
    left_volume_db: screening.left_volume_db,
    left_pressure: screening.left_pressure,
    left_compliance: screening.left_compliance,
    right_ear_volume_result: screening.right_ear_volume_result,
    right_ear_pressure_result: screening.right_ear_pressure_result,
    right_ear_compliance_result: screening.right_ear_compliance_result,
    left_ear_volume_result: screening.left_ear_volume_result,
    left_ear_pressure_result: screening.left_ear_pressure_result,
    left_ear_compliance_result: screening.left_ear_compliance_result,
    right_ear_result: screening.right_ear_result,
    left_ear_result: screening.left_ear_result,
    created_at: screening.created_at,
    updated_at: screening.updated_at,
    school_id: screening.students?.school_id || '',
    grade_id: screening.grade_id,
    screener_id: screening.screener_id,
    academic_year: screening.school_grades?.academic_year || '',
  }
}

export const hearingScreeningsApi = {
  getHearingScreeningsList: async (
    currentUserId?: string,
    userRole?: 'admin' | 'slp' | 'supervisor',
    organizationId?: string,
    schoolId?: string
  ): Promise<Screening[]> => {
    try {
      // Get organization schools if organizationId is provided
      let organizationSchoolIds: string[] = []
      if (organizationId) {
        organizationSchoolIds = await getUserOrganizationSchools(organizationId)
      }

      // Build base query - using * to get all columns
      let query = supabase.from('hearing_screenings').select(
        `
          *,
          students (
            id,
            first_name,
            last_name,
            school_id,
            student_id,
            schools (
              id,
              name
            )
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

      const transformedData: Screening[] = (data || []).map(transformHearingScreening)

      // Filter by specific school if provided (takes priority)
      if (schoolId) {
        return transformedData.filter(screening => screening.school_id === schoolId)
      }

      // Otherwise filter by organization schools if provided
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

  getHearingScreeningsByStudent: async (
    studentId: string,
    currentUserId?: string,
    userRole?: 'admin' | 'slp' | 'supervisor'
  ): Promise<Screening[]> => {
    try {
      // Build base query for specific student
      let query = supabase
        .from('hearing_screenings')
        .select(
          `
          id,
          student_id,
          screener_id,
          grade_id,
          right_volume_db,
          right_pressure,
          right_compliance,
          left_volume_db,
          left_pressure,
          left_compliance,
          right_ear_volume_result,
          right_ear_pressure_result,
          right_ear_compliance_result,
          left_ear_volume_result,
          left_ear_pressure_result,
          left_ear_compliance_result,
          right_ear_result,
          left_ear_result,
          result,
          clinical_notes,
          referral_notes,
          created_at,
          updated_at,
          students (
            id,
            first_name,
            last_name,
            school_id,
            student_id
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
        .eq('student_id', studentId)

      // Apply filters based on user role
      if (userRole === 'slp' && currentUserId) {
        // SLPs can only see their own screenings
        query = query.eq('screener_id', currentUserId)
      }

      const { data, error } = await query.order('created_at', { ascending: false })

      if (error) throw error

      const transformedData: Screening[] = (data || []).map(transformHearingScreening)

      return transformedData
    } catch (error) {
      console.error('Error fetching hearing screenings by student:', error)
      throw error
    }
  },

  createHearingScreening: async (data: {
    student_id: string
    screener_id: string
    grade_id: string
    right_volume_db?: number | null
    right_pressure?: number | null
    right_compliance?: number | null
    left_volume_db?: number | null
    left_pressure?: number | null
    left_compliance?: number | null
    clinical_notes?: string | null
    referral_notes?: string | null
    result?: string | null
  }): Promise<Screening> => {
    try {
      // Validate required fields
      if (!data.student_id || !data.screener_id || !data.grade_id) {
        throw new Error('Missing required fields: student_id, screener_id, or grade_id')
      }

      const insertData = {
        student_id: data.student_id,
        screener_id: data.screener_id,
        grade_id: data.grade_id,
        right_volume_db: data.right_volume_db ?? null,
        right_pressure: data.right_pressure ?? null,
        right_compliance: data.right_compliance ?? null,
        left_volume_db: data.left_volume_db ?? null,
        left_pressure: data.left_pressure ?? null,
        left_compliance: data.left_compliance ?? null,
        clinical_notes: data.clinical_notes || null,
        referral_notes: data.referral_notes || null,
        result: data.result || null,
      }

      const { data: newScreening, error } = await supabase
        .from('hearing_screenings')
        .insert(insertData)
        .select(
          `
        id,
        student_id,
        screener_id,
        grade_id,
        right_volume_db,
        right_pressure,
        right_compliance,
        left_volume_db,
        left_pressure,
        left_compliance,
        right_ear_volume_result,
        right_ear_pressure_result,
        right_ear_compliance_result,
        left_ear_volume_result,
        left_ear_pressure_result,
        left_ear_compliance_result,
        clinical_notes,
        referral_notes,
        created_at,
        updated_at,
        students (
          id,
          first_name,
          last_name,
          school_id,
          student_id
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
        .single()

      if (error) {
        console.error('Supabase error:', error)
        throw error
      }

      if (!newScreening) {
        throw new Error('No data returned from insert operation')
      }

      return transformHearingScreening(newScreening)
    } catch (error) {
      console.error('Error creating hearing screening:', error)
      throw error
    }
  },

  updateHearingScreening: async (
    id: string,
    data: Partial<{
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
      result: string | null
    }>
  ): Promise<Screening> => {
    try {
      const { data: updatedScreening, error } = await supabase
        .from('hearing_screenings')
        .update(data)
        .eq('id', id)
        .select(
          `
        id,
        student_id,
        screener_id,
        grade_id,
        right_volume_db,
        right_pressure,
        right_compliance,
        left_volume_db,
        left_pressure,
        left_compliance,
        right_ear_volume_result,
        right_ear_pressure_result,
        right_ear_compliance_result,
        left_ear_volume_result,
        left_ear_pressure_result,
        left_ear_compliance_result,
        clinical_notes,
        referral_notes,
        created_at,
        updated_at,
        students (
          id,
          first_name,
          last_name,
          school_id,
          student_id
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
        .single()

      if (error) throw error

      return transformHearingScreening(updatedScreening)
    } catch (error) {
      console.error('Error updating hearing screening:', error)
      throw error
    }
  },

  deleteHearingScreening: async (id: string): Promise<void> => {
    try {
      const { error } = await supabase.from('hearing_screenings').delete().eq('id', id)

      if (error) throw error
    } catch (error) {
      console.error('Error deleting hearing screening:', error)
      throw error
    }
  },
}
