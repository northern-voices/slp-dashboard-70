
import { Student } from '@/types/database';

// Mock data for demonstration
const mockStudents: Student[] = [
  {
    id: '1',
    first_name: 'Emma',
    last_name: 'Johnson',
    date_of_birth: '2010-05-15',
    grade: '8th',
    gender: 'female' as const,
    student_id: 'STU001',
    emergency_contact_name: 'John Johnson',
    emergency_contact_phone: '(555) 123-4567',
    notes: '',
    active: true,
    school_id: 'school-1',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  },
  {
    id: '2',
    first_name: 'Michael',
    last_name: 'Chen',
    date_of_birth: '2009-08-22',
    grade: '9th',
    gender: 'male' as const,
    student_id: 'STU002',
    emergency_contact_name: 'Lisa Chen',
    emergency_contact_phone: '(555) 987-6543',
    notes: '',
    active: true,
    school_id: 'school-1',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  },
  {
    id: '3',
    first_name: 'Sofia',
    last_name: 'Rodriguez',
    date_of_birth: '2011-03-10',
    grade: '7th',
    gender: 'female' as const,
    student_id: 'STU003',
    emergency_contact_name: 'Maria Rodriguez',
    emergency_contact_phone: '(555) 456-7890',
    notes: 'Mild hearing impairment - uses hearing aids',
    active: true,
    school_id: 'school-1',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  },
  {
    id: '4',
    first_name: 'James',
    last_name: 'Williams',
    date_of_birth: '2008-11-18',
    grade: '10th',
    gender: 'male' as const,
    student_id: 'STU004',
    emergency_contact_name: 'Sarah Williams',
    emergency_contact_phone: '(555) 234-5678',
    notes: '',
    active: true,
    school_id: 'school-1',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  },
  {
    id: '5',
    first_name: 'Ava',
    last_name: 'Brown',
    date_of_birth: '2012-07-25',
    grade: '6th',
    gender: 'female' as const,
    student_id: 'STU005',
    emergency_contact_name: 'David Brown',
    emergency_contact_phone: '(555) 345-6789',
    notes: 'Asthma - inhaler available in nurse office',
    active: true,
    school_id: 'school-1',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  }
];

export class StudentService {
  static async getAllStudents(): Promise<Student[]> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    return mockStudents;
  }

  static async getStudents(): Promise<Student[]> {
    return this.getAllStudents();
  }

  static async getStudentById(id: string): Promise<Student | null> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 300));
    return mockStudents.find(student => student.id === id) || null;
  }

  static async createStudent(studentData: Omit<Student, 'id' | 'created_at' | 'updated_at'>): Promise<Student> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 800));
    
    const newStudent: Student = {
      ...studentData,
      id: `STU${Date.now()}`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    mockStudents.push(newStudent);
    return newStudent;
  }

  static async updateStudent(id: string, updates: Partial<Student>): Promise<Student | null> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 600));
    
    const index = mockStudents.findIndex(student => student.id === id);
    if (index === -1) return null;
    
    mockStudents[index] = {
      ...mockStudents[index],
      ...updates,
      updated_at: new Date().toISOString()
    };
    
    return mockStudents[index];
  }

  static async deleteStudent(id: string): Promise<boolean> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 400));
    
    const index = mockStudents.findIndex(student => student.id === id);
    if (index === -1) return false;
    
    mockStudents.splice(index, 1);
    return true;
  }
}
