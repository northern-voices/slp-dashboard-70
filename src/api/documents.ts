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
