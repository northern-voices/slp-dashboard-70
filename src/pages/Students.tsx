import React, { useState, useEffect } from 'react';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import AppSidebar from '@/components/AppSidebar';
import Header from '@/components/Header';
import BottomNavigation from '@/components/BottomNavigation';
import { OrganizationProvider, useOrganization } from '@/contexts/OrganizationContext';
import { SchoolProvider, useSchool } from '@/contexts/SchoolContext';
import SLPSchoolSelector from '@/components/slp/SLPSchoolSelector';
import StudentTable from '@/components/students/StudentTable';
import { StudentService } from '@/services/studentService';
import { Student } from '@/types/database';
const StudentsContent = () => {
  const {
    userProfile
  } = useOrganization();
  const {
    selectedSchool
  } = useSchool();
  const [students, setStudents] = useState<Student[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const userRole = userProfile?.role || 'slp';
  const userName = userProfile ? `${userProfile.first_name} ${userProfile.last_name}` : 'Dr. Sarah Johnson';
  useEffect(() => {
    const fetchStudents = async () => {
      try {
        setIsLoading(true);
        const studentsData = await StudentService.getStudents();
        // Filter students by selected school for SLPs
        if (userRole === 'slp' && selectedSchool) {
          const filteredStudents = studentsData.filter(student => student.school_id === selectedSchool.id);
          setStudents(filteredStudents);
        } else {
          setStudents(studentsData);
        }
      } catch (error) {
        console.error('Error fetching students:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchStudents();
  }, [selectedSchool, userRole]);
  if (isLoading) {
    return <div className="min-h-screen flex w-full bg-gray-25">
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading students...</p>
          </div>
        </div>
      </div>;
  }
  return <SidebarProvider>
      <div className="min-h-screen flex w-full bg-gray-25">
        <AppSidebar userRole={userRole} userName={userName} />
        
        <SidebarInset className="flex-1">
          <Header userRole={userRole} userName={userName} />
          
          <main className="flex-1 p-4 md:p-6 lg:p-8 pb-20 md:pb-8">
            {/* Page Header */}
            

            {/* School Selector for SLPs */}
            {userRole === 'slp' && <div className="mb-6">
                <div className="max-w-md">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    School
                  </label>
                  <SLPSchoolSelector />
                </div>
              </div>}

            {/* Show message if SLP hasn't selected a school */}
            {userRole === 'slp' && !selectedSchool ? <div className="text-center py-12">
                <div className="text-gray-400 mb-4">
                  <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Select a School</h3>
                <p className="text-gray-600">Choose a school from the dropdown above to view and manage students.</p>
              </div> : <StudentTable students={students} />}
          </main>
        </SidebarInset>
        
        <BottomNavigation />
      </div>
    </SidebarProvider>;
};
const Students = () => {
  return <OrganizationProvider>
      <SchoolProvider>
        <StudentsContent />
      </SchoolProvider>
    </OrganizationProvider>;
};
export default Students;