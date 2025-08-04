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
  school_id: string
  qualifies_for_program?: boolean
  created_at: string
  updated_at: string
}

// Updated Screening interface to match database schema
export interface Screening {
  id: string
  student_id: string
  student_name: string
  grade: string
  type: 'speech' | 'hearing'
  status: 'completed' | 'in_progress' | 'scheduled' | 'cancelled'
  date: string
  screening_date: string
  screening_type: string
  screener: string
  slp_id: string
  results: string
  result?: 'P' | 'M' | 'Q' | 'NR' | 'NC' | 'C'
  screening_result?: 'P' | 'M' | 'Q' | 'NR' | 'NC' | 'C'
  notes: string
  referral_notes?: string
  created_at: string
  updated_at: string
  school_id: string
  grade_id: string
  screener_id: string

  // Speech-specific fields
  vocabulary_support?: boolean
  suspected_cas?: boolean

  // Hearing-specific fields
  right_volume_db?: number | null
  right_pressure?: number | null
  right_compliance?: number | null
  left_volume_db?: number | null
  left_pressure?: number | null
  left_compliance?: number | null
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
