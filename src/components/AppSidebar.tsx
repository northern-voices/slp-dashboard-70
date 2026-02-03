import React from 'react'
import { Sidebar, SidebarContent } from '@/components/ui/sidebar'
import { useOrganization } from '@/contexts/OrganizationContext'
import { useLocation } from 'react-router-dom'
import SidebarHeader from './sidebar/SidebarHeader'
import SidebarFooter from './sidebar/SidebarFooter'
import SidebarNavigationGroup from './sidebar/SidebarNavigationGroup'
import { getNavigationGroups } from './sidebar/sidebarNavigationData'
import { UserRole } from '@/types/database'

interface AppSidebarProps {
  userRole?: UserRole
  userName?: string
  className?: string
}

const AppSidebar = ({
  userRole = 'slp',
  userName = 'Dr. Sarah Johnson',
  className,
}: AppSidebarProps) => {
  const { userProfile, currentSchool } = useOrganization()
  const location = useLocation()

  const navigationGroups = getNavigationGroups(
    location,
    userRole,
    userProfile as unknown as Record<string, unknown>,
    currentSchool,
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
