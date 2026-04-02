import { supabase } from '@/lib/supabase'
import { Screening } from '@/types/database'
import { ErrorPatterns } from '@/types/screening-form'
import { UserRole } from '@/types/database'

type SpeechScreeningResult = string

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
  error_patterns: ErrorPatterns | null
  created_at: string
  updated_at: string
  students: {
    schools: {
      id: string
      name: string
      organization_id: string
    } | null
    id: string
    first_name: string
    last_name: string
    school_id: string
    student_id: string
    program_status: 'none' | 'qualifies' | 'not_in_program' | 'sub' | 'pause' | 'graduated'
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

const mapProgramStatus = (
  raw?: 'none' | 'qualifies' | 'not_in_program' | 'sub' | 'pause' | 'graduated'
): 'none' | 'qualified' | 'not_in_program' | 'sub' | 'paused' | 'graduated' | 'no_consent' => {
  if (raw === 'qualifies') return 'qualified'
  if (raw === 'pause') return 'paused'
  return raw || 'none'
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

export const speechScreeningsApi = {
  getSpeechScreeningsList: async (
    currentUserId?: string,
    userRole?: UserRole,
    organizationId?: string
  ): Promise<Screening[]> => {
    try {
      // Get organization schools if organizationId is provided
      let organizationSchoolIds: string[] = []

      if (organizationId) {
        organizationSchoolIds = await getUserOrganizationSchools(organizationId)
      }

      // Build base query
      const query = supabase.from('speech_screenings').select(
        `
          *,
          students (
            id,
            first_name,
            last_name,
            school_id,
            student_id,
            program_status,
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
      // if (userRole === 'slp' && currentUserId) {
      //   // SLPs can only see their own screenings within their organization
      //   query = query.eq('screener_id', currentUserId)
      // }

      const { data: initialData, error } = await query
        .order('created_at', { ascending: false })
        .limit(10000)

      // Use let so we can reassign it later
      let data = initialData

      if (error) throw error

      // If organization schools are specified, check if any are missing from the main query
      if (organizationSchoolIds.length > 0) {
        const presentSchoolIds = new Set(
          (data || []).map((s: RawSpeechScreening) => s.students?.school_id).filter(Boolean)
        )

        const missingSchoolIds = organizationSchoolIds.filter(
          schoolId => !presentSchoolIds.has(schoolId)
        )

        // If any organization schools are missing, fetch them specifically
        if (missingSchoolIds.length > 0) {
          const targetQuery = supabase
            .from('speech_screenings')
            .select(
              `
              *,
              students!inner (
                id,
                first_name,
                last_name,
                school_id,
                student_id,
                program_status,
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
            .in('students.school_id', missingSchoolIds)
            .order('created_at', { ascending: false })

          const { data: targetData, error: targetError } = await targetQuery

          if (!targetError && targetData && targetData.length > 0) {
            // Merge the targeted data with the main data
            const mergedData = [...(data || []), ...targetData]
            data = mergedData as RawSpeechScreening[]
          }
        }
      }

      const transformedData: Screening[] = (data || []).map((screening: RawSpeechScreening) => ({
        id: screening.id,
        student_id: screening.student_id,
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
        result: (screening.result as SpeechScreeningResult) || undefined,
        screening_result: (screening.result as SpeechScreeningResult) || undefined,
        referral_notes: screening.referral_notes || '',
        clinical_notes: screening.clinical_notes || '',
        vocabulary_support: screening.vocabulary_support,
        suspected_cas: screening.suspected_cas,
        error_patterns: screening.error_patterns,
        created_at: screening.created_at,
        updated_at: screening.updated_at,
        school_id: screening.students?.school_id || '',
        school_name: screening.students?.schools?.name || 'Unknown School',
        grade_id: screening.grade_id,
        screener_id: screening.screener_id,
        academic_year: screening.school_grades?.academic_year || '',
        program_status: mapProgramStatus(screening.students?.program_status),
      }))

      // Filter by organization schools if provided
      if (organizationSchoolIds.length > 0) {
        return transformedData.filter(screening =>
          organizationSchoolIds.includes(screening.school_id)
        )
      }

      return data && transformedData
    } catch (error) {
      console.error('Error fetching speech screenings:', error)
      throw error
    }
  },

  getSpeechScreeningsByStudent: async (
    studentId: string,
    currentUserId?: string,
    userRole?: UserRole
  ): Promise<Screening[]> => {
    try {
      // Build base query for specific student
      const query = supabase
        .from('speech_screenings')
        .select(
          `
          *,
          students (
            id,
            first_name,
            last_name,
            school_id,
            student_id,
            program_status,
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
        .eq('student_id', studentId)

      // Apply filters based on user role
      // if (userRole === 'slp' && currentUserId) {
      //   // SLPs can only see their own screenings
      //   query = query.eq('screener_id', currentUserId)
      // }

      const { data, error } = await query.order('created_at', { ascending: false })

      if (error) throw error

      const transformedData: Screening[] = (data || []).map((screening: RawSpeechScreening) => ({
        id: screening.id,
        student_id: screening.student_id,
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
        result: (screening.result as SpeechScreeningResult) || undefined,
        screening_result: (screening.result as SpeechScreeningResult) || undefined,
        referral_notes: screening.referral_notes || '',
        clinical_notes: screening.clinical_notes || '',
        vocabulary_support: screening.vocabulary_support,
        suspected_cas: screening.suspected_cas,
        error_patterns: screening.error_patterns,
        created_at: screening.created_at,
        updated_at: screening.updated_at,
        school_id: screening.students?.school_id || '',
        school_name: screening.students?.schools?.name || 'Unknown School',
        grade_id: screening.grade_id,
        screener_id: screening.screener_id,
        academic_year: screening.school_grades?.academic_year || '',
        program_status: mapProgramStatus(screening.students?.program_status),
      }))

      return transformedData
    } catch (error) {
      console.error('Error fetching speech screenings by student:', error)
      throw error
    }
  },

  getSpeechScreeningById: async (
    screeningId: string,
    organizationId?: string
  ): Promise<Screening | null> => {
    try {
      const { data, error } = await supabase
        .from('speech_screenings')
        .select(
          `
          *,
          students (
            id,
            first_name,
            last_name,
            school_id,
            student_id,
            program_status,
            schools (
              id,
              name,
              organization_id
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
        .eq('id', screeningId)
        .single()

      if (error) {
        if (error.code === 'PGRST116') {
          // No rows found
          return null
        }
        throw error
      }

      if (!data) return null

      const screening: RawSpeechScreening = data

      // Validate organization access if organizationId is provided
      if (organizationId && screening.students?.schools) {
        const screeningOrgId = screening.students.schools.organization_id
        if (screeningOrgId !== organizationId) {
          // Screening belongs to a different organization - deny access
          console.warn('Access denied: Screening belongs to a different organization')
          return null
        }
      }

      const transformedScreening: Screening = {
        id: screening.id,
        student_id: screening.student_id,
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
        result: (screening.result as SpeechScreeningResult) || undefined,
        screening_result: (screening.result as SpeechScreeningResult) || undefined,
        referral_notes: screening.referral_notes || '',
        clinical_notes: screening.clinical_notes || '',
        vocabulary_support: screening.vocabulary_support,
        suspected_cas: screening.suspected_cas,
        error_patterns: screening.error_patterns,
        created_at: screening.created_at,
        updated_at: screening.updated_at,
        school_id: screening.students?.school_id || '',
        school_name: screening.students?.schools?.name || 'Unknown School',
        grade_id: screening.grade_id,
        screener_id: screening.screener_id,
        academic_year: screening.school_grades?.academic_year || '',
        program_status: mapProgramStatus(screening.students?.program_status),
      }

      return transformedScreening
    } catch (error) {
      console.error('Error fetching speech screening by ID:', error)
      throw error
    }
  },

  createSpeechScreening: async (data: {
    student_id: string
    screener_id: string
    grade_id: string
    error_patterns?: ErrorPatterns
    result?: SpeechScreeningResult | null
    vocabulary_support?: boolean
    suspected_cas?: boolean
    clinical_notes?: string | null
    referral_notes?: string | null
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
        error_patterns: data.error_patterns || null,
        result: data.result || null,
        vocabulary_support: data.vocabulary_support || false,
        suspected_cas: data.suspected_cas || false,
        clinical_notes: data.clinical_notes || null,
        referral_notes: data.referral_notes || null,
      }

      const { data: newScreening, error } = await supabase
        .from('speech_screenings')
        .insert(insertData)
        .select(
          `
        *,
        students (
          id,
          first_name,
          last_name,
          school_id,
          student_id,
          program_status
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

      // Safely access nested objects with null checks
      const studentName = newScreening.students
        ? `${newScreening.students.first_name} ${newScreening.students.last_name}`
        : 'Unknown Student'

      const gradeLevel = newScreening.school_grades?.grade_level || ''

      const screenerName = newScreening.users
        ? `${newScreening.users.first_name} ${newScreening.users.last_name}`
        : 'Unknown Screener'

      const schoolId = newScreening.students?.school_id || ''

      // Transform the raw data to match your Screening type
      const transformedScreening: Screening = {
        id: newScreening.id,
        student_id: newScreening.students?.student_id || '',
        student_name: studentName,
        grade: gradeLevel,
        date: newScreening.created_at?.split('T')[0] || '',
        screening_date: newScreening.created_at?.split('T')[0] || '',
        screening_type: 'initial',
        screener: screenerName,
        slp_id: newScreening.screener_id,
        result: newScreening.result,
        screening_result: newScreening.result,
        referral_notes: newScreening.referral_notes || '',
        clinical_notes: newScreening.clinical_notes || '',
        vocabulary_support: newScreening.vocabulary_support,
        suspected_cas: newScreening.suspected_cas,
        error_patterns: newScreening.error_patterns,
        created_at: newScreening.created_at,
        updated_at: newScreening.updated_at,
        school_id: schoolId,
        grade_id: newScreening.grade_id,
        screener_id: newScreening.screener_id,
        academic_year: newScreening.school_grades?.academic_year || '',
        program_status: mapProgramStatus(newScreening.students?.program_status),
      }

      return transformedScreening
    } catch (error) {
      console.error('Error creating speech screening:', error)
      throw error
    }
  },

  // You can add more mutation functions here
  updateSpeechScreening: async (
    id: string,
    data: Partial<{
      student_id: string
      screener_id: string
      grade_id: string
      screening_type: string
      error_patterns: ErrorPatterns
      result: SpeechScreeningResult | null
      vocabulary_support: boolean
      suspected_cas: boolean
      clinical_notes: string | null
      referral_notes: string | null
    }>
  ): Promise<Screening> => {
    try {
      const { data: updatedScreening, error } = await supabase
        .from('speech_screenings')
        .update(data)
        .eq('id', id)
        .select(
          `
        *,
        students (
          id,
          first_name,
          last_name,
          school_id,
          student_id,
          program_status
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

      // Transform similar to createSpeechScreening
      const studentName = updatedScreening.students
        ? `${updatedScreening.students.first_name} ${updatedScreening.students.last_name}`
        : 'Unknown Student'

      const gradeLevel = updatedScreening.school_grades?.grade_level || ''
      const screenerName = updatedScreening.users
        ? `${updatedScreening.users.first_name} ${updatedScreening.users.last_name}`
        : 'Unknown Screener'
      const schoolId = updatedScreening.students?.school_id || ''

      const transformedScreening: Screening = {
        id: updatedScreening.id,
        student_id: updatedScreening.students?.student_id || '',
        student_name: studentName,
        grade: gradeLevel,
        date: updatedScreening.created_at?.split('T')[0] || '',
        screening_date: updatedScreening.created_at?.split('T')[0] || '',
        screening_type: 'initial',
        screener: screenerName,
        slp_id: updatedScreening.screener_id,
        result: updatedScreening.result || undefined,
        screening_result: updatedScreening.result || undefined,
        referral_notes: updatedScreening.referral_notes || '',
        clinical_notes: updatedScreening.clinical_notes || '',
        vocabulary_support: updatedScreening.vocabulary_support,
        suspected_cas: updatedScreening.suspected_cas,
        error_patterns: updatedScreening.error_patterns,
        created_at: updatedScreening.created_at,
        updated_at: updatedScreening.updated_at,
        school_id: schoolId,
        grade_id: updatedScreening.grade_id,
        screener_id: updatedScreening.screener_id,
        academic_year: updatedScreening.school_grades?.academic_year || '',
        program_status: mapProgramStatus(updatedScreening.students?.program_status),
      }

      return transformedScreening
    } catch (error) {
      console.error('Error updating speech screening:', error)
      throw error
    }
  },

  deleteSpeechScreening: async (id: string): Promise<void> => {
    try {
      const { error } = await supabase.from('speech_screenings').delete().eq('id', id)

      if (error) throw error
    } catch (error) {
      console.error('Error deleting speech screening:', error)
      throw error
    }
  },

  getSpeechScreeningsBySchool: async (
    schoolId: string,
    currentUserId?: string,
    userRole?: UserRole,
    dateFilter?: 'all' | 'school_year',
    page: number = 1,
    pageSize: number = 50
  ): Promise<{ data: Screening[]; totalCount: number }> => {
    try {
      // Calculate school year start date (September 1st)
      const currentDate = new Date()
      const currentYear = currentDate.getFullYear()
      const currentMonth = currentDate.getMonth() // 0-indexed (September = 8)

      let schoolYearStart: Date
      if (currentMonth >= 8) {
        // September or later
        schoolYearStart = new Date(currentYear, 8, 1) // September 1st of current year
      } else {
        schoolYearStart = new Date(currentYear - 1, 8, 1) // September 1st of previous year
      }

      // Build base query for specific school
      let query = supabase
        .from('speech_screenings')
        .select(
          `
          *,
          students!inner (
            id,
            first_name,
            last_name,
            school_id,
            student_id,
            program_status,
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
        `,
          { count: 'exact' }
        )
        .eq('students.school_id', schoolId)

      // Apply date filter at database level (default to school year)
      if (dateFilter !== 'all') {
        query = query.gte('created_at', schoolYearStart.toISOString())
      }

      // Apply filters based on user role
      // if (userRole === 'slp' && currentUserId) {
      //   // SLPs can only see their own screenings
      //   query = query.eq('screener_id', currentUserId)
      // }

      const from = (page - 1) * pageSize
      const to = from + pageSize - 1

      const { data, error, count } = await query
        .order('created_at', { ascending: false })
        .range(from, to)

      if (error) throw error

      const transformedData: Screening[] = (data || []).map((screening: RawSpeechScreening) => ({
        id: screening.id,
        student_id: screening.student_id,
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
        result: (screening.result as SpeechScreeningResult) || undefined,
        screening_result: (screening.result as SpeechScreeningResult) || undefined,
        referral_notes: screening.referral_notes || '',
        clinical_notes: screening.clinical_notes || '',
        vocabulary_support: screening.vocabulary_support,
        suspected_cas: screening.suspected_cas,
        error_patterns: screening.error_patterns,
        created_at: screening.created_at,
        updated_at: screening.updated_at,
        school_id: screening.students?.school_id || '',
        school_name: screening.students?.schools?.name || 'Unknown School',
        grade_id: screening.grade_id,
        screener_id: screening.screener_id,
        academic_year: screening.school_grades?.academic_year || '',
        program_status: mapProgramStatus(screening.students?.program_status),
      }))

      return { data: transformedData, totalCount: count ?? 0 }
    } catch (error) {
      console.error('Error fetching speech screenings by school:', error)
      throw error
    }
  },
}
