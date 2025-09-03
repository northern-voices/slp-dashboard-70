import { supabase } from '@/lib/supabase'

export const edgeFunctionsApi = {
  /**
   * Triggers the student progress report edge function
   * @param speechScreeningId - The ID of the speech screening
   * @param overrideEmail - Optional email override for the report
   * @returns Promise with the result data or error
   */
  async triggerStudentProgressReport(speechScreeningId: string, overrideEmail?: string) {
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
      } else {
        console.log('Success:', data)
        return data
      }
    } catch (error) {
      console.error('Failed to trigger student progress report:', error)
      throw error
    }
  },
}
