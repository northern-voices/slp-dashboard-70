
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
          <main className="flex-1 p-4 md:p-6 bg-gray-50 pb-20 md:pb-8">
            <div className="max-w-7xl mx-auto">
              {/* Breadcrumb Navigation */}
              <div className="mb-6">
                <Breadcrumb>
                  <BreadcrumbList>
                    <BreadcrumbItem>
                      <BreadcrumbLink asChild>
                        <Link to="/students" className="flex items-center gap-2">
                          <ArrowLeft className="w-4 h-4" />
                          Students
                        </Link>
                      </BreadcrumbLink>
                    </BreadcrumbItem>
                    <BreadcrumbSeparator />
                    <BreadcrumbItem>
                      <BreadcrumbPage>Student Details</BreadcrumbPage>
                    </BreadcrumbItem>
                  </BreadcrumbList>
                </Breadcrumb>
              </div>

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
