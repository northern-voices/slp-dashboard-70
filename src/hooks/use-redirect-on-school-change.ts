import { useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useCurrentSchool } from '@/hooks/school/useCurrentSchool'

export const useRedirectOnSchoolChange = (redirectTo: string) => {
  const { currentSchool } = useCurrentSchool()
  const navigate = useNavigate()
  const prevSchoolRef = useRef(currentSchool?.id)

  useEffect(() => {
    if (prevSchoolRef.current !== undefined && prevSchoolRef.current !== currentSchool?.id) {
      navigate(redirectTo)
    }

    prevSchoolRef.current = currentSchool?.id
  }, [currentSchool?.id, navigate, redirectTo])
}
