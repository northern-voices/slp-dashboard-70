import { useOrganization } from '@/contexts/OrganizationContext'
import { useQuery } from '@tanstack/react-query'
import { schoolGradesApi } from '@/api/schoolGrades'
import { useOnlineStatus } from '@/hooks/use-online-status'

interface SchoolGrade {
  id: string
  school_id: string
  grade_level: string
  academic_year: string
  created_at: string
  updated_at: string
}

const getGradesCache = (key: string): SchoolGrade[] => {
  try {
    const cached = localStorage.getItem(key)
    return cached ? JSON.parse(cached) : []
  } catch {
    return []
  }
}

const setGradesCache = (key: string, grades: SchoolGrade[]) => {
  try {
    localStorage.setItem(key, JSON.stringify(grades))
  } catch (error) {
    console.error('Failed to cache grades:', error)
  }
}

export const useSchoolGrades = () => {
  const { currentOrganization } = useOrganization()
  const isOnline = useOnlineStatus()
  const cacheKey = `cached_school_grades_${currentOrganization?.id}`

  return useQuery({
    queryKey: ['school-grades', currentOrganization?.id],
    queryFn: async () => {
      const cached = getGradesCache(cacheKey)

      try {
        const grades = await schoolGradesApi.getSchoolGrades(currentOrganization?.id)
        setGradesCache(cacheKey, grades)
        return grades
      } catch (error) {
        // On network error, fall back to cache
        if (cached.length > 0) {
          return cached
        }
        throw error
      }
    },
    enabled: !!currentOrganization?.id,
    retry: isOnline ? 3 : false,
    placeholderData: currentOrganization?.id ? getGradesCache(cacheKey) : [],
  })
}

export const useSchoolGradesBySchool = (schoolId?: string) => {
  const cacheKey = `cached_school_grades_school_${schoolId}`

  return useQuery({
    queryKey: ['school-grades', 'by-school', schoolId],
    queryFn: async () => {
      const grades = await schoolGradesApi.getSchoolGradesBySchool(schoolId!)
      // Cache for offline use
      setGradesCache(cacheKey, grades)
      return grades
    },
    enabled: !!schoolId,
    // Return cached date when offline or while loading
    placeholderData: schoolId ? getGradesCache(cacheKey) : [],
  })
}
