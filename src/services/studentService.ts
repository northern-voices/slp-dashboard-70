
import { Database } from '@/types/supabase';

type Student = Database['public']['Tables']['students']['Row'];
type StudentInsert = Database['public']['Tables']['students']['Insert'];

// Mock data for demonstration
const mockStudents: Student[] = [
  {
    id: '1',
    school_id: 'school1',
    first_name: 'John',
    last_name: 'Doe',
    date_of_birth: '2010-05-15',
    student_id: 'STU001',
    grade: '5th Grade',
    gender: 'male',
    emergency_contact_name: 'Jane Doe',
    emergency_contact_phone: '555-0123',
    notes: null,
    active: true,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  }
];

export class StudentService {
  static async getStudents(): Promise<Student[]> {
    try {
      // Return mock data for now
      console.log('Fetching students (mock data)');
      return mockStudents.filter(student => student.active);
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
      const newStudent: Student = {
        id: Math.random().toString(36).substr(2, 9),
        school_id: 'school1', // Default school_id for mock data
        first_name: studentData.first_name,
        last_name: studentData.last_name,
        date_of_birth: studentData.date_of_birth,
        student_id: studentData.student_id,
        grade: studentData.grade || null,
        gender: studentData.gender || null,
        emergency_contact_name: studentData.emergency_contact_name || null,
        emergency_contact_phone: studentData.emergency_contact_phone || null,
        notes: studentData.notes || null,
        active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      mockStudents.push(newStudent);
      console.log('Student created (mock):', newStudent);
      return newStudent;
    } catch (error) {
      console.error('Error in createStudent:', error);
      throw error;
    }
  }

  static async updateStudent(id: string, updates: Partial<StudentInsert>): Promise<Student> {
    try {
      const studentIndex = mockStudents.findIndex(s => s.id === id);
      if (studentIndex === -1) {
        throw new Error('Student not found');
      }

      const updatedStudent = {
        ...mockStudents[studentIndex],
        ...updates,
        updated_at: new Date().toISOString()
      };

      mockStudents[studentIndex] = updatedStudent;
      console.log('Student updated (mock):', updatedStudent);
      return updatedStudent;
    } catch (error) {
      console.error('Error in updateStudent:', error);
      throw error;
    }
  }

  static async deleteStudent(id: string): Promise<void> {
    try {
      const studentIndex = mockStudents.findIndex(s => s.id === id);
      if (studentIndex !== -1) {
        mockStudents[studentIndex].active = false;
        console.log('Student deleted (mock):', id);
      }
    } catch (error) {
      console.error('Error in deleteStudent:', error);
      throw error;
    }
  }

  static async getStudentById(id: string): Promise<Student | null> {
    try {
      const student = mockStudents.find(s => s.id === id && s.active);
      console.log('Student fetched by ID (mock):', student);
      return student || null;
    } catch (error) {
      console.error('Error in getStudentById:', error);
      throw error;
    }
  }
}
