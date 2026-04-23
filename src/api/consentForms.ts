import { supabase } from '@/lib/supabase'

export type ConsentPurpose = 'screening_assessment' | 'therapy'
export type ConsentType = 'verbal' | 'written'

export interface ConsentFormData {
  consent_date: string
  consent_purpose: ConsentPurpose
  consent_type: ConsentType
  verbal_consent_details?: string
  parent_guardian?: string
  additional_notes?: string
  file?: File
}

export const consentFormsApi = {
  // Upload a single file to storage and insert a record
  uploadConsentForm: async (studentId: string, formData: ConsentFormData): Promise<void> => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) throw new Error('User not authenticated')

      let filePath: string | null = null
      let fileName: string | null = null
      let fileType: string | null = null
      let fileSize: number | null = null

      // Only upload file for written consent

      if (formData.consent_type === 'written' && formData.file) {
        filePath = `${studentId}/${Date.now()}-${formData.file.name}`

        const { error: uploadError } = await supabase.storage
          .from('consent-forms')
          .upload(filePath, formData.file, {
            contentType: formData.file.type,
            upsert: false,
          })

        if (uploadError) throw uploadError

        fileName = formData.file.name
        fileType = formData.file.type
        fileSize = formData.file.size
      }

      const { error: insertError } = await supabase.from('consent_forms').insert({
        student_id: studentId,
        consent_date: formData.consent_date,
        consent_purpose: formData.consent_purpose,
        consent_type: formData.consent_type,
        verbal_consent_details: formData.verbal_consent_details || null,
        parent_guardian: formData.parent_guardian || null,
        additional_notes: formData.additional_notes || null,
        file_path: filePath,
        file_name: fileName,
        file_type: fileType,
        file_size: fileSize,
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
          consent_date,
          consent_purpose,
          consent_type,
          verbal_consent_details,
          parent_guardian,
          additional_notes,
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
        .order('consent_date', { ascending: false })

      if (error) throw error

      return data || []
    } catch (error) {
      console.error('Error fetching consent forms:', error)
      throw error
    }
  },

  getConsentFormPresenceByStudentIds: async (studentIds: string[]): Promise<string[]> => {
    if (studentIds.length === 0) return []
    try {
      const { data, error } = await supabase
        .from('consent_forms')
        .select('student_id')
        .in('student_id', studentIds)

      if (error) throw error

      const unique = [...new Set((data || []).map(r => r.student_id))]

      return unique
    } catch (error) {
      console.error('Error fetching consent form presence:', error)
      throw error
    }
  },

  // Generate a signed URL to view a file (expires in 1 hour)
  getSignedUrl: async (filePath: string): Promise<string> => {
    try {
      const { data, error } = await supabase.storage
        .from('consent-forms')
        .createSignedUrl(filePath, 60 * 60)

      if (error) throw error
      if (!data?.signedUrl) throw new Error('No signed URL returned')

      return data.signedUrl
    } catch (error) {
      console.error('Error generating a signed URL:', error)
      throw error
    }
  },

  // Delete a consent form (storage + db record)
  deleteConsentForm: async (id: string, filePath: string | null): Promise<void> => {
    try {
      if (filePath) {
        const { error: storageError } = await supabase.storage
          .from('consent-forms')
          .remove([filePath])

        if (storageError) throw storageError
      }

      const { error: dbError } = await supabase.from('consent_forms').delete().eq('id', id)

      if (dbError) throw dbError
    } catch (error) {
      console.error('Error deleting consent form', error)
      throw error
    }
  },
}
