
import { supabaseService } from './supabaseService';
import type { Student } from '@/types/database';

export const studentService = {
  async getStudents(schoolId?: string): Promise<Student[]> {
    return await supabaseService.getStudents(schoolId);
  },

  async getStudent(id: string): Promise<Student | null> {
    const students = await supabaseService.getStudents();
    return students.find(student => student.id === id) || null;
  },

  async createStudent(studentData: Omit<Student, 'id' | 'created_at' | 'updated_at'>): Promise<Student> {
    return await supabaseService.createStudent(studentData);
  },

  async updateStudent(id: string, updates: Partial<Student>): Promise<Student> {
    return await supabaseService.updateStudent(id, updates);
  },

  async deleteStudent(id: string): Promise<void> {
    return await supabaseService.deleteStudent(id);
  },
};
