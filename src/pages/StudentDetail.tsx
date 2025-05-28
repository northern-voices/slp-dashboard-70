
import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { SidebarProvider } from '@/components/ui/sidebar';
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
        <div className="flex-1 flex flex-col">
          <Header userRole={userRole} userName={userName} />
          
          {/* Header Section with Brand Colors */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-4 md:px-6 py-6">
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
          </div>

          <main className="flex-1 p-4 md:p-6 bg-gray-50 pb-20 md:pb-8 -mt-4">
            <div className="max-w-7xl mx-auto">
              {/* Student Info Header */}
              <StudentInfoHeader studentId={studentId} />

              {/* Screening History */}
              <StudentScreeningHistory studentId={studentId} />
            </div>
          </main>
        </div>
        
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
