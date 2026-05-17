import { supabase } from '@/lib/supabase'

export type ProvisionStatus = 'uploaded' | 'not_provided'

export interface AttendanceSheetData {
  provision_status: ProvisionStatus
  sheet_date: string
  file?: File
  additional_notes?: string
}

export interface AttendanceSheet {
  id: string
  school_id: string
  provision_status: ProvisionStatus
  file_path: string | null
  file_name: string | null
  file_type: string | null
  file_size: number | null
  sheet_date: string | null
  additional_notes: string | null
  uploaded_at: string
  uploaded_by: {
    id: string
    first_name: string
    last_name: string
  } | null
}

export const attendanceSheetsApi = {
  uploadAttendanceSheet: async (schoolId: string, data: AttendanceSheetData): Promise<void> => {
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) throw new Error('User not authenticated')

    let filePath: string | null = null
    let fileName: string | null = null
    let fileType: string | null = null
    let fileSize: number | null = null

    if (data.provision_status === 'uploaded' && data.file) {
      const safeName = data.file.name.replace(/\s+/g, '_')
      filePath = `${schoolId}/${Date.now()}-${safeName}`

      const { error: uploadError } = await supabase.storage
        .from('attendance-sheets')
        .upload(filePath, data.file, { contentType: data.file.type, upsert: false })

      if (uploadError) throw uploadError

      fileName = data.file.name
      fileType = data.file.type
      fileSize = data.file.size
    }

    const { error: insertError } = await supabase.from('attendance_sheets').insert({
      school_id: schoolId,
      provision_status: data.provision_status,
      file_path: filePath,
      file_name: fileName,
      file_type: fileType,
      file_size: fileSize,
      sheet_date: data.sheet_date || null,
      additional_notes: data.additional_notes || null,
      uploaded_by: user.id,
    })

    if (insertError) {
      if (filePath) await supabase.storage.from('attendance-sheets').remove([filePath])
      throw insertError
    }
  },

  getAttendanceSheets: async (schoolId: string): Promise<AttendanceSheet[]> => {
    const { data, error } = await supabase
      .from('attendance_sheets')
      .select(
        `
          id,
          school_id,
          provision_status,
          file_path,
          file_name,
          file_type,
          file_size,
          sheet_date,
          additional_notes,
          uploaded_at,
          uploaded_by:users!attendance_sheets_uploaded_by_fkey(
            id,
            first_name,
            last_name
          )
        `
      )
      .eq('school_id', schoolId)
      .order('sheet_date', { ascending: false, nullsFirst: false })

    if (error) throw error
    return (data || []) as unknown as AttendanceSheet[]
  },

  getSignedUrl: async (filePath: string): Promise<string> => {
    const { data, error } = await supabase.storage
      .from('attendance-sheets')
      .createSignedUrl(filePath, 60 * 60)

    if (error) throw error
    if (!data?.signedUrl) throw new Error('No signed URL returned')
    return data.signedUrl
  },

  deleteAttendanceSheet: async (id: string, filePath: string | null): Promise<void> => {
    if (filePath) {
      const { error: storageError } = await supabase.storage
        .from('attendance-sheets')
        .remove([filePath])
      if (storageError) throw storageError
    }

    const { error: dbError } = await supabase.from('attendance_sheets').delete().eq('id', id)
    if (dbError) throw dbError
  },
}
