import { supabase } from '@/lib/supabase'
import { Screening } from '@/types/database'

export interface SpeechScreenings {
  id: string
}

interface RawScreening {
  id: string
  student_id: string
  type: string
  status: string
  notes: string | null
  screening_result: string | null
  slp_id: string | null
  created_at: string
  updated_at: string
  students: {
    id: string
    first_name: string
    last_name: string
    school_id: string
  } | null
}

export const speechScreeningsApi = {
  getScreeningsList: async (): Promise<Screening[]> => {
    const { data, error } = await supabase
      .from('speech_screenings')
      .select(
        `
        *,
        students (
          id,
          first_name,
          last_name,
          school_id
        )
      `
      )
      .order('created_at', { ascending: false })

    if (error) {
      throw error
    }

    // Transform the data to match the Screening interface
    const transformedData: Screening[] = (data || []).map((screening: RawScreening) => ({
      id: screening.id,
      student_id: screening.student_id,
      student_name: screening.students
        ? `${screening.students.first_name} ${screening.students.last_name}`
        : '',
      grade: '', // Grade not available in current schema
      type: 'speech' as const, // All records from speech_screenings are speech type
      status: 'completed' as const, // Default status since it's not in the schema
      date: screening.created_at?.split('T')[0] || '',
      screening_date: screening.created_at?.split('T')[0] || '',
      screening_type: 'initial', // Default value, adjust based on your data
      screener: 'Dr. Sarah Johnson', // This should come from the user profile
      slp_id: screening.slp_id || '',
      results: screening.notes || '',
      result: (screening.screening_result as 'P' | 'M' | 'Q' | 'NR' | 'NC' | 'C') || 'P',
      screening_result: (screening.screening_result as 'P' | 'M' | 'Q' | 'NR' | 'NC' | 'C') || 'P',
      notes: screening.notes || '',
      created_at: screening.created_at,
      updated_at: screening.updated_at,
      school_id: screening.students?.school_id || '',
    }))

    return transformedData
  },

  getSpeechScreeningsList: async (): Promise<Screening[]> => {
    const { data, error } = await supabase
      .from('speech_screenings')
      .select(
        `
        *,
        students (
          id,
          first_name,
          last_name,
          school_id
        )
      `
      )
      .order('created_at', { ascending: false })

    if (error) {
      throw error
    }

    // Transform the data to match the Screening interface
    const transformedData: Screening[] = (data || []).map((screening: RawScreening) => ({
      id: screening.id,
      student_id: screening.student_id,
      student_name: screening.students
        ? `${screening.students.first_name} ${screening.students.last_name}`
        : '',
      grade: '', // Grade not available in current schema
      type: 'speech' as const, // All records from speech_screenings are speech type
      status: 'completed' as const, // Default status since it's not in the schema
      date: screening.created_at?.split('T')[0] || '',
      screening_date: screening.created_at?.split('T')[0] || '',
      screening_type: 'initial', // Default value, adjust based on your data
      screener: 'Dr. Sarah Johnson', // This should come from the user profile
      slp_id: screening.slp_id || '',
      results: screening.notes || '',
      result: (screening.screening_result as 'P' | 'M' | 'Q' | 'NR' | 'NC' | 'C') || 'P',
      screening_result: (screening.screening_result as 'P' | 'M' | 'Q' | 'NR' | 'NC' | 'C') || 'P',
      notes: screening.notes || '',
      created_at: screening.created_at,
      updated_at: screening.updated_at,
      school_id: screening.students?.school_id || '',
    }))

    return transformedData
  },
}
