
import React from 'react';
import { SidebarProvider } from '@/components/ui/sidebar';
import AppSidebar from '@/components/AppSidebar';
import Header from '@/components/Header';
import StudentTable from '@/components/students/StudentTable';
import { OrganizationProvider, useOrganization } from '@/contexts/OrganizationContext';

const StudentsContent = () => {
  const { userProfile, isLoading } = useOrganization();
  
  const userRole = userProfile?.role || 'slp';
  const userName = userProfile ? `${userProfile.first_name} ${userProfile.last_name}` : 'Dr. Sarah Johnson';

  if (isLoading) {
    return (
      <div className="min-h-screen flex w-full bg-gray-25">
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading students...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar userRole={userRole} userName={userName} />
        <div className="flex-1 flex flex-col">
          <Header userRole={userRole} userName={userName} />
          <main className="flex-1 p-6 bg-gray-50">
            <div className="max-w-7xl mx-auto">
              <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-900">Students</h1>
                <p className="text-gray-600 mt-1">Manage student information and records</p>
              </div>
              <StudentTable />
            </div>
          </main>
        </div>
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
