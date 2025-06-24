import { supabase } from '@/lib/supabase'

export interface Student {
  id: string // UUID from database
  student_id: string // Human-readable ID like "UMP-WAC-0001"
  first_name: string
  last_name: string
  school_id: string
  qualifies_for_program?: boolean
  created_at?: string
  updated_at?: string
  // Add other fields as needed
}

export const studentsApi = {
  // Get all students for an organization
  getStudents: async (organizationId?: string): Promise<Student[]> => {
    try {
      // Get organization schools if organizationId is provided
      let organizationSchoolIds: string[] = []
      if (organizationId) {
        const { data: schools, error: schoolsError } = await supabase
          .from('schools')
          .select('id')
          .eq('organization_id', organizationId)

        if (schoolsError) throw schoolsError
        organizationSchoolIds = schools?.map(school => school.id) || []

        if (organizationSchoolIds.length === 0) {
          return [] // No schools in organization
        }
      }

      // Build the query
      let query = supabase
        .from('students')
        .select('*')
        .order('last_name', { ascending: true })
        .order('first_name', { ascending: true })

      // Filter by organization schools if provided
      if (organizationSchoolIds.length > 0) {
        query = query.in('school_id', organizationSchoolIds)
      }

      const { data, error } = await query

      if (error) throw error

      return data || []
    } catch (error) {
      console.error('Error fetching students:', error)
      throw error
    }
  },

  // Search students by name
  searchStudents: async (searchTerm: string, organizationId?: string): Promise<Student[]> => {
    try {
      // Get organization schools if organizationId is provided
      let organizationSchoolIds: string[] = []
      if (organizationId) {
        const { data: schools, error: schoolsError } = await supabase
          .from('schools')
          .select('id')
          .eq('organization_id', organizationId)

        if (schoolsError) throw schoolsError
        organizationSchoolIds = schools?.map(school => school.id) || []

        if (organizationSchoolIds.length === 0) {
          return []
        }
      }

      let query = supabase
        .from('students')
        .select('*')
        .or(
          `first_name.ilike.%${searchTerm}%,last_name.ilike.%${searchTerm}%,student_id.ilike.%${searchTerm}%`
        )
        .order('last_name', { ascending: true })
        .order('first_name', { ascending: true })
        .limit(50) // Limit results for performance

      // Filter by organization schools if provided
      if (organizationSchoolIds.length > 0) {
        query = query.in('school_id', organizationSchoolIds)
      }

      const { data, error } = await query

      if (error) throw error

      return data || []
    } catch (error) {
      console.error('Error searching students:', error)
      throw error
    }
  },

  // Get students by grade (you might need this for your grade filter)
  getStudentsByGrade: async (gradeLevel: string, organizationId?: string): Promise<Student[]> => {
    try {
      // First, get school_grades that match the grade level
      let gradeQuery = supabase
        .from('school_grades')
        .select('id, school_id')
        .eq('grade_level', gradeLevel)

      if (organizationId) {
        // Get organization schools
        const { data: schools, error: schoolsError } = await supabase
          .from('schools')
          .select('id')
          .eq('organization_id', organizationId)

        if (schoolsError) throw schoolsError
        const organizationSchoolIds = schools?.map(school => school.id) || []

        if (organizationSchoolIds.length === 0) {
          return []
        }

        gradeQuery = gradeQuery.in('school_id', organizationSchoolIds)
      }

      const { data: grades, error: gradesError } = await gradeQuery

      if (gradesError) throw gradesError

      if (!grades || grades.length === 0) {
        return []
      }

      // Get all school IDs for this grade level
      const schoolIds = [...new Set(grades.map(grade => grade.school_id))]

      // Get students from those schools
      const { data: students, error: studentsError } = await supabase
        .from('students')
        .select('*')
        .in('school_id', schoolIds)
        .order('last_name', { ascending: true })
        .order('first_name', { ascending: true })

      if (studentsError) throw studentsError

      return students || []
    } catch (error) {
      console.error('Error fetching students by grade:', error)
      throw error
    }
  },

  // Get a specific student by ID
  getStudent: async (studentId: string): Promise<Student | null> => {
    try {
      const { data, error } = await supabase
        .from('students')
        .select('*')
        .eq('id', studentId)
        .single()

      if (error) throw error

      return data
    } catch (error) {
      console.error('Error fetching student:', error)
      throw error
    }
  },
}
