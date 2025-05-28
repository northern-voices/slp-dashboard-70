
import { Student } from '@/types/database';
import { apiClient } from './api';

// Mock data service for now - will be replaced with real API calls
const mockStudents: Student[] = [
  {
    id: '1',
    school_id: 'school-1',
    student_id: 'STU001',
    first_name: 'Emma',
    last_name: 'Thompson',
    date_of_birth: '2010-05-15',
    grade: '8th',
    gender: 'female',
    emergency_contact_name: 'Sarah Thompson',
    emergency_contact_phone: '(555) 123-4567',
    active: true,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  },
  {
    id: '2',
    school_id: 'school-1',
    student_id: 'STU002',
    first_name: 'Math',
    last_name: 'Johnson',
    date_of_birth: '2011-03-22',
    grade: '7th',
    gender: 'male',
    emergency_contact_name: 'Mike Johnson',
    emergency_contact_phone: '(555) 987-6543',
    active: true,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  },
];

export const studentService = {
  async getStudents(): Promise<Student[]> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    return mockStudents;
  },

  async getStudent(id: string): Promise<Student | null> {
    await new Promise(resolve => setTimeout(resolve, 300));
    return mockStudents.find(student => student.id === id) || null;
  },

  async createStudent(studentData: Omit<Student, 'id' | 'created_at' | 'updated_at'>): Promise<Student> {
    await new Promise(resolve => setTimeout(resolve, 800));
    const newStudent: Student = {
      ...studentData,
      id: `student-${Date.now()}`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    mockStudents.push(newStudent);
    return newStudent;
  },

  async updateStudent(id: string, updates: Partial<Student>): Promise<Student> {
    await new Promise(resolve => setTimeout(resolve, 600));
    const index = mockStudents.findIndex(student => student.id === id);
    if (index === -1) {
      throw new Error(`Student with id ${id} not found`);
    }
    mockStudents[index] = {
      ...mockStudents[index],
      ...updates,
      updated_at: new Date().toISOString(),
    };
    return mockStudents[index];
  },

  async deleteStudent(id: string): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 400));
    const index = mockStudents.findIndex(student => student.id === id);
    if (index === -1) {
      throw new Error(`Student with id ${id} not found`);
    }
    mockStudents.splice(index, 1);
  },
};
