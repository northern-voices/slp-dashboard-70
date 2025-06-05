
export interface School {
  id: string;
  name: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  phone: string;
  principal_name?: string;
  principal_email?: string;
  organization_id?: string;
  created_at: string;
  updated_at: string;
}

export interface Organization {
  id: string;
  name: string;
  slug: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  phone: string;
  created_at: string;
  updated_at: string;
}

export interface UserProfile {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  role: 'admin' | 'slp' | 'supervisor';
  school_id: string;
  organization_id?: string;
  created_at: string;
  updated_at: string;
}

export interface SLPProfile {
  id: string;
  user_id: string;
  organization_id: string;
  first_name: string;
  last_name: string;
  email: string;
  role: 'admin' | 'slp' | 'supervisor';
  license_number?: string;
  specializations?: string[];
  active: boolean;
  created_at: string;
  updated_at: string;
  organization?: Organization;
}

export interface Student {
  id: string;
  first_name: string;
  last_name: string;
  date_of_birth: string;
  grade: string;
  gender?: 'male' | 'female' | 'other' | 'prefer_not_to_say';
  student_id: string;
  emergency_contact_name?: string;
  emergency_contact_phone?: string;
  notes?: string;
  active: boolean;
  school_id: string;
  created_at: string;
  updated_at: string;
}

export interface Screening {
  id: string;
  student_id: string;
  student_name?: string;
  grade?: string;
  type: 'speech' | 'hearing' | 'progress';
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
  date: string;
  screening_date?: string;
  screening_type?: 'initial' | 'follow_up' | 'annual' | 'referral';
  screener: string;
  slp_id?: string;
  results?: string;
  screening_result?: 'P' | 'M' | 'Q' | 'NR' | 'NC' | 'C';
  result?: 'P' | 'M' | 'Q' | 'NR' | 'NC' | 'C';
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface Report {
  id: string;
  screening_id: string;
  title: string;
  content: string;
  recommendations?: string;
  follow_up_required: boolean;
  follow_up_date?: string;
  status: 'draft' | 'final' | 'reviewed';
  generated_at: string;
}
