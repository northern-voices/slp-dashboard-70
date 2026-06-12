import React, { useState, useEffect } from 'react'
import { Sidebar, SidebarContent } from '@/components/ui/sidebar'
import { useOrganization } from '@/contexts/OrganizationContext'
import { useLocation } from 'react-router-dom'
import SidebarHeader from './sidebar/SidebarHeader'
import SidebarFooter from './sidebar/SidebarFooter'
import SidebarNavigationGroup from './sidebar/SidebarNavigationGroup'
import { getNavigationGroups } from './sidebar/sidebarNavigationData'
import { UserRole } from '@/types/database'

interface AppSidebarProps {
  userRole?: UserRole | null
  userName?: string
  className?: string
}

const AppSidebar = ({
  userName = 'Dr. Sarah Johnson',
  className,
}: AppSidebarProps) => {
  const { userProfile, currentSchool, isLoading } = useOrganization()
  const location = useLocation()
  const [resolvedRole, setResolvedRole] = useState<string | null>(null)

  useEffect(() => {
    if (!isLoading && userProfile?.role) {
      setResolvedRole(userProfile.role)
    }
  }, [isLoading, userProfile?.role])

  const navigationGroups = getNavigationGroups(
    location,
    resolvedRole,
    userProfile as unknown as Record<string, unknown>,
    currentSchool
  )

  return (
    <div className={`hidden md:block ${className || ''}`}>
      <Sidebar className='border-r border-gray-100 bg-white'>
        <SidebarHeader />

        <SidebarContent className='px-3 py-2'>
          <div className='space-y-8'>
            {navigationGroups.map(group => (
              <SidebarNavigationGroup key={group.label} group={group} />
            ))}
          </div>
        </SidebarContent>

        <SidebarFooter />
      </Sidebar>
    </div>
  )
}

export default AppSidebar
