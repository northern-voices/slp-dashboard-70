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

export const useSearchStudents = (searchTerm: string) => {
  const { currentSchool } = useOrganization()

  return useQuery({
    queryKey: ['students', 'search', searchTerm, currentSchool?.id],
    queryFn: () => studentsApi.searchStudents(searchTerm, currentSchool?.id),
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    enabled: !!searchTerm && searchTerm.length >= 2 && !!currentSchool?.id,
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
