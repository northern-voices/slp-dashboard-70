import { useQuery } from '@tanstack/react-query'
import { studentsApi } from '@/api/students'
import { useOrganization } from '@/contexts/OrganizationContext'
import { Student } from '@/types/database'

const getStudentsCache = (key: string): Student[] => {
  try {
    const cached = localStorage.getItem(key)
    return cached ? JSON.parse(cached) : []
  } catch {
    return []
  }
}

const setStudentsCache = (key: string, students: Student[]) => {
  try {
    localStorage.setItem(key, JSON.stringify(students))
  } catch (error) {
    console.error('Failed to cache students:', error)
  }
}

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
  const cacheKey = `cached_students_grade_${currentSchool?.id}_${gradeLevel}`

  return useQuery({
    queryKey: ['students', 'by-grade', gradeLevel, currentSchool?.id],
    queryFn: async () => {
      const students = await studentsApi.getStudentsByGrade(gradeLevel, currentSchool?.id)
      // Cache for offline use
      setStudentsCache(cacheKey, students)
      return students
    },
    staleTime: 5 * 60 * 1000,
    gcTime: 15 * 60 * 1000,
    enabled: !!gradeLevel && !!currentSchool?.id,
    // Return cached data when offline or while loading
    placeholderData: gradeLevel && currentSchool?.id ? getStudentsCache(cacheKey) : [],
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
  const cacheKey = `cached_students_school_${schoolId}`

  return useQuery({
    queryKey: ['students', 'by-school', schoolId],
    queryFn: async () => {
      const students = await studentsApi.getStudentsBySchool(schoolId!)
      // Cache for offline use
      setStudentsCache(cacheKey, students)
      return students
    },
    staleTime: 5 * 60 * 1000,
    gcTime: 15 * 60 * 1000,
    enabled: !!schoolId,
    // Return cached data when offline or while loading
    placeholderData: schoolId ? getStudentsCache(cacheKey) : [],
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

export const useStudentByStudentId = (studentId?: string) => {
  return useQuery({
    queryKey: ['students', 'by-student-id', studentId],
    queryFn: () => studentsApi.getStudentByStudentId(studentId!),
    enabled: !!studentId,
    staleTime: 5 * 60 * 1000,
  })
}
