import React, { useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useOrganization } from '@/contexts/OrganizationContext'
import { useCurrentSchool } from '@/hooks/school/useCurrentSchool'
import { useLocalStorage } from '@/hooks/useLocalStorage'
import { getNavigationGroups } from './sidebar/sidebarNavigationData'
import { SCHOOL_FREE_ROUTES } from '@/constants/app'

interface SchoolRouterProps {
  children: React.ReactNode
}

const SchoolRouter: React.FC<SchoolRouterProps> = ({ children }) => {
  const navigate = useNavigate()
  const location = useLocation()
  const { schoolId, currentSchool } = useCurrentSchool()
  const { availableSchools, isLoading, userProfile } = useOrganization()
  const [lastSelectedSchoolId, setLastSelectedSchoolId] = useLocalStorage<string | null>(
    'lastSelectedSchoolId',
    null
  )

  const isSchoolFreeRoute = SCHOOL_FREE_ROUTES.some(route => location.pathname.includes(route))

  useEffect(() => {
    if (isLoading || isSchoolFreeRoute || availableSchools.length === 0) return

    if (schoolId) {
      if (currentSchool) {
        // Valid school in the URL - remember it as next time's default
        if (lastSelectedSchoolId !== currentSchool.id) {
          setLastSelectedSchoolId(currentSchool.id)
        }
      } else {
        // schoolId in the URL doesn't match any available school
        navigate(`/school/${availableSchools[0].id}`, { replace: true })
      }
      return
    }

    // No schoolId in the URL at all (root, or a legacy bare route) - send to a default school
    const preferredSchool =
      availableSchools.find(s => s.id === lastSelectedSchoolId) ||
      availableSchools.find(s => s.name.toLowerCase().includes('test')) ||
      availableSchools[0]

    const newPath =
      location.pathname === '/'
        ? `/school/${preferredSchool.id}`
        : location.pathname.replace(/^\//, `/school/${preferredSchool.id}/`)

    navigate(newPath, { replace: true })
  }, [
    schoolId,
    currentSchool,
    availableSchools,
    isLoading,
    isSchoolFreeRoute,
    lastSelectedSchoolId,
    location.pathname,
    navigate,
    setLastSelectedSchoolId,
  ])

  const userRole = (userProfile?.role as string) || 'slp'
  const allItems = getNavigationGroups(
    location,
    userRole,
    userProfile as unknown as Record<string, unknown>,
    currentSchool
  ).flatMap(group => group.items)

  const normalizedPath = location.pathname.replace(/^\/school\/[^/]+/, '') || '/'
  const matchedItem = [...allItems]
    .sort((a, b) => b.url.length - a.url.length)
    .find(item => {
      const itemPath = item.url.replace(/^\/school\/[^/]+/, '') || '/'
      return itemPath === '/' ? normalizedPath === '/' : normalizedPath.startsWith(itemPath)
    })
  const SkeletonComponent = matchedItem?.skeleton

  const needsRedirect =
    !isSchoolFreeRoute && availableSchools.length > 0 && (!schoolId || !currentSchool)

  if (isLoading || needsRedirect) return SkeletonComponent ? <SkeletonComponent /> : null

  // If no schools available, show error
  if (availableSchools.length === 0 && !isSchoolFreeRoute) {
    return (
      <div className='flex items-center justify-center min-h-screen'>
        <div className='text-center'>
          <h2 className='mb-2 text-xl font-semibold text-gray-900'>No Schools Available</h2>
          <p className='text-gray-600'>Please contact your administrator to set up schools.</p>
        </div>
      </div>
    )
  }

  return <>{children}</>
}

export default SchoolRouter
