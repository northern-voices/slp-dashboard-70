import { useQuery } from '@tanstack/react-query'
import { studentsApi } from '@/api/students'

export const useReturningAbsentStudents = (schoolId?: string) => {
  return useQuery({
    queryKey: ['returning-absent-students', schoolId],
    queryFn: () => studentsApi.getReturningAbsentStudents(schoolId!),
    enabled: !!schoolId,
    staleTime: 5 * 60 * 1000,
  })
}
