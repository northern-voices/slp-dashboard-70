import { useOrganization } from '@/contexts/OrganizationContext'
import { useQuery } from '@tanstack/react-query'
import { schoolGradesApi } from '@/api/schoolGrades'

export const useSchoolGrades = () => {
  const { currentOrganization } = useOrganization()

  return useQuery({
    queryKey: ['school-grades', currentOrganization?.id],
    queryFn: () => schoolGradesApi.getSchoolGrades(currentOrganization?.id),
    enabled: !!currentOrganization?.id,
  })
}
