export interface ScreeningFormData {
  student_id?: string
  student_info?: {
    first_name: string
    last_name: string
    date_of_birth: string
    grade?: string
    gender?: 'male' | 'female' | 'other' | 'prefer_not_to_say'
    emergency_contact_name?: string
    emergency_contact_phone?: string
  }
  screening_type: 'initial' | 'progress'
  screening_date: string
  form_type: 'speech' | 'hearing' | 'progress'
  selected_grade?: string
  result?: string
  clinical_notes?: string
  referral_notes?: string

  // Speech screening specific fields
  speech_data?: {
    sound_errors: string[]
    articulation_notes: string
    language_concerns: string
    voice_quality: string
    fluency_notes: string
    overall_observations: string
  }

  // Hearing screening specific fields
  hearing_data?: {
    tympanometry_results:
      | {
          right_ear: {
            vol: number | null
            comp: number | null
            press: number | null
          }
          left_ear: {
            vol: number | null
            comp: number | null
            press: number | null
          }
        }
      | string
    observations?: string
  }

  // Progress screening specific fields
  progress_data?: {
    goals_met: string[]
    goals_in_progress: string[]
    new_concerns: string
    recommendations: string
  }

  general_notes: string
  recommendations: string
  follow_up_required: boolean
  follow_up_date?: string
}

export interface ScreeningTemplate {
  id: string
  name: string
  form_type: 'speech' | 'hearing' | 'progress'
  fields: ScreeningFormField[]
  is_global: boolean
}

export interface ScreeningFormField {
  id: string
  label: string
  type: 'text' | 'textarea' | 'select' | 'checkbox' | 'date' | 'number' | 'multiselect'
  required: boolean
  options?: string[]
  placeholder?: string
  validation?: {
    min?: number
    max?: number
    pattern?: string
  }
}
