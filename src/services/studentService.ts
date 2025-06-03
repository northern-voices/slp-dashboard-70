import { Student } from '@/types/database';

// Comprehensive mock data with students across all grade levels
const mockStudents: Student[] = [
  // Pre-K Students
  {
    id: 'prek-001',
    first_name: 'Sophia',
    last_name: 'Martinez',
    date_of_birth: '2019-04-12',
    grade: 'Pre-K',
    gender: 'female' as const,
    student_id: 'PRE001',
    emergency_contact_name: 'Maria Martinez',
    emergency_contact_phone: '(555) 111-2222',
    notes: 'New to the program',
    active: true,
    school_id: 'school-1',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  },
  {
    id: 'prek-002',
    first_name: 'Liam',
    last_name: 'Thompson',
    date_of_birth: '2019-07-20',
    grade: 'Pre-K',
    gender: 'male' as const,
    student_id: 'PRE002',
    emergency_contact_name: 'Jennifer Thompson',
    emergency_contact_phone: '(555) 222-3333',
    notes: '',
    active: true,
    school_id: 'school-1',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  },

  // Kindergarten Students
  {
    id: 'k-001',
    first_name: 'Emma',
    last_name: 'Johnson',
    date_of_birth: '2018-05-15',
    grade: 'K',
    gender: 'female' as const,
    student_id: 'K001',
    emergency_contact_name: 'John Johnson',
    emergency_contact_phone: '(555) 123-4567',
    notes: 'Excellent student with good communication skills',
    active: true,
    school_id: 'school-1',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  },
  {
    id: 'k-002',
    first_name: 'Noah',
    last_name: 'Davis',
    date_of_birth: '2018-08-30',
    grade: 'K',
    gender: 'male' as const,
    student_id: 'K002',
    emergency_contact_name: 'Ashley Davis',
    emergency_contact_phone: '(555) 333-4444',
    notes: 'Very active and curious',
    active: true,
    school_id: 'school-1',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  },

  // 1st Grade Students
  {
    id: '1st-001',
    first_name: 'Olivia',
    last_name: 'Wilson',
    date_of_birth: '2017-03-22',
    grade: '1st',
    gender: 'female' as const,
    student_id: '1ST001',
    emergency_contact_name: 'Michael Wilson',
    emergency_contact_phone: '(555) 444-5555',
    notes: 'Good progress in reading',
    active: true,
    school_id: 'school-1',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  },
  {
    id: '1st-002',
    first_name: 'Ethan',
    last_name: 'Brown',
    date_of_birth: '2017-11-08',
    grade: '1st',
    gender: 'male' as const,
    student_id: '1ST002',
    emergency_contact_name: 'Sarah Brown',
    emergency_contact_phone: '(555) 555-6666',
    notes: '',
    active: true,
    school_id: 'school-1',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  },

  // 2nd Grade Students
  {
    id: '2nd-001',
    first_name: 'Ava',
    last_name: 'Garcia',
    date_of_birth: '2016-06-14',
    grade: '2nd',
    gender: 'female' as const,
    student_id: '2ND001',
    emergency_contact_name: 'Carlos Garcia',
    emergency_contact_phone: '(555) 666-7777',
    notes: 'Loves mathematics',
    active: true,
    school_id: 'school-1',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  },

  // 3rd Grade Students
  {
    id: '3rd-001',
    first_name: 'Mason',
    last_name: 'Miller',
    date_of_birth: '2015-09-05',
    grade: '3rd',
    gender: 'male' as const,
    student_id: '3RD001',
    emergency_contact_name: 'Amanda Miller',
    emergency_contact_phone: '(555) 777-8888',
    notes: 'Great at science projects',
    active: true,
    school_id: 'school-1',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  },

  // 4th Grade Students
  {
    id: '4th-001',
    first_name: 'Isabella',
    last_name: 'Anderson',
    date_of_birth: '2014-12-18',
    grade: '4th',
    gender: 'female' as const,
    student_id: '4TH001',
    emergency_contact_name: 'Robert Anderson',
    emergency_contact_phone: '(555) 888-9999',
    notes: 'Excellent writer',
    active: true,
    school_id: 'school-1',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  },

  // 5th Grade Students
  {
    id: '5th-001',
    first_name: 'William',
    last_name: 'Taylor',
    date_of_birth: '2013-02-28',
    grade: '5th',
    gender: 'male' as const,
    student_id: '5TH001',
    emergency_contact_name: 'Lisa Taylor',
    emergency_contact_phone: '(555) 999-0000',
    notes: 'Student council member',
    active: true,
    school_id: 'school-1',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  },

  // 6th Grade Students
  {
    id: '6th-001',
    first_name: 'Mia',
    last_name: 'Thomas',
    date_of_birth: '2012-10-10',
    grade: '6th',
    gender: 'female' as const,
    student_id: '6TH001',
    emergency_contact_name: 'David Thomas',
    emergency_contact_phone: '(555) 000-1111',
    notes: 'Band member',
    active: true,
    school_id: 'school-2',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  },

  // 7th Grade Students
  {
    id: '7th-001',
    first_name: 'James',
    last_name: 'Jackson',
    date_of_birth: '2011-01-15',
    grade: '7th',
    gender: 'male' as const,
    student_id: '7TH001',
    emergency_contact_name: 'Michelle Jackson',
    emergency_contact_phone: '(555) 111-2222',
    notes: 'Soccer team captain',
    active: true,
    school_id: 'school-2',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  },

  // 8th Grade Students
  {
    id: '8th-001',
    first_name: 'Charlotte',
    last_name: 'White',
    date_of_birth: '2010-05-25',
    grade: '8th',
    gender: 'female' as const,
    student_id: '8TH001',
    emergency_contact_name: 'Kevin White',
    emergency_contact_phone: '(555) 222-3333',
    notes: 'Honor roll student',
    active: true,
    school_id: 'school-2',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  },

  // 9th Grade Students
  {
    id: '9th-001',
    first_name: 'Benjamin',
    last_name: 'Harris',
    date_of_birth: '2009-08-12',
    grade: '9th',
    gender: 'male' as const,
    student_id: '9TH001',
    emergency_contact_name: 'Nicole Harris',
    emergency_contact_phone: '(555) 333-4444',
    notes: 'Debate team member',
    active: true,
    school_id: 'school-3',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  },

  // 10th Grade Students
  {
    id: '10th-001',
    first_name: 'Amelia',
    last_name: 'Martin',
    date_of_birth: '2008-11-30',
    grade: '10th',
    gender: 'female' as const,
    student_id: '10TH001',
    emergency_contact_name: 'Steven Martin',
    emergency_contact_phone: '(555) 444-5555',
    notes: 'Drama club president',
    active: true,
    school_id: 'school-3',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  },

  // 11th Grade Students
  {
    id: '11th-001',
    first_name: 'Alexander',
    last_name: 'Rodriguez',
    date_of_birth: '2007-04-18',
    grade: '11th',
    gender: 'male' as const,
    student_id: '11TH001',
    emergency_contact_name: 'Carmen Rodriguez',
    emergency_contact_phone: '(555) 555-6666',
    notes: 'AP student',
    active: true,
    school_id: 'school-3',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  },

  // 12th Grade Students
  {
    id: '12th-001',
    first_name: 'Harper',
    last_name: 'Lewis',
    date_of_birth: '2006-09-07',
    grade: '12th',
    gender: 'female' as const,
    student_id: '12TH001',
    emergency_contact_name: 'Patricia Lewis',
    emergency_contact_phone: '(555) 666-7777',
    notes: 'Valedictorian candidate',
    active: true,
    school_id: 'school-3',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  },

  // Legacy data (keeping for backward compatibility)
  {
    id: '1',
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
    id: '2',
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
