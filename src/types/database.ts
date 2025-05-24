
export interface Organization {
  id: string;
  name: string;
  slug: string;
  created_at: string;
  updated_at: string;
}

export interface School {
  id: string;
  organization_id: string;
  name: string;
  address?: string;
  principal_name?: string;
  principal_email?: string;
  phone?: string;
  created_at: string;
  updated_at: string;
  organization?: Organization;
}

export interface Student {
  id: string;
  school_id: string;
  student_id: string; // External student ID from school system
  first_name: string;
  last_name: string;
  date_of_birth: string;
  grade?: string;
  gender?: 'male' | 'female' | 'other' | 'prefer_not_to_say';
  emergency_contact_name?: string;
  emergency_contact_phone?: string;
  notes?: string;
  active: boolean;
  created_at: string;
  updated_at: string;
  school?: School;
}

export interface Screening {
  id: string;
  student_id: string;
  slp_id: string;
  screening_date: string;
  screening_type: 'initial' | 'follow_up' | 'annual' | 'referral';
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
  notes?: string;
  created_at: string;
  updated_at: string;
  student?: Student;
  reports?: Report[];
}

export interface Report {
  id: string;
  screening_id: string;
  title: string;
  content: string;
  recommendations?: string;
  follow_up_required: boolean;
  follow_up_date?: string;
  generated_at: string;
  status: 'draft' | 'final' | 'reviewed';
  screening?: Screening;
}

export interface SLPProfile {
  id: string;
  user_id: string;
  organization_id: string;
  first_name: string;
  last_name: string;
  email: string;
  license_number?: string;
  role: 'slp' | 'admin' | 'supervisor';
  active: boolean;
  created_at: string;
  updated_at: string;
  organization?: Organization;
}
