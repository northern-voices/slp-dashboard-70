
import { Database } from '@/types/supabase';
import { supabaseService } from './supabaseService';

type Student = Database['public']['Tables']['students']['Row'];
type StudentInsert = Database['public']['Tables']['students']['Insert'];

export class StudentService {
  static async getStudents(): Promise<Student[]> {
    try {
      const { data, error } = await supabaseService.getClient()
        .from('students')
        .select('*')
        .eq('active', true)
        .order('last_name', { ascending: true });

      if (error) {
        console.error('Error fetching students:', error);
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('Error in getStudents:', error);
      throw error;
    }
  }

  static async createStudent(studentData: {
    first_name: string;
    last_name: string;
    date_of_birth: string;
    student_id: string;
    grade?: string;
    gender?: 'male' | 'female' | 'other' | 'prefer_not_to_say';
    emergency_contact_name?: string;
    emergency_contact_phone?: string;
    notes?: string;
  }): Promise<Student> {
    try {
      const insertData: StudentInsert = {
        first_name: studentData.first_name,
        last_name: studentData.last_name,
        date_of_birth: studentData.date_of_birth,
        student_id: studentData.student_id,
        grade: studentData.grade || null,
        gender: studentData.gender || null,
        emergency_contact_name: studentData.emergency_contact_name || null,
        emergency_contact_phone: studentData.emergency_contact_phone || null,
        notes: studentData.notes || null,
        active: true
      };

      const { data, error } = await supabaseService.getClient()
        .from('students')
        .insert(insertData)
        .select()
        .single();

      if (error) {
        console.error('Error creating student:', error);
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Error in createStudent:', error);
      throw error;
    }
  }

  static async updateStudent(id: string, updates: Partial<StudentInsert>): Promise<Student> {
    try {
      const { data, error } = await supabaseService.getClient()
        .from('students')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Error updating student:', error);
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Error in updateStudent:', error);
      throw error;
    }
  }

  static async deleteStudent(id: string): Promise<void> {
    try {
      const { error } = await supabaseService.getClient()
        .from('students')
        .update({ active: false })
        .eq('id', id);

      if (error) {
        console.error('Error deleting student:', error);
        throw error;
      }
    } catch (error) {
      console.error('Error in deleteStudent:', error);
      throw error;
    }
  }

  static async getStudentById(id: string): Promise<Student | null> {
    try {
      const { data, error } = await supabaseService.getClient()
        .from('students')
        .select('*')
        .eq('id', id)
        .eq('active', true)
        .single();

      if (error) {
        console.error('Error fetching student:', error);
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Error in getStudentById:', error);
      throw error;
    }
  }
}
