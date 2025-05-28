
import React from 'react';
import { SidebarHeader as SidebarHeaderComponent } from '@/components/ui/sidebar';
import { useOrganization } from '@/contexts/OrganizationContext';
import SchoolSelector from '@/components/SchoolSelector';

const SidebarHeader = () => {
  const { currentOrganization } = useOrganization();

  return (
    <SidebarHeaderComponent className="border-b border-gray-100 p-4">
      <div className="flex items-center space-x-3 mb-4">
        <div className="w-8 h-8 bg-brand rounded-lg flex items-center justify-center shadow-sm">
          <span className="text-white font-bold text-sm">SLP</span>
        </div>
        <div className="flex flex-col min-w-0">
          <span className="font-semibold text-gray-900 text-sm truncate">
            {currentOrganization?.name || 'SLP Dashboard'}
          </span>
          <span className="text-xs text-gray-500">Speech & Language</span>
        </div>
      </div>
      
      {/* School Selector */}
      <div className="space-y-2">
        <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">
          Current School
        </span>
        <SchoolSelector />
      </div>
    </SidebarHeaderComponent>
  );
};

export default SidebarHeader;
