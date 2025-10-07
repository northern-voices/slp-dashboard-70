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
    }) => {
      const createData: {
        first_name: string
        last_name: string
        student_id: string
        qualifies_for_program?: boolean
        school_id?: string
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
