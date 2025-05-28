
import React from 'react';
import { SidebarFooter as SidebarFooterComponent } from '@/components/ui/sidebar';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useOrganization } from '@/contexts/OrganizationContext';

interface SidebarFooterProps {
  userRole?: 'admin' | 'slp' | 'supervisor';
  userName?: string;
}

const SidebarFooter = ({ userRole = 'slp', userName = 'Dr. Sarah Johnson' }: SidebarFooterProps) => {
  const { userProfile } = useOrganization();
  const initials = userName.split(' ').map(n => n[0]).join('');

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'admin':
        return 'Administrator';
      case 'supervisor':
        return 'Supervisor';
      default:
        return 'Speech-Language Pathologist';
    }
  };

  return (
    <SidebarFooterComponent className="border-t border-gray-100 p-4">
      <div className="flex items-center space-x-3">
        <Avatar className="h-8 w-8">
          <AvatarFallback className="bg-gray-100 text-gray-700 text-xs font-medium">
            {initials}
          </AvatarFallback>
        </Avatar>
        <div className="flex flex-col min-w-0 flex-1">
          <span className="text-sm font-medium text-gray-900 truncate">
            {userProfile ? `${userProfile.first_name} ${userProfile.last_name}` : userName}
          </span>
          <span className="text-xs text-gray-500">
            {getRoleLabel(userProfile?.role || userRole)}
          </span>
        </div>
      </div>
    </SidebarFooterComponent>
  );
};

export default SidebarFooter;
