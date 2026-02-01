import { useMutation, useQueryClient } from '@tanstack/react-query'
import { studentsApi } from '@/api/students'
import { Student } from '@/types/database'

export const useCreateStudent = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (studentData: {
      first_name: string
      last_name: string
      student_id: string
      qualifies_for_program?: boolean
      school_id?: string
      date_of_birth?: string
    }) => {
      const createData: {
        first_name: string
        last_name: string
        student_id: string
        qualifies_for_program?: boolean
        school_id?: string
        date_of_birth?: string
      } = {
        first_name: studentData.first_name,
        last_name: studentData.last_name,
        student_id: studentData.student_id,
        qualifies_for_program: studentData.qualifies_for_program,
      }

      // Only include school_id if it exists
      if (studentData.school_id) {
        createData.school_id = studentData.school_id
      }

      // Only include date_of_birth if it exists
      if (studentData.date_of_birth) {
        createData.date_of_birth = studentData.date_of_birth
      }

      return studentsApi.createStudent(createData)
    },
    onSuccess: () => {
      // Invalidate all student-related queries to refetch fresh data
      queryClient.invalidateQueries({ queryKey: ['students'] })
    },
  })
}

export const useUpdateStudent = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, studentData }: { id: string; studentData: Partial<Student> }) =>
      studentsApi.updateStudent(id, studentData),
    onSuccess: (_, variables) => {
      // Invalidate all student queries
      queryClient.invalidateQueries({ queryKey: ['students'] })
      // Invalidate the specific student query
      queryClient.invalidateQueries({ queryKey: ['students', variables.id] })
      // Invalidate screenings queries to reflect student changes (like program_status)
      queryClient.invalidateQueries({ queryKey: ['screenings'] })
      queryClient.invalidateQueries({ queryKey: ['speech-screenings'] })
    },
  })
}

export const useDeleteStudent = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => studentsApi.deleteStudent(id),
    onSuccess: () => {
      // Invalidate all student-related queries
      queryClient.invalidateQueries({ queryKey: ['students'] })
    },
  })
}

export const useTransferStudent = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (params: {
      studentId: string
      fromSchoolId: string
      toSchoolId: string
      fromGradeId: string | null
      toGradeId: string | null
      transferredBy: string
      transferDate?: string
      reason?: string
    }) => studentsApi.transferStudent(params),
    onSuccess: (_, variables) => {
      // Invalidate student queries
      queryClient.invalidateQueries({ queryKey: ['students'] })
      queryClient.invalidateQueries({ queryKey: ['students', variables.studentId] })
      // Invalidate both old and new school student lists
      queryClient.invalidateQueries({ queryKey: ['students', 'school', variables.fromSchoolId] })
      queryClient.invalidateQueries({ queryKey: ['students', 'school', variables.toSchoolId] })
    },
  })
}

export const useStudentTransferHistory = (studentId: string) => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: () => studentsApi.getStudentTransferHistory(studentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['student-transfers', studentId] })
    },
  })
}
