import { useQuery } from '@tanstack/react-query'
import { studentsApi } from '@/api/students'
import { useOrganization } from '@/contexts/OrganizationContext'

export const useStudents = () => {
  const { currentOrganization } = useOrganization()

  return useQuery({
    queryKey: ['students', currentOrganization?.id],
    queryFn: () => studentsApi.getStudents(currentOrganization?.id),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 15 * 60 * 1000, // 15 minutes
    enabled: !!currentOrganization?.id,
  })
}

export const useStudentsByGrade = (gradeLevel: string) => {
  const { currentSchool } = useOrganization()

  return useQuery({
    queryKey: ['students', 'by-grade', gradeLevel, currentSchool?.id],
    queryFn: () => studentsApi.getStudentsByGrade(gradeLevel, currentSchool?.id),
    staleTime: 5 * 60 * 1000,
    gcTime: 15 * 60 * 1000,
    enabled: !!gradeLevel && !!currentSchool?.id,
  })
}

export const useStudent = (studentId?: string) => {
  return useQuery({
    queryKey: ['students', studentId],
    queryFn: () => studentsApi.getStudent(studentId!),
    staleTime: 10 * 60 * 1000,
    gcTime: 20 * 60 * 1000,
    enabled: !!studentId,
  })
}

export const useStudentsBySchool = (schoolId?: string) => {
  return useQuery({
    queryKey: ['students', 'by-school', schoolId],
    queryFn: () => studentsApi.getStudentsBySchool(schoolId!),
    staleTime: 5 * 60 * 1000,
    gcTime: 15 * 60 * 1000,
    enabled: !!schoolId,
  })
}

export const useStudentCountBySchool = (schoolId?: string) => {
  return useQuery({
    queryKey: ['students', 'count', schoolId],
    queryFn: async () => {
      const students = await studentsApi.getStudentsBySchool(schoolId!)
      return students.length
    },
    staleTime: 5 * 60 * 1000,
    gcTime: 15 * 60 * 1000,
    enabled: !!schoolId,
  })
}
