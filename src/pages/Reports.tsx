
import React from 'react';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import AppSidebar from '@/components/AppSidebar';
import Header from '@/components/Header';
import BottomNavigation from '@/components/BottomNavigation';
import { OrganizationProvider, useOrganization } from '@/contexts/OrganizationContext';
import ReportsPageContent from '@/components/features/reports/ReportsPageContent';

const ReportsContent = () => {
  const { userProfile } = useOrganization();
  
  const userRole = userProfile?.role || 'slp';
  const userName = userProfile 
    ? `${userProfile.first_name} ${userProfile.last_name}` 
    : 'Dr. Sarah Johnson';

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-gray-25">
        <AppSidebar userRole={userRole} userName={userName} className="font-medium" />
        
        <SidebarInset className="flex-1">
          <Header userRole={userRole} userName={userName} />
          
          <main className="flex-1 p-4 md:p-6 lg:p-8 pb-20 md:pb-8">
            <ReportsPageContent />
          </main>
        </SidebarInset>
        
        <BottomNavigation />
      </div>
    </SidebarProvider>
  );
};

const Reports = () => {
  return (
    <OrganizationProvider>
      <ReportsContent />
    </OrganizationProvider>
  );
};

export default Reports;
