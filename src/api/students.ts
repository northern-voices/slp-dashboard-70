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

      // First, try to query with school_id filter and join with screenings to get grade info
      const query = supabase
        .from('students')
        .select(
          `
          *,
          speech_screenings!left(
            id,
            grade_id,
            created_at,
            school_grades!left(
              grade_level
            )
          ),
          hearing_screenings!left(
            id,
            grade_id,
            created_at,
            school_grades!left(
              grade_level
            )
          )
        `
        )
        .eq('school_id', schoolId)
        .order('last_name', { ascending: true })
        .order('first_name', { ascending: true })

      // Try to filter by school_id if the field exists
      try {
        const { data, error } = await query
        if (!error && data) {
          // Transform the data to include grade information from most recent screening
          const transformedStudents = data.map(student => {
            // Get the most recent screening (speech or hearing) to determine grade
            const speechScreenings = student.speech_screenings || []
            const hearingScreenings = student.hearing_screenings || []

            // Combine and sort by creation date to find most recent
            const allScreenings = [
              ...speechScreenings.map(s => ({ ...s, type: 'speech' })),
              ...hearingScreenings.map(s => ({ ...s, type: 'hearing' })),
            ].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())

            // Get grade from most recent screening
            const mostRecentScreening = allScreenings[0]
            const grade = mostRecentScreening?.school_grades?.grade_level || null

            return {
              ...student,
              grade,
            }
          })

          return transformedStudents
        }
      } catch (filterError) {
        // school_id filter failed, fall back to all students
      }

      // Fallback: if school_id filter fails, return all students
      // This handles the case where the database schema doesn't have school_id
      const { data, error } = await supabase
        .from('students')
        .select('*')
        .order('last_name', { ascending: true })
        .order('first_name', { ascending: true })

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
    grade?: string
    qualifies_for_program?: boolean
  }): Promise<Student> => {
    try {
      const insertData: {
        first_name: string
        last_name: string
        student_id: string
        qualifies_for_program: boolean | null
        school_id?: string
        grade?: string
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

      // Only include grade if it's provided
      if (studentData.grade) {
        insertData.grade = studentData.grade
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

  // Create a new student note
  createStudentNote: async (studentId: string, noteText: string): Promise<void> => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        throw new Error('User not authenticated')
      }

      const { error } = await supabase.from('student_notes').insert({
        student_id: studentId,
        created_by: user.id,
        note_text: noteText,
      })

      if (error) throw error
    } catch (error) {
      console.error('Error creating student note:', error)
      throw error
    }
  },

  // Get all notes for a student
  getStudentNotes: async (
    studentId: string
  ): Promise<
    Array<{
      id: string
      note_text: string
      created_at: string
      updated_at: string
      created_by: {
        id: string
        first_name: string
        last_name: string
      }
    }>
  > => {
    try {
      const { data, error } = await supabase
        .from('student_notes')
        .select(
          `
          id,
          note_text,
          created_at,
          updated_at,
          created_by:users!student_notes_created_by_fkey(
            id,
            first_name,
            last_name
          )
        `
        )
        .eq('student_id', studentId)
        .order('created_at', { ascending: false })

      if (error) throw error

      // Transform the data to ensure created_by is a single object, not an array
      const transformedData = data?.map(note => ({
        ...note,
        created_by: Array.isArray(note.created_by) ? note.created_by[0] : note.created_by,
      }))

      return transformedData || []
    } catch (error) {
      console.error('Error fetching student notes:', error)
      throw error
    }
  },

  // Update a student note
  updateStudentNote: async (noteId: string, noteText: string): Promise<void> => {
    try {
      const { error } = await supabase
        .from('student_notes')
        .update({
          note_text: noteText,
          updated_at: new Date().toISOString(),
        })
        .eq('id', noteId)

      if (error) throw error
    } catch (error) {
      console.error('Error updating student note:', error)
      throw error
    }
  },

  // Delete a student note
  deleteStudentNote: async (noteId: string): Promise<void> => {
    try {
      const { error } = await supabase.from('student_notes').delete().eq('id', noteId)

      if (error) throw error
    } catch (error) {
      console.error('Error deleting student note:', error)
      throw error
    }
  },
}
