import { ErrorPatterns } from './screening-form'

export interface Organization {
  id: string
  name: string
  slug: string
  address: string
  city: string
  state: string
  zip: string
  phone: string
  created_at: string
  updated_at: string
}

export interface UserProfile {
  id: string
  first_name: string
  last_name: string
  email: string
  role: 'admin' | 'slp' | 'supervisor'
  school_id: string
  organization_id?: string
  created_at: string
  updated_at: string
}

export interface SLPProfile {
  id: string
  user_id: string
  organization_id: string
  first_name: string
  last_name: string
  email: string
  role: 'admin' | 'slp' | 'supervisor'
  license_number?: string
  phone?: string
  specializations?: string[]
  active: boolean
  created_at: string
  updated_at: string
  organization?: Organization
}

export interface Student {
  id: string
  first_name: string
  last_name: string
  student_id: string
  school_id?: string
  grade?: string
  date_of_birth?: string
  qualifies_for_program?: boolean
  current_grade_id?: string | null
  created_at: string
  updated_at: string
  speech_screenings?: Array<{
    id: string
    grade_id: string
    created_at: string
    error_patterns?: string | ErrorPatterns
    school_grades?: {
      grade_level: string
    }
  }>
  hearing_screenings?: Array<{
    id: string
    grade_id: string
    created_at: string
    school_grades?: {
      grade_level: string
    }
  }>
}

// Updated Screening interface to match database schema
export interface Screening {
  id: string
  student_id: string
  student_name: string
  grade: string
  date: string
  screening_date: string
  screening_type: string
  screener: string
  slp_id: string
  result?: string
  screening_result?: string
  referral_notes?: string
  created_at: string
  updated_at: string
  school_id: string
  school_name?: string
  grade_id: string
  screener_id: string
  academic_year?: string

  // Speech-specific fields
  vocabulary_support?: boolean
  suspected_cas?: boolean
  error_patterns?: ErrorPatterns
  clinical_notes?: string

  // Hearing-specific fields
  right_volume_db?: number | null
  right_pressure?: number | null
  right_compliance?: number | null
  left_volume_db?: number | null
  left_pressure?: number | null
  left_compliance?: number | null

  // Source table information for deletion
  source_table?: 'speech' | 'hearing'
}

export interface School {
  id: string
  organization_id: string
  name: string
  address: string
  city: string
  state: string
  zip: string
  principal_name: string
  principal_email: string
  phone: string
  created_at: string
  updated_at: string
}

export interface Report {
  id: string
  screening_id: string
  title: string
  content: string
  recommendations?: string
  follow_up_required: boolean
  follow_up_date?: string
  status: 'draft' | 'final' | 'reviewed'
  generated_at: string
}
