
import { Student } from '@/types/database';

// Expanded mock data with various ID formats
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
    first_name: 'Sarah',
    last_name: 'Williams',
    date_of_birth: '2011-03-10',
    grade: '7th',
    gender: 'female' as const,
    student_id: 'STU003',
    emergency_contact_name: 'David Williams',
    emergency_contact_phone: '(555) 456-7890',
    notes: '',
    active: true,
    school_id: 'school-1',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  },
  {
    id: 'emma-johnson',
    first_name: 'Emma',
    last_name: 'Johnson',
    date_of_birth: '2010-05-15',
    grade: '8th',
    gender: 'female' as const,
    student_id: 'STU001',
    emergency_contact_name: 'John Johnson',
    emergency_contact_phone: '(555) 123-4567',
    notes: 'Excellent student with good communication skills',
    active: true,
    school_id: 'school-1',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  },
  {
    id: 'STU001',
    first_name: 'Emma',
    last_name: 'Johnson',
    date_of_birth: '2010-05-15',
    grade: '8th',
    gender: 'female' as const,
    student_id: 'STU001',
    emergency_contact_name: 'John Johnson',
    emergency_contact_phone: '(555) 123-4567',
    notes: 'Needs regular hearing checks',
    active: true,
    school_id: 'school-1',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  }
];

const getStudents = async (): Promise<Student[]> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500));
  return mockStudents;
};

const getStudentById = async (id: string): Promise<Student | null> => {
  await new Promise(resolve => setTimeout(resolve, 300));
  return mockStudents.find(student => student.id === id) || null;
};

const createStudent = async (studentData: Omit<Student, 'id' | 'created_at' | 'updated_at'>): Promise<Student> => {
  await new Promise(resolve => setTimeout(resolve, 500));
  
  const newStudent: Student = {
    ...studentData,
    id: Date.now().toString(),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };
  
  mockStudents.push(newStudent);
  return newStudent;
};

const updateStudent = async (id: string, studentData: Partial<Student>): Promise<Student> => {
  await new Promise(resolve => setTimeout(resolve, 500));
  
  const index = mockStudents.findIndex(student => student.id === id);
  if (index === -1) {
    throw new Error('Student not found');
  }
  
  const updatedStudent = {
    ...mockStudents[index],
    ...studentData,
    updated_at: new Date().toISOString()
  };
  
  mockStudents[index] = updatedStudent;
  return updatedStudent;
};

const deleteStudent = async (id: string): Promise<void> => {
  await new Promise(resolve => setTimeout(resolve, 500));
  
  const index = mockStudents.findIndex(student => student.id === id);
  if (index === -1) {
    throw new Error('Student not found');
  }
  
  mockStudents.splice(index, 1);
};

// Export as StudentService object to match the import pattern in the pages
export const StudentService = {
  getStudents,
  getStudentById,
  createStudent,
  updateStudent,
  deleteStudent
};

// Also export individual functions for backward compatibility
export { getStudents, getStudentById, createStudent, updateStudent, deleteStudent };
