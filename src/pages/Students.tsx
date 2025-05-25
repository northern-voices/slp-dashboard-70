
import React from 'react';
import { SidebarProvider } from '@/components/ui/sidebar';
import AppSidebar from '@/components/AppSidebar';
import Header from '@/components/Header';
import StudentTable from '@/components/students/StudentTable';

const Students = () => {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar />
        <div className="flex-1 flex flex-col">
          <Header />
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

export default Students;
