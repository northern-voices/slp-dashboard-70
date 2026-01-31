import { useQuery } from '@tanstack/react-query'
import { studentsApi } from '@/api/students'
import { useOrganization } from '@/contexts/OrganizationContext'
import { Student } from '@/types/database'
import { useOnlineStatus } from '@/hooks/use-online-status'

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
  const isOnline = useOnlineStatus()
  const cacheKey = `cached_students_grade_${currentSchool?.id}_${gradeLevel}`

  return useQuery({
    queryKey: ['students', 'by-grade', gradeLevel, currentSchool?.id],
    queryFn: async () => {
      const cached = getStudentsCache(cacheKey)

      try {
        const students = await studentsApi.getStudentsByGrade(gradeLevel, currentSchool?.id)
        setStudentsCache(cacheKey, students)
        return students
      } catch (error) {
        // On network error, fall back to cache
        if (cached.length > 0) {
          return cached
        }
        throw error
      }
    },
    staleTime: 5 * 60 * 1000,
    gcTime: 15 * 60 * 1000,
    enabled: !!gradeLevel && !!currentSchool?.id,
    retry: isOnline ? 3 : false,
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
  const isOnline = useOnlineStatus()
  const cacheKey = `cached_students_school_${schoolId}`

  return useQuery({
    queryKey: ['students', 'by-school', schoolId],
    queryFn: async () => {
      const cached = getStudentsCache(cacheKey)

      try {
        const students = await studentsApi.getStudentsBySchool(schoolId!)
        // Cache for offline use
        setStudentsCache(cacheKey, students)
        return students
      } catch (error) {
        // On network error, fall back to cache
        if (cached.length > 0) {
          return cached
        }
        throw error
      }
    },
    staleTime: 5 * 60 * 1000,
    gcTime: 15 * 60 * 1000,
    enabled: !!schoolId,
    retry: isOnline ? 3 : false,
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
