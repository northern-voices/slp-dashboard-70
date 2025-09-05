import React, { useEffect, useState, useCallback, useMemo } from 'react'
import { useNavigate, useParams, useLocation } from 'react-router-dom'
import { useOrganization } from '@/contexts/OrganizationContext'
import LoadingSpinner from '@/components/common/LoadingSpinner'

interface SchoolRouterProps {
  children: React.ReactNode
}

const SchoolRouter: React.FC<SchoolRouterProps> = ({ children }) => {
  const navigate = useNavigate()
  const location = useLocation()
  const { schoolId } = useParams<{ schoolId: string }>()
  const { currentSchool, availableSchools, setCurrentSchool, isLoading } = useOrganization()
  const [isInitializing, setIsInitializing] = useState(true)
  const [lastNavigationCheck, setLastNavigationCheck] = useState<number>(0)

  // Memoize the navigation logic to prevent unnecessary recalculations
  const shouldNavigate = useCallback(
    (targetPath: string) => {
      const now = Date.now()
      // Prevent excessive navigation checks - only check every 2 seconds
      if (now - lastNavigationCheck < 2000) {
        return false
      }
      setLastNavigationCheck(now)
      return true
    },
    [lastNavigationCheck]
  )

  // Memoize the target school to prevent unnecessary lookups
  const targetSchool = useMemo(() => {
    if (!schoolId || availableSchools.length === 0) return null
    return availableSchools.find(school => school.id === schoolId) || null
  }, [schoolId, availableSchools])

  useEffect(() => {
    if (isLoading) return

    // If we're on a school route and have a schoolId
    if (schoolId && availableSchools.length > 0) {
      if (targetSchool) {
        // Set the current school if it's different
        if (!currentSchool || currentSchool.id !== targetSchool.id) {
          setCurrentSchool(targetSchool)
        }
        setIsInitializing(false)
        return
      } else {
        // School doesn't exist, redirect to first available school
        if (shouldNavigate(`/school/${availableSchools[0].id}`)) {
          navigate(`/school/${availableSchools[0].id}`, { replace: true })
        }
        return
      }
    }

    // If we're on the root path and have schools available
    if (location.pathname === '/' && availableSchools.length > 0) {
      // Check if we have a persisted school selection
      if (currentSchool && availableSchools.find(s => s.id === currentSchool.id)) {
        // Navigate to the persisted school
        if (shouldNavigate(`/school/${currentSchool.id}`)) {
          navigate(`/school/${currentSchool.id}`, { replace: true })
        }
        return
      } else {
        // !TEMPORARY: Default to test school for now
        // Look for test school first, then fall back to first available school
        const testSchool = availableSchools.find(school =>
          school.name.toLowerCase().includes('test')
        )

        if (testSchool) {
          // Set test school as current and navigate to it
          setCurrentSchool(testSchool)
          if (shouldNavigate(`/school/${testSchool.id}`)) {
            navigate(`/school/${testSchool.id}`, { replace: true })
          }
          return
        } else {
          // Fall back to first available school
          if (shouldNavigate(`/school/${availableSchools[0].id}`)) {
            navigate(`/school/${availableSchools[0].id}`, { replace: true })
          }
          return
        }
      }
    }

    // If we have a current school but no schoolId in URL, and we're not on root
    if (currentSchool && !schoolId && location.pathname !== '/' && availableSchools.length > 0) {
      // Check if the current school is still valid
      const isValidSchool = availableSchools.find(s => s.id === currentSchool.id)
      if (isValidSchool) {
        // Check if we're on a route that should redirect to school-specific path
        const routePath = location.pathname
        let targetPath = ''

        if (routePath === '/screenings') {
          targetPath = `/school/${currentSchool.id}/screenings`
        } else if (routePath === '/screening/speech') {
          targetPath = `/school/${currentSchool.id}/screening/speech`
        } else if (routePath === '/screening/hearing') {
          targetPath = `/school/${currentSchool.id}/screening/hearing`
        } else if (routePath === '/students') {
          targetPath = `/school/${currentSchool.id}/students`
        } else if (routePath === '/reports' || routePath === '/speech-screening-reports') {
          targetPath = `/school/${currentSchool.id}/speech-screening-reports`
        } else if (routePath === '/management') {
          targetPath = `/school/${currentSchool.id}/management`
        } else if (routePath === '/profile') {
          targetPath = `/school/${currentSchool.id}/profile`
        } else if (routePath === '/notifications') {
          targetPath = `/school/${currentSchool.id}/notifications`
        } else {
          targetPath = `/school/${currentSchool.id}`
        }

        if (targetPath && shouldNavigate(targetPath)) {
          navigate(targetPath, { replace: true })
        }
        return
      } else {
        // Current school is no longer valid, redirect to first available
        if (shouldNavigate(`/school/${availableSchools[0].id}`)) {
          navigate(`/school/${availableSchools[0].id}`, { replace: true })
        }
        return
      }
    }

    // If we have no current school but we're on a school route, try to restore from localStorage
    if (!currentSchool && schoolId && availableSchools.length > 0) {
      if (targetSchool) {
        setCurrentSchool(targetSchool)
        setIsInitializing(false)
        return
      }
    }

    setIsInitializing(false)
  }, [
    schoolId,
    availableSchools,
    currentSchool,
    isLoading,
    navigate,
    location.pathname,
    setCurrentSchool,
    targetSchool,
    shouldNavigate,
  ])

  // Show loading while initializing
  if (isLoading || isInitializing) {
    return (
      <div className='flex items-center justify-center min-h-screen'>
        <LoadingSpinner />
      </div>
    )
  }

  // If no schools available, show error
  if (availableSchools.length === 0) {
    return (
      <div className='flex items-center justify-center min-h-screen'>
        <div className='text-center'>
          <h2 className='text-xl font-semibold text-gray-900 mb-2'>No Schools Available</h2>
          <p className='text-gray-600'>Please contact your administrator to set up schools.</p>
        </div>
      </div>
    )
  }

  return <>{children}</>
}

export default SchoolRouter
