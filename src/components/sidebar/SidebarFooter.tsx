
import React from 'react';
import { SidebarFooter as SidebarFooterComponent } from '@/components/ui/sidebar';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useOrganization } from '@/contexts/OrganizationContext';
import { Settings } from 'lucide-react';

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
    <SidebarFooterComponent className="border-t border-gray-50 px-6 py-4 bg-white">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3 min-w-0 flex-1">
          <Avatar className="h-8 w-8 ring-2 ring-gray-100">
            <AvatarFallback className="bg-gray-50 text-gray-700 text-xs font-semibold">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col min-w-0 flex-1">
            <span className="text-sm font-semibold text-gray-900 truncate">
              {userProfile ? `${userProfile.first_name} ${userProfile.last_name}` : userName}
            </span>
            <span className="text-xs text-gray-500 font-medium truncate">
              {getRoleLabel(userProfile?.role || userRole)}
            </span>
          </div>
        </div>
        <button className="p-1.5 hover:bg-gray-50 rounded-md transition-colors">
          <Settings className="w-4 h-4 text-gray-400" />
        </button>
      </div>
    </SidebarFooterComponent>
  );
};

export default SidebarFooter;
