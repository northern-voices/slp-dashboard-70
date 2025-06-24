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
  const { currentOrganization } = useOrganization()

  return useQuery({
    queryKey: ['students', 'search', searchTerm, currentOrganization?.id],
    queryFn: () => studentsApi.searchStudents(searchTerm, currentOrganization?.id),
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    enabled: !!searchTerm && searchTerm.length >= 2 && !!currentOrganization?.id,
  })
}

export const useStudentsByGrade = (gradeLevel: string) => {
  const { currentOrganization } = useOrganization()

  return useQuery({
    queryKey: ['students', 'by-grade', gradeLevel, currentOrganization?.id],
    queryFn: () => studentsApi.getStudentsByGrade(gradeLevel, currentOrganization?.id),
    staleTime: 5 * 60 * 1000,
    gcTime: 15 * 60 * 1000,
    enabled: !!gradeLevel && !!currentOrganization?.id,
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
