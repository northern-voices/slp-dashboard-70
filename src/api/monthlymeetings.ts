import { supabase } from '@/lib/supabase'

export interface MonthlyMeeting {
  id: string
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
  createMonthlyMeeting: async (data: {
    student_id: string
    attendees: string[]
    sessions_attended?: number | null
    meeting_notes?: string | null
    additional_notes?: string | null
    meeting_date: string
  }): Promise<MonthlyMeeting> => {
    try {
      // Validate required fields
      if (!data.student_id || !data.meeting_date) {
        throw new Error('Missing required fields: student_id or meeting_date')
      }

      if (!data.attendees || data.attendees.length === 0) {
        throw new Error('At least one attendee is required')
      }

      const insertData = {
        student_id: data.student_id,
        attendees: data.attendees,
        sessions_attended: data.sessions_attended || null,
        meeting_notes: data.meeting_notes || null,
        additional_notes: data.additional_notes || null,
        meeting_data: data.meeting_date,
      }

      const { data: newMeeting, error } = await supabase
        .from('monthly_meetings')
        .insert(insertData)
        .select(
          `*,
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
        console.error('Supabase error', error)
        throw error
      }

      if (!newMeeting) {
        throw new Error('No data returned from insert operation')
      }

      return transformMonthlyMeeting(newMeeting)
    } catch (error) {
      console.error('Error creating monthly meetings', error)
      throw error
    }
  },
}
