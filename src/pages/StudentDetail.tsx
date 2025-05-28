
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
          
          {/* Page Title Section */}
          <div className="px-4 md:px-6 lg:px-8 py-6">
            {/* Breadcrumb Navigation */}
            <div className="mb-4">
              <Breadcrumb>
                <BreadcrumbList>
                  <BreadcrumbItem>
                    <BreadcrumbLink asChild>
                      <Link to="/students" className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors">
                        <ArrowLeft className="w-4 h-4" />
                        Students
                      </Link>
                    </BreadcrumbLink>
                  </BreadcrumbItem>
                  <BreadcrumbSeparator />
                  <BreadcrumbItem>
                    <BreadcrumbPage className="text-gray-900 font-medium">Student Details</BreadcrumbPage>
                  </BreadcrumbItem>
                </BreadcrumbList>
              </Breadcrumb>
            </div>
            
            <div className="mb-6">
              <h1 className="text-2xl md:text-3xl text-gray-900 mb-2 font-semibold">Student Details</h1>
              <p className="text-gray-600 text-base md:text-lg">View and manage student information and screening history</p>
            </div>
          </div>

          <main className="flex-1 px-4 md:px-6 lg:px-8 pb-20 md:pb-8 space-y-6">
            {/* Student Info Header */}
            <StudentInfoHeader studentId={studentId} />

            {/* Screening History */}
            <StudentScreeningHistory studentId={studentId} />
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
