import { supabase } from '@/lib/supabase'
import { string } from 'zod'

export type DocumentType = 'attendance_sheet'

export interface DocumentData {
  file: File
  additional_notes?: string
}

export interface Document {
  id: string
  type: DocumentType
  school_id: string
  file_path: string
  file_name: string
  file_type: string
  file_size: number
  additional_notes: string | null
  uploaded_at: string
  uploaded_by: {
    id: string
    first_name: string
    last_name: string
  } | null
}

export const documentsApi = {
  uploadDocument: async (
    schoolId: string,
    type: DocumentType,
    data: DocumentData
  ): Promise<void> => {
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) throw new Error('User not authenticated')

    const filePath = `${schoolId}/${type}/${Date.now()}-${data.file.name}`

    const { error: uploadError } = await supabase.storage
      .from('documents')
      .upload(filePath, data.file, { contentType: data.file.type, upsert: false })

    if (uploadError) throw uploadError

    const { error: insertError } = await supabase.from('documents').insert({
      type,
      school_id: schoolId,
      file_path: filePath,
      file_name: data.file.name,
      file_type: data.file.type,
      file_size: data.file.size,
      additional_notes: data.additional_notes || null,
      uploaded_by: user.id,
    })

    if (insertError) {
      await supabase.storage.from('documents').remove([filePath])
      throw insertError
    }
  },
}
