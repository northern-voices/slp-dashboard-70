import { useOrganization } from '@/contexts/OrganizationContext'
import { useQuery } from '@tanstack/react-query'
import { schoolGradesApi } from '@/api/schoolGrades'
import { string } from 'zod'

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
  const cacheKey = `cached_school_grades_${currentOrganization?.id}`

  return useQuery({
    queryKey: ['school-grades', currentOrganization?.id],
    queryFn: async () => {
      const grades = await schoolGradesApi.getSchoolGrades(currentOrganization?.id)
      // Cache for offline use
      setGradesCache(cacheKey, grades)
      return grades
    },
    enabled: !!currentOrganization?.id,
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
