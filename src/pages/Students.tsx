
import React from 'react';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import AppSidebar from '@/components/AppSidebar';
import Header from '@/components/Header';
import StudentTable from '@/components/students/StudentTable';
import BottomNavigation from '@/components/BottomNavigation';
import { OrganizationProvider, useOrganization } from '@/contexts/OrganizationContext';

const StudentsContent = () => {
  const { userProfile, isLoading } = useOrganization();
  
  const userRole = userProfile?.role || 'slp';
  const userName = userProfile ? `${userProfile.first_name} ${userProfile.last_name}` : 'Dr. Sarah Johnson';

  if (isLoading) {
    return (
      <div className="min-h-screen flex w-full bg-gray-25">
        <div className="flex-1 flex items-center justify-center p-4">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600 text-sm">Loading students...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-gray-25">
        <AppSidebar userRole={userRole} userName={userName} />
        
        <SidebarInset className="flex-1">
          <Header userRole={userRole} userName={userName} className="font-medium" />
          
          {/* Page Title Section */}
          <div className="px-4 md:px-6 lg:px-8 py-6">
            <div className="mb-6">
              <h1 className="text-2xl md:text-3xl text-gray-900 mb-2 font-semibold">Students</h1>
              <p className="text-gray-600 text-base md:text-lg">Manage student information and records</p>
            </div>
          </div>
          
          <main className="flex-1 px-4 md:px-6 lg:px-8 pb-20 md:pb-8">
            <StudentTable />
          </main>
        </SidebarInset>
        
        <BottomNavigation />
      </div>
    </SidebarProvider>
  );
};

const Students = () => {
  return (
    <OrganizationProvider>
      <StudentsContent />
    </OrganizationProvider>
  );
};

export default Students;
