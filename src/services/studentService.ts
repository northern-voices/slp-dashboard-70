
import { supabaseService } from './supabaseService';
import type { Database } from '@/integrations/supabase/types';

type Student = Database['public']['Tables']['students']['Row'];
type StudentInsert = Database['public']['Tables']['students']['Insert'];

export const studentService = {
  async getStudents(schoolId?: string): Promise<Student[]> {
    return await supabaseService.getStudents(schoolId);
  },

  async getStudent(id: string): Promise<Student | null> {
    const students = await supabaseService.getStudents();
    return students.find(student => student.id === id) || null;
  },

  async createStudent(studentData: Omit<StudentInsert, 'id' | 'created_at' | 'updated_at'>): Promise<Student> {
    const dataWithDefaults: StudentInsert = {
      ...studentData,
      notes: studentData.notes || null
    };
    return await supabaseService.createStudent(dataWithDefaults);
  },

  async updateStudent(id: string, updates: Partial<Student>): Promise<Student> {
    return await supabaseService.updateStudent(id, updates);
  },

  async deleteStudent(id: string): Promise<void> {
    return await supabaseService.deleteStudent(id);
  },
};
