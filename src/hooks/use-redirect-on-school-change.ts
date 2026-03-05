import { useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useOrganization } from '@/contexts/OrganizationContext'

export const useRedirectOnSchoolChange = (redirectTo: string) => {
  const { currentSchool } = useOrganization()
  const navigate = useNavigate()
  const prevSchoolRef = useRef(currentSchool?.id)

  useEffect(() => {
    if (prevSchoolRef.current !== undefined && prevSchoolRef.current !== currentSchool?.id) {
      navigate(redirectTo)
    }

    prevSchoolRef.current = currentSchool?.id
  }, [currentSchool?.id, navigate, redirectTo])
}
