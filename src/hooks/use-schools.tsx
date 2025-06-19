import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { schoolsApi } from '@/api/schools'

export const useSchools = () => {
  return useQuery({
    queryKey: ['schools'],
    queryFn: schoolsApi.getSchools,
  })
}
