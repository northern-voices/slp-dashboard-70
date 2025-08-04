import { Student } from '@/types/database'
import { studentsApi } from '@/api/students'

const getStudents = async (): Promise<Student[]> => {
  return studentsApi.getStudents()
}

const getStudentById = async (id: string): Promise<Student | null> => {
  return studentsApi.getStudent(id)
}

const createStudent = async (
  studentData: Omit<Student, 'id' | 'created_at' | 'updated_at'>
): Promise<Student> => {
  return studentsApi.createStudent({
    first_name: studentData.first_name,
    last_name: studentData.last_name,
    student_id: studentData.student_id,
    school_id: studentData.school_id,
    qualifies_for_program: studentData.qualifies_for_program,
  })
}

const updateStudent = async (id: string, studentData: Partial<Student>): Promise<Student> => {
  return studentsApi.updateStudent(id, studentData)
}

const deleteStudent = async (id: string): Promise<void> => {
  return studentsApi.deleteStudent(id)
}

// Export as StudentService object to match the import pattern in the pages
export const StudentService = {
  getStudents,
  getStudentById,
  createStudent,
  updateStudent,
  deleteStudent,
}

// Also export individual functions for backward compatibility
export { getStudents, getStudentById, createStudent, updateStudent, deleteStudent }
