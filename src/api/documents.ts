import { supabase } from '@/lib/supabase'

export type DocumentType = 'goal_sheet' | 'initial_speech_report' | 'progress_speech_report'

export interface DocumentFileEntry {
  file: File
  documentType: DocumentType
}

export interface DocumentData {
  document_date?: string
  additional_notes?: string
  files: DocumentFileEntry[]
}

export interface DocumentWithStudent {
  id: string
  document_type: DocumentType
  document_date: string
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

export interface BulkDocumentEntry {
  file: File
  studentId: string
  documentType: DocumentType
  additionalNotes?: string
}

export interface BulkDocumentData {
  document_date?: string
  entries: BulkDocumentEntry[]
}

export const documentsApi = {
  // Upload one or more files for a single student
  uploadDocument: async (studentId: string, data: DocumentData): Promise<void> => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) throw new Error('User not authenticated')

      const uploaded: {
        path: string
        name: string
        type: string
        size: number
        documentType: DocumentType
      }[] = []

      for (let i = 0; i < data.files.length; i++) {
        const entry = data.files[i]
        const filePath = `${studentId}/${Date.now()}-${i}-${entry.file.name}`

        const { error: uploadError } = await supabase.storage
          .from('documents')
          .upload(filePath, entry.file, { contentType: entry.file.type, upsert: false })

        if (uploadError) throw uploadError

        uploaded.push({
          path: filePath,
          name: entry.file.name,
          type: entry.file.type,
          size: entry.file.size,
          documentType: entry.documentType,
        })
      }

      const rows = uploaded.map(file => ({
        student_id: studentId,
        ...(data.document_date ? { document_date: data.document_date } : {}),
        document_type: file.documentType,
        additional_notes: data.additional_notes || null,
        file_path: file.path,
        file_name: file.name,
        file_type: file.type,
        file_size: file.size,
        uploaded_by: user.id,
      }))

      const { error: insertError } = await supabase.from('documents').insert(rows)
      if (insertError) throw insertError
    } catch (error) {
      console.error('Error uploading document:', error)
      throw error
    }
  },

  // Get all documents for a student
  getDocuments: async (studentId: string): Promise<DocumentWithStudent[]> => {
    try {
      const { data, error } = await supabase
        .from('documents')
        .select(
          `
          id,
          document_type,
          document_date,
          additional_notes,
          file_name,
          file_path,
          file_type,
          file_size,
          uploaded_at,
          uploaded_by:users!documents_uploaded_by_fkey(
            id,
            first_name,
            last_name
          )
        `
        )
        .eq('student_id', studentId)
        .order('document_date', { ascending: false })

      if (error) throw error

      return (data || []) as unknown as DocumentWithStudent[]
    } catch (error) {
      console.error('Error fetching documents:', error)
      throw error
    }
  },

  // Upload multiple document files, each assigned to its own student
  uploadDocumentsBulk: async (data: BulkDocumentData): Promise<void> => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) throw new Error('User not authenticated')

      const uploaded: {
        studentId: string
        path: string
        name: string
        type: string
        size: number
        documentType: DocumentType
        additionalNotes?: string
      }[] = []

      for (let i = 0; i < data.entries.length; i++) {
        const entry = data.entries[i]
        const filePath = `${entry.studentId}/${Date.now()}-${i}-${entry.file.name}`

        const { error: uploadError } = await supabase.storage
          .from('documents')
          .upload(filePath, entry.file, { contentType: entry.file.type, upsert: false })

        if (uploadError) throw uploadError

        uploaded.push({
          studentId: entry.studentId,
          path: filePath,
          name: entry.file.name,
          type: entry.file.type,
          size: entry.file.size,
          documentType: entry.documentType,
          additionalNotes: entry.additionalNotes,
        })
      }

      const rows = uploaded.map(file => ({
        student_id: file.studentId,
        ...(data.document_date ? { document_date: data.document_date } : {}),
        document_type: file.documentType,
        additional_notes: file.additionalNotes || null,
        file_path: file.path,
        file_name: file.name,
        file_type: file.type,
        file_size: file.size,
        uploaded_by: user.id,
      }))

      const { error: insertError } = await supabase.from('documents').insert(rows)
      if (insertError) throw insertError
    } catch (error) {
      console.error('Error bulk uploading documents:', error)
      throw error
    }
  },

  // Get all documents for every student in a school
  getDocumentsBySchool: async (schoolId: string): Promise<DocumentWithStudent[]> => {
    try {
      const { data, error } = await supabase
        .from('documents')
        .select(
          `
          id,
          document_type,
          document_date,
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
          uploaded_by:users!documents_uploaded_by_fkey(
            id,
            first_name,
            last_name
          )
        `
        )
        .eq('students.school_id', schoolId)
        .order('document_date', { ascending: false })

      if (error) throw error

      return (data || []) as unknown as DocumentWithStudent[]
    } catch (error) {
      console.error('Error fetching documents for school:', error)
      throw error
    }
  },

  // Generate a signed URL to view a file (expires in 1 hour)
  getSignedUrl: async (filePath: string): Promise<string> => {
    try {
      const { data, error } = await supabase.storage
        .from('documents')
        .createSignedUrl(filePath, 60 * 60)

      if (error) throw error
      if (!data?.signedUrl) throw new Error('No signed URL returned')

      return data.signedUrl
    } catch (error) {
      console.error('Error generating a signed URL:', error)
      throw error
    }
  },

  updateDocumentFileName: async (id: string, fileName: string): Promise<void> => {
    try {
      const { error } = await supabase.from('documents').update({ file_name: fileName }).eq('id', id)

      if (error) throw error
    } catch (error) {
      console.error('Error updating document file name:', error)
      throw error
    }
  },

  // Delete a document (storage + db record)
  deleteDocument: async (id: string, filePath: string | null): Promise<void> => {
    try {
      if (filePath) {
        const { error: storageError } = await supabase.storage.from('documents').remove([filePath])

        if (storageError) throw storageError
      }

      const { error: dbError } = await supabase.from('documents').delete().eq('id', id)

      if (dbError) throw dbError
    } catch (error) {
      console.error('Error deleting document', error)
      throw error
    }
  },
}
