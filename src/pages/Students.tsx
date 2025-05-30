
import React, { useState, useEffect } from 'react';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import AppSidebar from '@/components/AppSidebar';
import Header from '@/components/Header';
import BottomNavigation from '@/components/BottomNavigation';
import { OrganizationProvider, useOrganization } from '@/contexts/OrganizationContext';
import StudentTable from '@/components/students/StudentTable';
import { StudentService } from '@/services/studentService';
import { Database } from '@/types/supabase';

type Student = Database['public']['Tables']['students']['Row'];

const StudentsContent = () => {
  const { userProfile } = useOrganization();
  const [students, setStudents] = useState<Student[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const userRole = userProfile?.role || 'slp';
  const userName = userProfile 
    ? `${userProfile.first_name} ${userProfile.last_name}` 
    : 'Dr. Sarah Johnson';

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        setIsLoading(true);
        const studentsData = await StudentService.getStudents();
        setStudents(studentsData);
      } catch (error) {
        console.error('Error fetching students:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStudents();
  }, []);

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
      <div className="min-h-screen flex w-full bg-gray-25">
        <AppSidebar userRole={userRole} userName={userName} />
        
        <SidebarInset className="flex-1">
          <Header userRole={userRole} userName={userName} />
          
          <main className="flex-1 p-4 md:p-6 lg:p-8 pb-20 md:pb-8">
            <StudentTable students={students} />
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
