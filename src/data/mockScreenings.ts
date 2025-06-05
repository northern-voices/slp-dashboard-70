
export interface Screening {
  id: string;
  student_id: string;
  student_name: string;
  grade: string;
  type: 'speech' | 'hearing' | 'progress';
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
  date: string;
  screener: string;
  results?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export const mockScreenings: Screening[] = [
  {
    id: '1',
    student_id: 'student1',
    student_name: 'Emma Johnson',
    grade: 'K',
    type: 'speech',
    status: 'completed',
    date: '2024-05-15',
    screener: 'Dr. Sarah Johnson',
    results: 'Within normal limits',
    notes: 'Student showed good articulation skills',
    created_at: '2024-05-15T10:00:00Z',
    updated_at: '2024-05-15T14:30:00Z'
  },
  {
    id: '2',
    student_id: 'student2',
    student_name: 'Liam Smith',
    grade: '1st',
    type: 'hearing',
    status: 'in_progress',
    date: '2024-05-16',
    screener: 'Dr. Mike Wilson',
    notes: 'Initial screening in progress',
    created_at: '2024-05-16T09:00:00Z',
    updated_at: '2024-05-16T09:30:00Z'
  },
  {
    id: '3',
    student_id: 'student3',
    student_name: 'Sophia Davis',
    grade: '2nd',
    type: 'speech',
    status: 'scheduled',
    date: '2024-05-17',
    screener: 'Dr. Sarah Johnson',
    notes: 'Follow-up screening scheduled',
    created_at: '2024-05-17T08:00:00Z',
    updated_at: '2024-05-17T08:00:00Z'
  },
  {
    id: '4',
    student_id: 'student4',
    student_name: 'Noah Brown',
    grade: '3rd',
    type: 'hearing',
    status: 'cancelled',
    date: '2024-05-18',
    screener: 'Dr. Mike Wilson',
    notes: 'Cancelled due to student absence',
    created_at: '2024-05-18T07:00:00Z',
    updated_at: '2024-05-18T11:00:00Z'
  }
];
