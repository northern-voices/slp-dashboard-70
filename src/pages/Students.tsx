import React from 'react';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import AppSidebar from '@/components/AppSidebar';
import Header from '@/components/Header';
import StudentTable from '@/components/students/StudentTable';
import BottomNavigation from '@/components/BottomNavigation';
import { OrganizationProvider, useOrganization } from '@/contexts/OrganizationContext';
const StudentsContent = () => {
  const {
    userProfile,
    isLoading
  } = useOrganization();
  const userRole = userProfile?.role || 'slp';
  const userName = userProfile ? `${userProfile.first_name} ${userProfile.last_name}` : 'Dr. Sarah Johnson';
  if (isLoading) {
    return <div className="min-h-screen flex w-full bg-gray-25">
        <div className="flex-1 flex items-center justify-center p-4">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600 text-sm">Loading students...</p>
          </div>
        </div>
      </div>;
  }
  return <SidebarProvider>
      <div className="min-h-screen flex w-full bg-gray-25">
        <AppSidebar userRole={userRole} userName={userName} />
        
        <SidebarInset className="flex-1">
          <Header userRole={userRole} userName={userName} className="font-medium" />
          
          {/* Header Section with Brand Colors */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-4 md:px-6 lg:px-8 py-6">
            <div className="mb-4">
              <h1 className="text-2xl md:text-3xl text-white mb-2 font-medium">Students</h1>
              <p className="text-blue-100 text-base md:text-lg">Manage student information and records</p>
            </div>
          </div>
          
          <main className="flex-1 p-4 md:p-6 lg:p-8 pb-20 md:pb-8 -mt-4">
            {/* White content card with shadow */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <StudentTable />
            </div>
          </main>
        </SidebarInset>
        
        <BottomNavigation />
      </div>
    </SidebarProvider>;
};
const Students = () => {
  return <OrganizationProvider>
      <StudentsContent />
    </OrganizationProvider>;
};
export default Students;