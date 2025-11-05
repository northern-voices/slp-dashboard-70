import { supabase } from '@/lib/supabase'

export interface StudentUpdate {
  id: string
  student_id: string
  sessions_attended: number | null
  meeting_notes: string | null
  // Joined data
  student?: {
    id: string
    first_name: string
    last_name: string
    student_id: string
    school_id: string
    program_status?: string
    grade?: {
      id: string
      grade_level: string
      academic_year: string
    } | null
  } | null
}

export interface MonthlyMeeting {
  id: string
  meeting_title: string
  meeting_date: string
  attendees: string[]
  additional_notes: string | null
  action_plan: string | null
  facilitator_id: string | null
  school_id: string | null
  created_at: string
  updated_at: string
  // Joined data
  facilitator?: {
    id: string
    first_name: string
    last_name: string
    email: string
  } | null
  student_updates?: StudentUpdate[]
}

interface RawMonthlyMeeting {
  id: string
  meeting_title: string
  meeting_date: string
  attendees: string[]
  additional_notes: string | null
  action_plan: string | null
  facilitator_id: string | null
  school_id: string | null
  created_at: string
  updated_at: string
  facilitator: {
    id: string
    first_name: string
    last_name: string
    email: string
  } | null
  monthly_meeting_student_updates: Array<{
    id: string
    student_id: string
    sessions_attended: number | null
    meeting_notes: string | null
    students: {
      id: string
      first_name: string
      last_name: string
      student_id: string
      school_id: string
      speech_screenings: Array<{
        created_at: string
        school_grades: {
          id: string
          grade_level: string
          academic_year: string
        } | null
      }>
    } | null
  }>
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
  meeting_date: meeting.meeting_date,
  attendees: meeting.attendees,
  additional_notes: meeting.additional_notes,
  action_plan: meeting.action_plan,
  facilitator_id: meeting.facilitator_id,
  school_id: meeting.school_id,
  created_at: meeting.created_at,
  updated_at: meeting.updated_at,
  facilitator: meeting.facilitator,
  student_updates: meeting.monthly_meeting_student_updates.map(update => {
    // Get the most recent speech screening by sorting by created_at
    let mostRecentGrade = null

    if (update.students?.speech_screenings && update.students.speech_screenings.length > 0) {
      const sortedScreenings = [...update.students.speech_screenings].sort(
        (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      )
      mostRecentGrade = sortedScreenings[0]?.school_grades || null
    }

    return {
      id: update.id,
      student_id: update.student_id,
      sessions_attended: update.sessions_attended,
      meeting_notes: update.meeting_notes,
      student: update.students
        ? {
            id: update.students.id,
            first_name: update.students.first_name,
            last_name: update.students.last_name,
            student_id: update.students.student_id,
            school_id: update.students.school_id,
            program_status: update.students.program_status,
            grade: mostRecentGrade,
          }
        : null,
    }
  }),
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

      // Build base query with student updates
      const query = supabase.from('monthly_meetings').select(
        `
          *,
          facilitator:users!facilitator_id (
            id,
            first_name,
            last_name,
            email
          ),
          monthly_meeting_student_updates (
            id,
            student_id,
            sessions_attended,
            meeting_notes,
            students (
              id,
              first_name,
              last_name,
              student_id,
              school_id,
              program_status,
              speech_screenings (
                created_at,
                school_grades (
                  id,
                  grade_level,
                  academic_year
                )
              )
            )
          )
        `
      )

      const { data, error } = await query.order('meeting_date', { ascending: false }).limit(10000)

      if (error) throw error

      const transformedData: MonthlyMeeting[] = (data || []).map(transformMonthlyMeeting)

      // Filter by organization schools if provided
      if (organizationSchoolIds.length > 0) {
        return transformedData.filter(
          meeting =>
            meeting.student_updates?.length === 0 ||
            meeting.student_updates?.some(
              update =>
                update.student?.school_id &&
                organizationSchoolIds.includes(update.student.school_id)
            )
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
      // Query monthly meetings that have updates for this student
      const query = supabase
        .from('monthly_meetings')
        .select(
          `
          *,
          facilitator:users!facilitator_id (
            id,
            first_name,
            last_name,
            email
          ),
          monthly_meeting_student_updates!inner (
            id,
            student_id,
            sessions_attended,
            meeting_notes,
            students (
              id,
              first_name,
              last_name,
              student_id,
              school_id,
              speech_screenings (
                created_at,
                school_grades (
                  id,
                  grade_level,
                  academic_year
                )
              )
            )
          )
        `
        )
        .eq('monthly_meeting_student_updates.student_id', studentId)

      const { data, error } = await query.order('meeting_date', { ascending: false })

      if (error) throw error

      // Transform and filter to only include the specific student's update
      const transformedData: MonthlyMeeting[] = (data || []).map(meeting => {
        // Filter student updates to only include this specific student
        const studentUpdates = meeting.monthly_meeting_student_updates.filter(
          update => update.student_id === studentId
        )

        return {
          id: meeting.id,
          meeting_title: meeting.meeting_title,
          meeting_date: meeting.meeting_date,
          attendees: meeting.attendees,
          additional_notes: meeting.additional_notes,
          action_plan: meeting.action_plan,
          facilitator_id: meeting.facilitator_id,
          school_id: meeting.school_id,
          created_at: meeting.created_at,
          updated_at: meeting.updated_at,
          facilitator: meeting.facilitator,
          student_updates: studentUpdates.map(update => {
            // Get the most recent speech screening by sorting by created_at
            let mostRecentGrade = null

            if (
              update.students?.speech_screenings &&
              update.students.speech_screenings.length > 0
            ) {
              const sortedScreenings = [...update.students.speech_screenings].sort(
                (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
              )
              mostRecentGrade = sortedScreenings[0]?.school_grades || null
            }

            return {
              id: update.id,
              student_id: update.student_id,
              sessions_attended: update.sessions_attended,
              meeting_notes: update.meeting_notes,
              student: update.students
                ? {
                    id: update.students.id,
                    first_name: update.students.first_name,
                    last_name: update.students.last_name,
                    student_id: update.students.student_id,
                    school_id: update.students.school_id,
                    grade: mostRecentGrade,
                  }
                : null,
            }
          }),
        }
      })

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

      // Build base query with student updates
      let query = supabase.from('monthly_meetings').select(
        `
          *,
          facilitator:users!facilitator_id (
            id,
            first_name,
            last_name,
            email
          ),
          monthly_meeting_student_updates (
            id,
            student_id,
            sessions_attended,
            meeting_notes,
            students (
              id,
              first_name,
              last_name,
              student_id,
              school_id,
              program_status,
              speech_screenings (
                created_at,
                school_grades (
                  id,
                  grade_level,
                  academic_year
                )
              )
            )
          )
        `
      )

      // Apply date filter at database level (default to school year)
      if (dateFilter !== 'all') {
        query = query.gte('meeting_date', schoolYearStart.toISOString().split('T')[0])
      }

      const { data, error } = await query
        .eq('school_id', schoolId)
        .order('meeting_date', { ascending: false })

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
    meeting_date: string
    attendees: string[]
    school_id: string
    additional_notes?: string | null
    action_plan?: string | null
    facilitator_id?: string | null
    student_updates?: Array<{
      student_id: string
      sessions_attended?: number | null
      meeting_notes?: string | null
    }>
  }): Promise<MonthlyMeeting> => {
    try {
      // Validate required fields
      if (!data.meeting_date) {
        throw new Error('Missing required fields: meeting_date')
      }

      if (!data.meeting_title) {
        throw new Error('Missing required fields: meeting_title')
      }

      if (!data.attendees || data.attendees.length === 0) {
        throw new Error('At least one attendee is required')
      }

      if (!data.school_id) {
        throw new Error('Missing required fields: school_id')
      }

      // Insert the meeting
      const meetingData = {
        meeting_title: data.meeting_title,
        meeting_date: data.meeting_date,
        attendees: data.attendees,
        school_id: data.school_id,
        additional_notes: data.additional_notes || null,
        action_plan: data.action_plan || null,
        facilitator_id: data.facilitator_id || null,
      }

      const { data: newMeeting, error: meetingError } = await supabase
        .from('monthly_meetings')
        .insert(meetingData)
        .select()
        .single()

      if (meetingError) {
        console.error('Supabase error:', meetingError)
        throw meetingError
      }

      if (!newMeeting) {
        throw new Error('No data returned from insert operation')
      }

      // Insert student updates if provided
      if (data.student_updates && data.student_updates.length > 0) {
        const studentUpdateData = data.student_updates.map(update => ({
          monthly_meeting_id: newMeeting.id,
          student_id: update.student_id,
          sessions_attended: update.sessions_attended || null,
          meeting_notes: update.meeting_notes || null,
        }))

        const { error: updatesError } = await supabase
          .from('monthly_meeting_student_updates')
          .insert(studentUpdateData)

        if (updatesError) {
          console.error('Error inserting student updates:', updatesError)
          throw updatesError
        }
      }

      // Fetch the complete meeting with all relations
      const { data: completeMeeting, error: fetchError } = await supabase
        .from('monthly_meetings')
        .select(
          `
          *,
          facilitator:users!facilitator_id (
            id,
            first_name,
            last_name,
            email
          ),
          monthly_meeting_student_updates (
            id,
            student_id,
            sessions_attended,
            meeting_notes,
            students (
              id,
              first_name,
              last_name,
              student_id,
              school_id,
              program_status,
              speech_screenings (
                created_at,
                school_grades (
                  id,
                  grade_level,
                  academic_year
                )
              )
            )
          )
        `
        )
        .eq('id', newMeeting.id)
        .single()

      if (fetchError) throw fetchError

      return transformMonthlyMeeting(completeMeeting)
    } catch (error) {
      console.error('Error creating monthly meeting:', error)
      throw error
    }
  },

  updateMonthlyMeeting: async (
    id: string,
    data: Partial<{
      meeting_title: string
      meeting_date: string
      attendees: string[]
      school_id: string
      additional_notes: string | null
      action_plan: string | null
      facilitator_id: string | null
      student_updates: Array<{
        student_id: string
        sessions_attended?: number | null
        meeting_notes?: string | null
      }>
    }>
  ): Promise<MonthlyMeeting> => {
    try {
      // Extract student_updates from data
      const { student_updates, ...meetingData } = data

      // Update the meeting itself
      const { data: updatedMeeting, error } = await supabase
        .from('monthly_meetings')
        .update(meetingData)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error

      // Handle student updates if provided
      if (student_updates !== undefined) {
        // Delete existing student updates for this meeting
        const { error: deleteError } = await supabase
          .from('monthly_meeting_student_updates')
          .delete()
          .eq('monthly_meeting_id', id)

        if (deleteError) throw deleteError

        // Insert new student updates if there are any
        if (student_updates.length > 0) {
          const studentUpdateData = student_updates.map(update => ({
            monthly_meeting_id: id,
            student_id: update.student_id,
            sessions_attended: update.sessions_attended || null,
            meeting_notes: update.meeting_notes || null,
          }))

          const { error: insertError } = await supabase
            .from('monthly_meeting_student_updates')
            .insert(studentUpdateData)

          if (insertError) throw insertError
        }
      }

      // Fetch the complete updated meeting with all relations
      const { data: completeMeeting, error: fetchError } = await supabase
        .from('monthly_meetings')
        .select(
          `
          *,
          facilitator:users!facilitator_id (
            id,
            first_name,
            last_name,
            email
          ),
          monthly_meeting_student_updates (
            id,
            student_id,
            sessions_attended,
            meeting_notes,
            students (
              id,
              first_name,
              last_name,
              student_id,
              school_id,
              program_status,
              speech_screenings (
                created_at,
                school_grades (
                  id,
                  grade_level,
                  academic_year
                )
              )
            )
          )
        `
        )
        .eq('id', id)
        .single()

      if (fetchError) throw fetchError

      return transformMonthlyMeeting(completeMeeting)
    } catch (error) {
      console.error('Error updating monthly meeting:', error)
      throw error
    }
  },

  // New methods for managing student updates
  addStudentUpdate: async (data: {
    monthly_meeting_id: string
    student_id: string
    sessions_attended?: number | null
    meeting_notes?: string | null
  }): Promise<StudentUpdate> => {
    try {
      const { data: newUpdate, error } = await supabase
        .from('monthly_meeting_student_updates')
        .insert({
          monthly_meeting_id: data.monthly_meeting_id,
          student_id: data.student_id,
          sessions_attended: data.sessions_attended || null,
          meeting_notes: data.meeting_notes || null,
        })
        .select(
          `
          *,
          students (
            id,
            first_name,
            last_name,
            student_id,
            school_id,
            speech_screenings (
              created_at,
              school_grades (
                id,
                grade_level,
                academic_year
              )
            )
          )
        `
        )
        .single()

      if (error) throw error

      let mostRecentGrade = null

      if (
        newUpdate.students?.speech_screenings &&
        newUpdate.students.speech_screenings.length > 0
      ) {
        const sortedScreenings = [...newUpdate.students.speech_screenings].sort(
          (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        )
        mostRecentGrade = sortedScreenings[0]?.school_grades || null
      }

      return {
        id: newUpdate.id,
        student_id: newUpdate.student_id,
        sessions_attended: newUpdate.sessions_attended,
        meeting_notes: newUpdate.meeting_notes,
        student: newUpdate.students
          ? {
              id: newUpdate.students.id,
              first_name: newUpdate.students.first_name,
              last_name: newUpdate.students.last_name,
              student_id: newUpdate.students.student_id,
              school_id: newUpdate.students.school_id,
              grade: mostRecentGrade,
            }
          : null,
      }
    } catch (error) {
      console.error('Error adding student update:', error)
      throw error
    }
  },

  updateStudentUpdate: async (
    id: string,
    data: Partial<{
      sessions_attended: number | null
      meeting_notes: string | null
    }>
  ): Promise<StudentUpdate> => {
    try {
      const { data: updatedUpdate, error } = await supabase
        .from('monthly_meeting_student_updates')
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
            school_id,
            speech_screenings (
              created_at,
              school_grades (
                id,
                grade_level,
                academic_year
              )
            )
          )
        `
        )
        .single()

      if (error) throw error

      let mostRecentGrade = null

      if (
        updatedUpdate.students?.speech_screenings &&
        updatedUpdate.students.speech_screenings.length > 0
      ) {
        const sortedScreenings = [...updatedUpdate.students.speech_screenings].sort(
          (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        )
        mostRecentGrade = sortedScreenings[0]?.school_grades || null
      }

      return {
        id: updatedUpdate.id,
        student_id: updatedUpdate.student_id,
        sessions_attended: updatedUpdate.sessions_attended,
        meeting_notes: updatedUpdate.meeting_notes,
        student: updatedUpdate.students
          ? {
              id: updatedUpdate.students.id,
              first_name: updatedUpdate.students.first_name,
              last_name: updatedUpdate.students.last_name,
              student_id: updatedUpdate.students.student_id,
              school_id: updatedUpdate.students.school_id,
              grade: mostRecentGrade,
            }
          : null,
      }
    } catch (error) {
      console.error('Error updating student update:', error)
      throw error
    }
  },

  deleteStudentUpdate: async (id: string): Promise<void> => {
    try {
      const { error } = await supabase.from('monthly_meeting_student_updates').delete().eq('id', id)

      if (error) throw error
    } catch (error) {
      console.error('Error deleting student update:', error)
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
