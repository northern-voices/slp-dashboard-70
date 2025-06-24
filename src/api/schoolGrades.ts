import { supabase } from '@/lib/supabase'

export interface SchoolGrade {
  id: string
  school_id: string
  grade_level: string
  academic_year: string
  created_at: string
  updated_at: string
  // Optional school info if needed
  school?: {
    id: string
    name: string
    organization_id: string
  }
}

interface RawSchoolGrade {
  id: string
  school_id: string
  grade_level: string
  academic_year: string
  created_at: string
  updated_at: string
  schools?: {
    id: string
    name: string
    organization_id: string
  } | null
}

// Helper function to get organization schools
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

export const schoolGradesApi = {
  // Get all school grades for an organization
  getSchoolGrades: async (organizationId?: string): Promise<SchoolGrade[]> => {
    try {
      // Get organization schools if organizationId is provided
      let organizationSchoolIds: string[] = []
      if (organizationId) {
        organizationSchoolIds = await getUserOrganizationSchools(organizationId)

        if (organizationSchoolIds.length === 0) {
          return [] // No schools in organization
        }
      }

      // Build the query
      let query = supabase
        .from('school_grades')
        .select(
          `
          *,
          schools (
            id,
            name,
            organization_id
          )
        `
        )
        .order('academic_year', { ascending: false })
        .order('grade_level', { ascending: true })

      // Filter by organization schools if provided
      if (organizationSchoolIds.length > 0) {
        query = query.in('school_id', organizationSchoolIds)
      }

      const { data, error } = await query

      if (error) throw error

      // Transform the data
      const transformedData: SchoolGrade[] = (data || []).map((grade: RawSchoolGrade) => ({
        id: grade.id,
        school_id: grade.school_id,
        grade_level: grade.grade_level,
        academic_year: grade.academic_year,
        created_at: grade.created_at,
        updated_at: grade.updated_at,
        school: grade.schools
          ? {
              id: grade.schools.id,
              name: grade.schools.name,
              organization_id: grade.schools.organization_id,
            }
          : undefined,
      }))

      return transformedData
    } catch (error) {
      console.error('Error fetching school grades:', error)
      throw error
    }
  },

  // Get school grades for a specific school
  getSchoolGradesBySchool: async (schoolId: string): Promise<SchoolGrade[]> => {
    try {
      const { data, error } = await supabase
        .from('school_grades')
        .select(
          `
          *,
          schools (
            id,
            name,
            organization_id
          )
        `
        )
        .eq('school_id', schoolId)
        .order('academic_year', { ascending: false })
        .order('grade_level', { ascending: true })

      if (error) throw error

      const transformedData: SchoolGrade[] = (data || []).map((grade: RawSchoolGrade) => ({
        id: grade.id,
        school_id: grade.school_id,
        grade_level: grade.grade_level,
        academic_year: grade.academic_year,
        created_at: grade.created_at,
        updated_at: grade.updated_at,
        school: grade.schools
          ? {
              id: grade.schools.id,
              name: grade.schools.name,
              organization_id: grade.schools.organization_id,
            }
          : undefined,
      }))

      return transformedData
    } catch (error) {
      console.error('Error fetching school grades by school:', error)
      throw error
    }
  },

  // Get a specific grade by grade level and academic year
  getGradeByLevelAndYear: async (
    gradeLevel: string,
    academicYear: string,
    organizationId?: string
  ): Promise<SchoolGrade | null> => {
    try {
      // Get organization schools if organizationId is provided
      let organizationSchoolIds: string[] = []
      if (organizationId) {
        organizationSchoolIds = await getUserOrganizationSchools(organizationId)

        if (organizationSchoolIds.length === 0) {
          return null
        }
      }

      let query = supabase
        .from('school_grades')
        .select(
          `
          *,
          schools (
            id,
            name,
            organization_id
          )
        `
        )
        .eq('grade_level', gradeLevel)
        .eq('academic_year', academicYear)

      // Filter by organization schools if provided
      if (organizationSchoolIds.length > 0) {
        query = query.in('school_id', organizationSchoolIds)
      }

      const { data, error } = await query.maybeSingle()

      if (error) throw error

      if (!data) return null

      return {
        id: data.id,
        school_id: data.school_id,
        grade_level: data.grade_level,
        academic_year: data.academic_year,
        created_at: data.created_at,
        updated_at: data.updated_at,
        school: data.schools
          ? {
              id: data.schools.id,
              name: data.schools.name,
              organization_id: data.schools.organization_id,
            }
          : undefined,
      }
    } catch (error) {
      console.error('Error fetching grade by level and year:', error)
      throw error
    }
  },

  // Create a new school grade
  createSchoolGrade: async (data: {
    school_id: string
    grade_level: string
    academic_year: string
  }): Promise<SchoolGrade> => {
    try {
      const { data: newGrade, error } = await supabase
        .from('school_grades')
        .insert({
          school_id: data.school_id,
          grade_level: data.grade_level,
          academic_year: data.academic_year,
        })
        .select(
          `
          *,
          schools (
            id,
            name,
            organization_id
          )
        `
        )
        .single()

      if (error) throw error

      return {
        id: newGrade.id,
        school_id: newGrade.school_id,
        grade_level: newGrade.grade_level,
        academic_year: newGrade.academic_year,
        created_at: newGrade.created_at,
        updated_at: newGrade.updated_at,
        school: newGrade.schools
          ? {
              id: newGrade.schools.id,
              name: newGrade.schools.name,
              organization_id: newGrade.schools.organization_id,
            }
          : undefined,
      }
    } catch (error) {
      console.error('Error creating school grade:', error)
      throw error
    }
  },
}
