
import { z } from 'zod';
import type { Database } from '@/integrations/supabase/types';

type Student = Database['public']['Tables']['students']['Row'];

export const validateStudentData = (student: Partial<Student>): boolean => {
  const studentSchema = z.object({
    first_name: z.string().min(1, 'First name is required'),
    last_name: z.string().min(1, 'Last name is required'),
    date_of_birth: z.string().min(1, 'Date of birth is required'),
    student_id: z.string().min(1, 'Student ID is required'),
    school_id: z.string().min(1, 'School ID is required'),
  });

  try {
    studentSchema.parse(student);
    return true;
  } catch {
    return false;
  }
};

export const validateScreeningData = (screening: any): boolean => {
  const screeningSchema = z.object({
    student_id: z.string().uuid(),
    slp_id: z.string().uuid(),
    screening_date: z.string(),
    screening_type: z.enum(['initial', 'follow_up', 'annual', 'referral']),
    status: z.enum(['scheduled', 'in_progress', 'completed', 'cancelled']).optional(),
  });

  try {
    screeningSchema.parse(screening);
    return true;
  } catch {
    return false;
  }
};
