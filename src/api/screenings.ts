import { supabase } from '@/lib/supabase'

export interface SpeechScreenings {
  id: string
}

export const screeningsApi = {
  getSpeechScreeningsList: async (): Promise<SpeechScreenings[]> => {
    const { data, error } = await supabase.from('speech_screenings').select('*')

    if (error) {
      throw error
    }

    return data || []
  },
}
