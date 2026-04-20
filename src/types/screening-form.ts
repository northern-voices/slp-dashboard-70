import { z } from 'zod'

// Dynamic schema factory function
export const createScreeningFormSchema = (isCreatingNewStudent: boolean) => {
  const baseSchema = {
    screening_type: z.enum(['initial', 'progress']),
    screening_date: z.string().min(1, 'Screening date is required'),
    form_type: z.enum(['speech', 'hearing', 'progress']),
    general_notes: z.string(),
    recommendations: z.string(),
    follow_up_required: z.boolean(),
    follow_up_date: z.string().optional(),
  }

  if (isCreatingNewStudent) {
    return z.object({
      ...baseSchema,
      student_id: z.string().optional(),
      student_info: z.object({
        first_name: z.string().min(1, 'First name is required'),
        last_name: z.string().min(1, 'Last name is required'),
        date_of_birth: z.string().min(1, 'Date of birth is required'),
        grade: z.string().optional(),
        gender: z.enum(['male', 'female', 'other', 'prefer_not_to_say']).optional(),
        emergency_contact_name: z.string().optional(),
        emergency_contact_phone: z.string().optional(),
      }),
    })
  } else {
    return z.object({
      ...baseSchema,
      student_id: z.string().min(1, 'Student selection is required'),
      student_info: z
        .object({
          first_name: z.string().optional(),
          last_name: z.string().optional(),
          date_of_birth: z.string().optional(),
          grade: z.string().optional(),
          gender: z.enum(['male', 'female', 'other', 'prefer_not_to_say']).optional(),
          emergency_contact_name: z.string().optional(),
          emergency_contact_phone: z.string().optional(),
        })
        .optional(),
    })
  }
}

export type ScreeningFormSchemaType<T extends boolean> = z.infer<
  ReturnType<typeof createScreeningFormSchema>
>

// Error patterns structure for speech screenings
export interface ErrorPatterns {
  attendance: {
    absent: boolean
    absence_notes: string
    priority_re_screen: boolean
  }
  articulation: {
    soundErrors: Array<{
      notes: string
      otherNotes?: string
      sound: string
      word: string
      errorPatterns: string[]
      stoppingSounds?: string[]
      stimulabilityOptions?: string[]
    }>
    articulationNotes: string
  }
  screening_metadata: {
    screening_date: string
    qualifies_for_speech_program: boolean
    vocabulary_support_recommended: boolean
    sub?: boolean
    graduated?: boolean
    paused?: boolean
    transferred?: boolean
  }
  consent?: {
    no_consent?: boolean
  }
  add_areas_of_concern: {
    voice: string | null
    fluency: string | null
    literacy: string | null
    suspected_cas: string | null
    cleft_lip_palate: boolean | null
    reluctant_speaking: boolean | null
    language_expression: string | null
    language_comprehension: string | null
    known_pending_diagnoses: string | null
    pragmatics_social_communication: string | null
  }
  additional_observations: string
}

export interface SpeechScreeningFormValues {
  screening_type: string
  screening_date: string
  clinical_notes: string
  referral_notes: string
  progress_notes: string
  result: string
  vocabulary_support: boolean
  speech_screen_result: string
  vocabulary_support_recommended: boolean
  qualifies_for_speech_program: boolean
  sub: boolean
  graduated: boolean
  paused?: boolean
  complex_needs?: boolean
  unable_to_screen?: boolean
  error_patterns: ErrorPatterns
  general_articulation_notes?: string
  academic_year: string
  priority_re_screen: boolean
  other_notes: string
  absent: {
    isAbsent: boolean
    notes: string
  }
  no_consent: {
    isNoConsent: boolean
    notes: string
  }
}
