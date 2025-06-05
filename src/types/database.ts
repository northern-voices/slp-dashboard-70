export interface School {
  id: string;
  name: string;
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
  created_at: string;
  updated_at: string;
}

export interface Student {
  id: string;
  first_name: string;
  last_name: string;
  dob: string;
  grade: string;
  school_id: string;
  created_at: string;
  updated_at: string;
}

export interface Screening {
  id: string;
  student_id: string;
  type: 'speech' | 'hearing' | 'progress';
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
  date: string;
  screener: string;
  results?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
  screening_result?: 'P' | 'M' | 'Q' | 'NR' | 'NC' | 'C';
}
