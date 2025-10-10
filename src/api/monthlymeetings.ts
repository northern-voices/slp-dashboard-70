import { supabase } from '@/lib/supabase'

export interface MonthlyMeeting {
  id: string
  meeting_title: string
  student_id: string
  attendees: string[]
  sessions_attended: number | null
  meeting_notes: string | null
  additional_notes: string | null
  meeting_date: string
  created_at: string
  updated_at: string
  // Joined data
  student?: {
    id: string
    first_name: string
    last_name: string
    student_id: string
    school_id: string
  } | null
}

interface RawMonthlyMeeting {
  id: string
  meeting_title: string
  student_id: string
  attendees: string[]
  sessions_attended: number | null
  meeting_notes: string | null
  additional_notes: string | null
  meeting_date: string
  created_at: string
  updated_at: string
  students: {
    id: string
    first_name: string
    last_name: string
    student_id: string
    school_id: string
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

// Transform raw monthly meeting data
const transformMonthlyMeeting = (meeting: RawMonthlyMeeting): MonthlyMeeting => ({
  id: meeting.id,
  meeting_title: meeting.meeting_title,
  student_id: meeting.student_id,
  attendees: meeting.attendees,
  sessions_attended: meeting.sessions_attended,
  meeting_notes: meeting.meeting_notes,
  additional_notes: meeting.additional_notes,
  meeting_date: meeting.meeting_date,
  created_at: meeting.created_at,
  updated_at: meeting.updated_at,
  student: meeting.students,
})

export const monthlyMeetingsApi = {
  getMonthlyMeetingsList: async (
    currentUserId?: string,
    userRole?: 'admin' | 'slp' | 'supervisor',
    organizationId?: string
  ): Promise<MonthlyMeeting[]> => {
    try {
      // Get organization schools if organizationId is provided
      let organizationSchoolIds: string[] = []

      if (organizationId) {
        organizationSchoolIds = await getUserOrganizationSchools(organizationId)
      }

      // Build base query
      const query = supabase.from('monthly_meetings').select(
        `
          *,
          students (
            id,
            first_name,
            last_name,
            student_id,
            school_id
          )
        `
      )

      const { data: initialData, error } = await query
        .order('meeting_date', { ascending: false })
        .limit(10000)

      let data = initialData

      if (error) throw error

      // If organization schools are specified, check if any are missing from the main query
      if (organizationSchoolIds.length > 0) {
        const presentSchoolIds = new Set(
          (data || []).map((m: RawMonthlyMeeting) => m.students?.school_id).filter(Boolean)
        )

        const missingSchoolIds = organizationSchoolIds.filter(
          schoolId => !presentSchoolIds.has(schoolId)
        )

        // If any organization schools are missing, fetch them specifically
        if (missingSchoolIds.length > 0) {
          const targetQuery = supabase
            .from('monthly_meetings')
            .select(
              `
              *,
              students!inner (
                id,
                first_name,
                last_name,
                student_id,
                school_id
              )
            `
            )
            .in('students.school_id', missingSchoolIds)
            .order('meeting_date', { ascending: false })

          const { data: targetData, error: targetError } = await targetQuery

          if (!targetError && targetData && targetData.length > 0) {
            // Merge the targeted data with the main data
            const mergedData = [...(data || []), ...targetData]
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            data = mergedData as any[]
          }
        }
      }

      const transformedData: MonthlyMeeting[] = (data || []).map(transformMonthlyMeeting)

      // Filter by organization schools if provided
      if (organizationSchoolIds.length > 0) {
        return transformedData.filter(
          meeting =>
            meeting.student?.school_id && organizationSchoolIds.includes(meeting.student.school_id)
        )
      }

      return transformedData
    } catch (error) {
      console.error('Error fetching monthly meetings:', error)
      throw error
    }
  },

  getMonthlyMeetingsByStudent: async (
    studentId: string,
    currentUserId?: string,
    userRole?: 'admin' | 'slp' | 'supervisor'
  ): Promise<MonthlyMeeting[]> => {
    try {
      // Build base query for specific student
      const query = supabase
        .from('monthly_meetings')
        .select(
          `
          *,
          students (
            id,
            first_name,
            last_name,
            student_id,
            school_id
          )
        `
        )
        .eq('student_id', studentId)

      const { data, error } = await query.order('meeting_date', { ascending: false })

      if (error) throw error

      const transformedData: MonthlyMeeting[] = (data || []).map(transformMonthlyMeeting)

      return transformedData
    } catch (error) {
      console.error('Error fetching monthly meetings by student:', error)
      throw error
    }
  },

  getMonthlyMeetingsBySchool: async (
    schoolId: string,
    currentUserId?: string,
    userRole?: 'admin' | 'slp' | 'supervisor',
    dateFilter?: 'all' | 'school_year'
  ): Promise<MonthlyMeeting[]> => {
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

      // First, let's check all monthly meetings without filtering by school
      const { data: allMeetings, error: allError } = await supabase
        .from('monthly_meetings')
        .select('*')
        .order('meeting_date', { ascending: false })

      if (allError) console.error('Error fetching all meetings:', allError)

      // Build base query for specific school
      // Note: We can't filter by school_id directly since student_id can be null
      // We'll fetch all meetings and filter client-side, or we need a different approach
      // For now, let's just get all meetings since student_id is optional
      let query = supabase.from('monthly_meetings').select(
        `
          *,
          students (
            id,
            first_name,
            last_name,
            student_id,
            school_id
          )
        `
      )

      // Apply date filter at database level (default to school year)
      if (dateFilter !== 'all') {
        query = query.gte('meeting_date', schoolYearStart.toISOString().split('T')[0])
      }

      const { data, error } = await query.order('meeting_date', { ascending: false })

      if (error) throw error

      const transformedData: MonthlyMeeting[] = (data || []).map(transformMonthlyMeeting)

      return transformedData
    } catch (error) {
      console.error('Error fetching monthly meetings by school:', error)
      throw error
    }
  },

  createMonthlyMeeting: async (data: {
    meeting_title: string
    student_id: string | null
    attendees: string[]
    sessions_attended?: number | null
    meeting_notes?: string | null
    additional_notes?: string | null
    meeting_date: string
  }): Promise<MonthlyMeeting> => {
    try {
      // Validate required fields
      if (!data.meeting_date) {
        throw new Error('Missing required fields: meeting_date')
      }

      if (!data.attendees || data.attendees.length === 0) {
        throw new Error('At least one attendee is required')
      }

      const insertData = {
        meeting_title: data.meeting_title,
        student_id: data.student_id || null,
        attendees: data.attendees,
        sessions_attended: data.sessions_attended || null,
        meeting_notes: data.meeting_notes || null,
        additional_notes: data.additional_notes || null,
        meeting_date: data.meeting_date,
      }

      const { data: newMeeting, error } = await supabase
        .from('monthly_meetings')
        .insert(insertData)
        .select(
          `
        *,
        students (
          id,
          first_name,
          last_name,
          student_id,
          school_id
        )
      `
        )
        .single()

      if (error) {
        console.error('Supabase error:', error)
        throw error
      }

      if (!newMeeting) {
        throw new Error('No data returned from insert operation')
      }

      return transformMonthlyMeeting(newMeeting)
    } catch (error) {
      console.error('Error creating monthly meeting:', error)
      throw error
    }
  },

  updateMonthlyMeeting: async (
    id: string,
    data: Partial<{
      student_id: string
      attendees: string[]
      sessions_attended: number | null
      meeting_notes: string | null
      additional_notes: string | null
      meeting_date: string
    }>
  ): Promise<MonthlyMeeting> => {
    try {
      const { data: updatedMeeting, error } = await supabase
        .from('monthly_meetings')
        .update(data)
        .eq('id', id)
        .select(
          `
        *,
        students (
          id,
          first_name,
          last_name,
          student_id,
          school_id
        )
      `
        )
        .single()

      if (error) throw error

      return transformMonthlyMeeting(updatedMeeting)
    } catch (error) {
      console.error('Error updating monthly meeting:', error)
      throw error
    }
  },

  deleteMonthlyMeeting: async (id: string): Promise<void> => {
    try {
      const { error } = await supabase.from('monthly_meetings').delete().eq('id', id)

      if (error) throw error
    } catch (error) {
      console.error('Error deleting monthly meeting:', error)
      throw error
    }
  },
}
