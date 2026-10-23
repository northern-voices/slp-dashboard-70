import { useMemo } from 'react'
import { useParams } from 'react-router-dom'
import { useOrganization } from '@/contexts/OrganizationContext'

export const useCurrentSchool = () => {
  const { schoolId } = useParams<{ schoolId: string }>()
  const { availableSchools } = useOrganization()

  const currentSchool = useMemo(
    () => availableSchools.find(school => school.id === schoolId) ?? null,
    [availableSchools, schoolId]
  )

  return { currentSchool, schoolId }
}
