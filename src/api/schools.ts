import { supabase } from '@/lib/supabase'

export interface SpeechScreenings {
  id: string
}

export const schoolsApi = {
  getSchools: async (): Promise<SpeechScreenings[]> => {
    const { data, error } = await supabase.from('schools').select('*')

    if (error) {
      throw error
    }

    return data || []
  },
}
