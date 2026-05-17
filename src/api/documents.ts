import { supabase } from '@/lib/supabase'

export type DocumentType = 'attendance_sheet'

export interface DocumentData {
  file: File
  sheet_date: string
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
  sheet_date: string | null
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

    const safeName = data.file.name.replace(/\s+/g, '_')
    const filePath = `${schoolId}/${type}/${Date.now()}-${safeName}`

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
      sheet_date: data.sheet_date || null,
      uploaded_by: user.id,
    })

    if (insertError) {
      await supabase.storage.from('documents').remove([filePath])
      throw insertError
    }
  },

  getDocuments: async (schoolId: string, type?: DocumentType): Promise<Document[]> => {
    let query = supabase
      .from('documents')
      .select(
        `
      id,
      type,
      school_id,
      file_path,
      file_name,
      file_type,
      file_size,
      additional_notes,
      sheet_date,
      uploaded_at,
      uploaded_by:users!documents_uploaded_by_fkey(
        id,
        first_name,
        last_name
      )
    `
      )
      .eq('school_id', schoolId)
      .order('uploaded_at', { ascending: false })

    if (type) query = query.eq('type', type)

    const { data, error } = await query

    if (error) throw error

    return (data || []) as unknown as Document[]
  },

  getSignedUrl: async (filePath: string): Promise<string> => {
    const { data, error } = await supabase.storage
      .from('documents')
      .createSignedUrl(filePath, 60 * 60)

    if (error) throw error
    if (!data?.signedUrl) throw new Error('No signed URL returned')
    return data.signedUrl
  },

  deleteDocument: async (id: string, filePath: string): Promise<void> => {
    const { error: storageError } = await supabase.storage.from('documents').remove([filePath])
    if (storageError) throw storageError

    const { error: dbError } = await supabase.from('documents').delete().eq('id', id)
    if (dbError) throw dbError
  },
}
