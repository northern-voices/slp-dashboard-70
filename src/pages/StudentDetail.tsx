
import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb';
import { ArrowLeft } from 'lucide-react';
import AppSidebar from '@/components/AppSidebar';
import Header from '@/components/Header';
import StudentInfoHeader from '@/components/students/StudentInfoHeader';
import StudentScreeningHistory from '@/components/students/StudentScreeningHistory';
import BottomNavigation from '@/components/BottomNavigation';
import { OrganizationProvider, useOrganization } from '@/contexts/OrganizationContext';

const StudentDetailContent = () => {
  const { studentId } = useParams<{ studentId: string }>();
  const { userProfile, isLoading } = useOrganization();
  
  const userRole = userProfile?.role || 'slp';
  const userName = userProfile ? `${userProfile.first_name} ${userProfile.last_name}` : 'Dr. Sarah Johnson';

  if (isLoading) {
    return (
      <div className="min-h-screen flex w-full bg-gray-25">
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading student details...</p>
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
          
          {/* Header Section with Brand Colors */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-4 md:px-6 lg:px-8 py-6">
            {/* Breadcrumb Navigation with white styling */}
            <div className="mb-4">
              <Breadcrumb>
                <BreadcrumbList>
                  <BreadcrumbItem>
                    <BreadcrumbLink asChild>
                      <Link to="/students" className="flex items-center gap-2 text-blue-100 hover:text-white transition-colors">
                        <ArrowLeft className="w-4 h-4" />
                        Students
                      </Link>
                    </BreadcrumbLink>
                  </BreadcrumbItem>
                  <BreadcrumbSeparator className="text-blue-200" />
                  <BreadcrumbItem>
                    <BreadcrumbPage className="text-white font-medium">Student Details</BreadcrumbPage>
                  </BreadcrumbItem>
                </BreadcrumbList>
              </Breadcrumb>
            </div>
            
            <div className="mb-4">
              <h1 className="text-2xl md:text-3xl text-white mb-2 font-medium">Student Details</h1>
              <p className="text-blue-100 text-base md:text-lg">View and manage student information and screening history</p>
            </div>
          </div>

          <main className="flex-1 p-4 md:p-6 lg:p-8 pb-20 md:pb-8 -mt-4">
            {/* White content card with shadow */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 space-y-6">
              {/* Student Info Header */}
              <StudentInfoHeader studentId={studentId} />

              {/* Screening History */}
              <StudentScreeningHistory studentId={studentId} />
            </div>
          </main>
        </SidebarInset>
        
        <BottomNavigation />
      </div>
    </SidebarProvider>
  );
};

const StudentDetail = () => {
  return (
    <OrganizationProvider>
      <StudentDetailContent />
    </OrganizationProvider>
  );
};

export default StudentDetail;
