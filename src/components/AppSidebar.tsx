
import React from 'react';
import {
  Sidebar,
  SidebarContent,
} from '@/components/ui/sidebar';
import { useOrganization } from '@/contexts/OrganizationContext';
import { useLocation } from 'react-router-dom';
import SidebarHeader from './sidebar/SidebarHeader';
import SidebarFooter from './sidebar/SidebarFooter';
import SidebarNavigationGroup from './sidebar/SidebarNavigationGroup';
import { getNavigationGroups } from './sidebar/sidebarNavigationData';

interface AppSidebarProps {
  userRole?: 'admin' | 'slp' | 'supervisor';
  userName?: string;
  className?: string;
}

const AppSidebar = ({ userRole = 'slp', userName = 'Dr. Sarah Johnson', className }: AppSidebarProps) => {
  const { userProfile } = useOrganization();
  const location = useLocation();

  const navigationGroups = getNavigationGroups(location, userRole, userProfile);

  return (
    <div className={`hidden md:block ${className || ''}`}>
      <Sidebar className="border-r border-gray-100 bg-white">
        <SidebarHeader />
        
        <SidebarContent className="px-3 py-2">
          <div className="space-y-8">
            {navigationGroups.map((group) => (
              <SidebarNavigationGroup key={group.label} group={group} />
            ))}
          </div>
        </SidebarContent>

        <SidebarFooter userRole={userRole} userName={userName} />
      </Sidebar>
    </div>
  );
};

export default AppSidebar;
