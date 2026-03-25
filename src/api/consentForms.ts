import { supabase } from '@/lib/supabase'

export const consentFormsApi = {
  // Upload a single file to storage and insert a record
  uploadConsentForm: async (file: File, studentId: string): Promise<void> => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) throw new Error('User not authenticated')

      const fileExt = file.name.split('.').pop()
      const filePath = `${studentId}/${Date.now()}-${file.name}`

      const { error: uploadError } = await supabase.storage
        .from('consent-forms')
        .upload(filePath, fileExt, {
          contentType: file.type,
          upsert: false,
        })

      if (uploadError) throw uploadError

      const { error: insertError } = await supabase.from('consent_forms').insert({
        student_id: studentId,
        file_name: file.name,
        file_path: filePath,
        file_type: file.type,
        file_size: file.size,
        uploaded_by: user.id,
      })

      if (insertError) throw insertError
    } catch (error) {
      console.error('Error uploading consent form:', error)
      throw error
    }
  },

  // Get all consent forms for a student
  getConsentForms: async (studentId: string) => {
    try {
      const { data, error } = await supabase
        .from('consent_forms')
        .select(
          `
          id,
          file_name,
          file_path,
          file_type,
          file_size,
          uploaded_at,
          uploaded_by:users!consent_forms_uploaded_by_fkey(
            id,
            first_name,
            last_name
          )
        `
        )
        .eq('student_id', studentId)
        .order('uploaded_at', { ascending: false })

      if (error) throw error

      return data || []
    } catch (error) {
      console.error('Error fetching consent forms:', error)
      throw error
    }
  },
}
