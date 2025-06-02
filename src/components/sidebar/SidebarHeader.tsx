
import React from 'react';
import { SidebarHeader as SidebarHeaderComponent } from '@/components/ui/sidebar';
import { useOrganization } from '@/contexts/OrganizationContext';
import SchoolSelector from '@/components/SchoolSelector';

const SidebarHeader = () => {
  const { currentOrganization } = useOrganization();

  return (
    <SidebarHeaderComponent className="border-b border-gray-50 px-6 py-5 bg-white">
      {/* Organization Section */}
      <div className="flex items-center space-x-3 mb-6">
        <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-sm overflow-hidden">
          <img 
            src="/lovable-uploads/60550859-aeae-4648-81dc-f233a9d39217.png" 
            alt="Organization Logo" 
            className="w-full h-full object-contain"
          />
        </div>
        <div className="flex flex-col min-w-0">
          <span className="font-semibold text-gray-900 text-sm truncate">
            {currentOrganization?.name || 'NVSS'}
          </span>
          <span className="text-xs text-gray-500 font-medium">Speech & Language Services</span>
        </div>
      </div>
      
      {/* Current School Section */}
      <div className="space-y-3">
        <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider block">
          Current Location
        </span>
        <SchoolSelector />
      </div>
    </SidebarHeaderComponent>
  );
};

export default SidebarHeader;
