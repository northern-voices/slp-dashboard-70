
import React from 'react';
import { SidebarFooter as SidebarFooterComponent } from '@/components/ui/sidebar';
import { useOrganization } from '@/contexts/OrganizationContext';

const SidebarFooter = () => {
  const { currentOrganization } = useOrganization();

  return (
    <SidebarFooterComponent className="border-t border-gray-50 px-6 py-5 bg-white">
      {/* Organization Section */}
      <div className="flex items-center space-x-3">
        <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-sm">
          <span className="text-white font-bold text-sm">N</span>
        </div>
        <div className="flex flex-col min-w-0">
          <span className="font-semibold text-gray-900 text-sm truncate">
            {currentOrganization?.name || 'NVSS'}
          </span>
        </div>
      </div>
    </SidebarFooterComponent>
  );
};

export default SidebarFooter;
