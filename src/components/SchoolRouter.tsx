import React, { useEffect, useState } from 'react'
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

  useEffect(() => {
    if (isLoading) return

    // If we're on a school route and have a schoolId
    if (schoolId && availableSchools.length > 0) {
      const targetSchool = availableSchools.find(school => school.id === schoolId)
      if (targetSchool) {
        // Set the current school if it's different
        if (!currentSchool || currentSchool.id !== targetSchool.id) {
          console.log('SchoolRouter: Setting current school to:', targetSchool.name)
          setCurrentSchool(targetSchool)
        }
        setIsInitializing(false)
        return
      } else {
        // School doesn't exist, redirect to first available school
        console.log(
          'SchoolRouter: Invalid school ID, redirecting to first school:',
          availableSchools[0].name
        )
        navigate(`/school/${availableSchools[0].id}`, { replace: true })
        return
      }
    }

    // If we're on the root path and have schools available
    if (location.pathname === '/' && availableSchools.length > 0) {
      // Check if we have a persisted school selection
      if (currentSchool && availableSchools.find(s => s.id === currentSchool.id)) {
        // Navigate to the persisted school
        console.log('SchoolRouter: Redirecting to persisted school:', currentSchool.name)
        navigate(`/school/${currentSchool.id}`, { replace: true })
        return
      } else {
        // Redirect to the first available school
        console.log(
          'SchoolRouter: Redirecting from root to first school:',
          availableSchools[0].name
        )
        navigate(`/school/${availableSchools[0].id}`, { replace: true })
        return
      }
    }

    // If we have a current school but no schoolId in URL, and we're not on root
    if (currentSchool && !schoolId && location.pathname !== '/' && availableSchools.length > 0) {
      // Check if the current school is still valid
      const isValidSchool = availableSchools.find(s => s.id === currentSchool.id)
      if (isValidSchool) {
        // Navigate to the current school
        console.log('SchoolRouter: Navigating to current school:', currentSchool.name)
        navigate(`/school/${currentSchool.id}`, { replace: true })
        return
      } else {
        // Current school is no longer valid, redirect to first available
        console.log(
          'SchoolRouter: Current school no longer valid, redirecting to first school:',
          availableSchools[0].name
        )
        navigate(`/school/${availableSchools[0].id}`, { replace: true })
        return
      }
    }

    // If we have no current school but we're on a school route, try to restore from localStorage
    if (!currentSchool && schoolId && availableSchools.length > 0) {
      const targetSchool = availableSchools.find(school => school.id === schoolId)
      if (targetSchool) {
        console.log('SchoolRouter: Restoring school from URL:', targetSchool.name)
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
