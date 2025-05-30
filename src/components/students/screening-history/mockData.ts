
import { Screening } from '@/types/database';

export const mockScreenings: Screening[] = [
  {
    id: '1',
    student_id: '1',
    slp_id: 'slp1',
    screening_date: '2024-01-20',
    screening_type: 'initial',
    status: 'completed',
    notes: 'Initial speech screening - identified articulation concerns',
    created_at: '2024-01-20T10:00:00Z',
    updated_at: '2024-01-20T10:00:00Z',
  },
  {
    id: '2',
    student_id: '1',
    slp_id: 'slp1',
    screening_date: '2023-11-15',
    screening_type: 'follow_up',
    status: 'completed',
    notes: 'Follow-up screening - significant improvement in /r/ sound production',
    created_at: '2023-11-15T10:00:00Z',
    updated_at: '2023-11-15T10:00:00Z',
  },
  {
    id: '3',
    student_id: '1',
    slp_id: 'slp1',
    screening_date: '2023-08-10',
    screening_type: 'annual',
    status: 'completed',
    notes: 'Annual screening - continued speech therapy recommended',
    created_at: '2023-08-10T10:00:00Z',
    updated_at: '2023-08-10T10:00:00Z',
  },
  {
    id: '4',
    student_id: '1',
    slp_id: 'slp1',
    screening_date: '2023-03-22',
    screening_type: 'referral',
    status: 'completed',
    notes: 'Teacher referral for speech evaluation',
    created_at: '2023-03-22T10:00:00Z',
    updated_at: '2023-03-22T10:00:00Z',
  },
];
