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
}
