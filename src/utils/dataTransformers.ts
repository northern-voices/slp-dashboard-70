
import { format, parseISO } from 'date-fns';
import type { Database } from '@/integrations/supabase/types';

type Student = Database['public']['Tables']['students']['Row'];
type Screening = Database['public']['Tables']['screenings']['Row'];

export const transformStudentData = (student: Student) => {
  return {
    ...student,
    fullName: `${student.first_name} ${student.last_name}`,
    age: calculateAge(student.date_of_birth),
  };
};

export const transformScreeningData = (screening: Screening) => {
  return {
    ...screening,
    formattedDate: format(parseISO(screening.screening_date), 'MMM dd, yyyy'),
    statusDisplay: screening.status.replace('_', ' ').toUpperCase(),
  };
};

const calculateAge = (dateOfBirth: string): number => {
  const today = new Date();
  const birthDate = new Date(dateOfBirth);
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  
  return age;
};
