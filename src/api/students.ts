import { supabase } from '@/lib/supabase'
import { Student } from '@/types/database'

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
  searchStudents: async (searchTerm: string, schoolId?: string): Promise<Student[]> => {
    try {
      if (!schoolId) {
        return []
      }

      const query = supabase
        .from('students')
        .select('*')
        .eq('school_id', schoolId)
        .or(
          `first_name.ilike.%${searchTerm}%,last_name.ilike.%${searchTerm}%,student_id.ilike.%${searchTerm}%`
        )
        .order('last_name', { ascending: true })
        .order('first_name', { ascending: true })
        .limit(50) // Limit results for performance

      const { data, error } = await query

      if (error) throw error

      return data || []
    } catch (error) {
      console.error('Error searching students:', error)
      throw error
    }
  },

  // Get students by grade (you might need this for your grade filter)
  getStudentsByGrade: async (gradeLevel: string, schoolId?: string): Promise<Student[]> => {
    try {
      if (!schoolId) {
        return []
      }

      // Get students from the specific school
      const { data: students, error: studentsError } = await supabase
        .from('students')
        .select('*')
        .eq('school_id', schoolId)
        .order('last_name', { ascending: true })
        .order('first_name', { ascending: true })

      if (studentsError) throw studentsError

      // Note: Grade filtering is not available in the current database schema
      // The gradeLevel parameter is kept for backward compatibility
      return students || []
    } catch (error) {
      console.error('Error fetching students by grade:', error)
      throw error
    }
  },

  // Get students by school ID
  getStudentsBySchool: async (schoolId: string): Promise<Student[]> => {
    try {
      if (!schoolId) {
        return []
      }

      // First, try to query with school_id filter
      const query = supabase
        .from('students')
        .select('*')
        .order('last_name', { ascending: true })
        .order('first_name', { ascending: true })

      // Try to filter by school_id if the field exists
      try {
        const { data, error } = await query.eq('school_id', schoolId)
        if (!error && data) {
          return data
        }
      } catch (filterError) {
        // school_id filter failed, fall back to all students
      }

      // Fallback: if school_id filter fails, return all students
      // This handles the case where the database schema doesn't have school_id
      const { data, error } = await query
      if (error) throw error

      return data || []
    } catch (error) {
      console.error('Error fetching students by school:', error)
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

  // Create a new student
  createStudent: async (studentData: {
    first_name: string
    last_name: string
    student_id: string
    school_id?: string
    qualifies_for_program?: boolean
  }): Promise<Student> => {
    try {
      const insertData: {
        first_name: string
        last_name: string
        student_id: string
        qualifies_for_program: boolean | null
        school_id?: string
      } = {
        first_name: studentData.first_name,
        last_name: studentData.last_name,
        student_id: studentData.student_id,
        qualifies_for_program: studentData.qualifies_for_program || null,
      }

      // Only include school_id if it's provided
      if (studentData.school_id) {
        insertData.school_id = studentData.school_id
      }

      const { data, error } = await supabase.from('students').insert(insertData).select().single()

      if (error) throw error

      return data
    } catch (error) {
      console.error('Error creating student:', error)
      throw error
    }
  },

  // Update a student
  updateStudent: async (
    studentId: string,
    studentData: Partial<{
      first_name: string
      last_name: string
      student_id: string
      school_id?: string
      qualifies_for_program: boolean
    }>
  ): Promise<Student> => {
    try {
      const { data, error } = await supabase
        .from('students')
        .update({
          ...studentData,
          updated_at: new Date().toISOString(),
        })
        .eq('id', studentId)
        .select()
        .single()

      if (error) throw error

      return data
    } catch (error) {
      console.error('Error updating student:', error)
      throw error
    }
  },

  // Delete a student
  deleteStudent: async (studentId: string): Promise<void> => {
    try {
      const { error } = await supabase.from('students').delete().eq('id', studentId)

      if (error) throw error
    } catch (error) {
      console.error('Error deleting student:', error)
      throw error
    }
  },
}
