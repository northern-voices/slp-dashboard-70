import { supabase } from '@/lib/supabase'

export const edgeFunctionsApi = {
  /**
   * Triggers the student progress report edge function
   * @param speechScreeningId - The ID of the speech screening
   * @param overrideEmail - Optional email override for the report
   * @returns Promise with the result data or error
   */
  async studentProgressReport(speechScreeningId: string, overrideEmail: string) {
    try {
      const { data, error } = await supabase.functions.invoke('student-progress-report', {
        body: {
          speech_screening_id: speechScreeningId,
          override_email: overrideEmail,
        },
      })

      if (error) {
        console.error('Error:', error)
        throw error
      }

      console.log('Success', data) // TODO: Temporary remove this
      return data
    } catch (error) {
      console.error('Failed to send student progress report:', error)
      throw error
    }
  },

  async sendStudentReport(speechScreeningId: string, overrideEmail: string) {
    try {
      const { data, error } = await supabase.functions.invoke('send-student-report', {
        body: {
          speech_screening_id: speechScreeningId,
          override_email: overrideEmail,
        },
      })

      if (error) {
        console.error('Error:', error)
        throw error
      }

      return data
    } catch (error) {
      console.error('Failed to generate student report:', error)
      throw error
    }
  },

  async studentGoalSheet(speechScreeningId: string, overrideEmail: string) {
    try {
      const { data, error } = await supabase.functions.invoke('student-goal-sheet', {
        body: {
          speech_screening_id: speechScreeningId,
          override_email: overrideEmail,
        },
      })

      if (error) {
        console.error('Error:', error)
        throw error
      }

      return data
    } catch (error) {
      console.error('Failed to generate student goal sheet:', error)
      throw error
    }
  },

  async schoolWideStudentProgressReport(
    schoolId: string,
    academicYear: string,
    overrideEmail: string
  ) {
    try {
      const { data, error } = await supabase.functions.invoke(
        'school-wide-student-progress-report',
        {
          body: {
            school_id: schoolId,
            academic_year: academicYear,
            override_email: overrideEmail,
          },
        }
      )

      if (error) {
        console.error('Error:', error)
        throw error
      }

      return data
    } catch (error) {
      console.error('Failed to generate school wide student progress report:', error)
      throw error
    }
  },

  async schoolWideStudentGoalSheets(schoolId: string, academicYear: string, overrideEmail: string) {
    try {
      const { data, error } = await supabase.functions.invoke('school-wide-student-goal-sheets', {
        body: {
          school_id: schoolId,
          academic_year: academicYear,
          override_email: overrideEmail,
        },
      })

      if (error) {
        console.error('Error', error)
        throw error
      }

      return data
    } catch (error) {
      console.error('Failed to generate school wide student goal sheet:', error)
      throw error
    }
  },

  async schoolWideSendStudentReports(
    schoolId: string,
    academicYear: string,
    overrideEmail: string
  ) {
    try {
      const { data, error } = await supabase.functions.invoke('school-wide-send-student-report', {
        body: {
          school_id: schoolId,
          academic_year: academicYear,
          override_email: overrideEmail,
        },
      })

      if (error) {
        console.error('Error', error)
        throw error
      }

      return data
    } catch (error) {
      console.error('Failed to send school wide student reports:', error)
      throw error
    }
  },

  async schoolSummaryReport(schoolId: string, academicYear: string, overrideEmail: string) {
    try {
      const { data, error } = await supabase.functions.invoke('school-summary-report', {
        body: {
          school_id: schoolId,
          academic_year: academicYear,
          override_email: overrideEmail,
        },
      })

      if (error) {
        console.error('Error', error)
        throw error
      }

      return data
    } catch (error) {
      console.error('Failed to send the school summary report:', error)
      throw error
    }
  },

  async monthlyMeetings(monthlyMeetingId: string, overrideEmail: string) {
    try {
      const { data, error } = await supabase.functions.invoke('monthly-meeting', {
        body: {
          monthly_meeting_id: monthlyMeetingId,
          override_email: overrideEmail,
        },
      })

      if (error) {
        console.error('Error', error)
        throw error
      }

      console.log(data, 'data')

      return data
    } catch (error) {
      console.error('Failed to send the school summary report:', error)
      throw error
    }
  },
}
