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
  files?: File[]
}

export interface ConsentFormWithStudent {
  id: string
  consent_date: string
  consent_purpose: ConsentPurpose
  consent_type: ConsentType
  verbal_consent_details: string | null
  parent_guardian: string | null
  additional_notes: string | null
  file_name: string | null
  file_path: string | null
  file_type: string | null
  file_size: number | null
  uploaded_at: string
  student: {
    id: string
    first_name: string
    last_name: string
  } | null
  uploaded_by: {
    id: string
    first_name: string
    last_name: string
  } | null
}

export const consentFormsApi = {
  // Upload a single file to storage and insert a record
  uploadConsentForm: async (studentId: string, formData: ConsentFormData): Promise<void> => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) throw new Error('User not authenticated')

      const files = formData.files ?? []

      if (files.length === 0) {
        const { error } = await supabase.from('consent_forms').insert({
          student_id: studentId,
          consent_date: formData.consent_date,
          consent_purpose: formData.consent_purpose,
          consent_type: formData.consent_type,
          verbal_consent_details: formData.verbal_consent_details || null,
          parent_guardian: formData.parent_guardian || null,
          additional_notes: formData.additional_notes || null,
          file_path: null,
          file_name: null,
          file_type: null,
          file_size: null,
          uploaded_by: user.id,
        })

        if (error) throw error
        return
      }

      const uploaded: { path: string; name: string; type: string; size: number }[] = []

      for (let i = 0; i < files.length; i++) {
        const file = files[i]
        const filePath = `${studentId}/${Date.now()}-${i}-${file.name}`

        const { error: uploadError } = await supabase.storage
          .from('consent-forms')
          .upload(filePath, file, { contentType: file.type, upsert: false })

        if (uploadError) throw uploadError

        uploaded.push({ path: filePath, name: file.name, type: file.type, size: file.size })
      }

      const rows = uploaded.map(file => ({
        student_id: studentId,
        consent_date: formData.consent_date,
        consent_purpose: formData.consent_purpose,
        consent_type: formData.consent_type,
        verbal_consent_details: formData.verbal_consent_details || null,
        parent_guardian: formData.parent_guardian || null,
        additional_notes: formData.additional_notes || null,
        file_path: file.path,
        file_name: file.name,
        file_type: file.type,
        file_size: file.size,
        uploaded_by: user.id,
      }))

      const { error: insertError } = await supabase.from('consent_forms').insert(rows)
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

  // Get all consent forms for every student in a school
  getConsentFormsBySchool: async (schoolId: string): Promise<ConsentFormWithStudent[]> => {
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
          student:students!inner(
            id,
            first_name,
            last_name
          ),
          uploaded_by:users!consent_forms_uploaded_by_fkey(
            id,
            first_name,
            last_name
          )
        `
        )
        .eq('students.school_id', schoolId)
        .order('consent_date', { ascending: false })

      if (error) throw error

      return (data || []) as unknown as ConsentFormWithStudent[]
    } catch (error) {
      console.error('Error fetching consent forms for school:', error)
      throw error
    }
  },

  getConsentFormPresenceByStudentIds: async (
    studentIds: string[]
  ): Promise<{ student_id: string; consent_purpose: string; consent_date: string }[]> => {
    if (studentIds.length === 0) return []
    try {
      const { data, error } = await supabase
        .from('consent_forms')
        .select('student_id, consent_purpose, consent_date')
        .in('student_id', studentIds)

      if (error) throw error

      return data || []
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
