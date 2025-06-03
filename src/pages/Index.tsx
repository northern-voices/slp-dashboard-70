
import React from 'react';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import AppSidebar from '@/components/AppSidebar';
import Header from '@/components/Header';
import DashboardStats from '@/components/DashboardStats';
import QuickActions from '@/components/QuickActions';
import SLPDashboardStats from '@/components/slp/SLPDashboardStats';
import SLPQuickActions from '@/components/slp/SLPQuickActions';
import SLPSchoolSelector from '@/components/slp/SLPSchoolSelector';
import { OrganizationProvider, useOrganization } from '@/contexts/OrganizationContext';
import { SchoolProvider, useSchool } from '@/contexts/SchoolContext';

const DashboardContent = () => {
  const {
    userProfile,
    currentOrganization,
    currentSchool,
    isLoading
  } = useOrganization();
  
  const userRole = userProfile?.role || 'slp';
  const userName = userProfile ? `${userProfile.first_name} ${userProfile.last_name}` : 'Dr. Sarah Johnson';
  
  if (isLoading) {
    return (
      <div className="min-h-screen flex w-full bg-gray-25">
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand mx-auto mb-4"></div>
            <p className="text-gray-600 text-sm">Loading dashboard...</p>
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
          
          <main className="flex-1 px-6 py-8 pb-8">
            {/* Page Header */}
            <div className="mb-8">
              <div className="max-w-7xl mx-auto">
                <h1 className="text-2xl font-semibold text-gray-900 tracking-tight mb-2">
                  {userRole === 'slp' ? 'My Dashboard' : 
                   currentSchool ? `${currentSchool.name} Dashboard` : 'Dashboard'}
                </h1>
                <p className="text-gray-600 text-sm leading-relaxed">
                  Welcome back, {userName}. 
                  {userRole === 'slp' ? ' Select a school and start managing screenings.' : ' Start new assessments and manage your speech & language screenings.'}
                </p>
              </div>
            </div>

            {/* School Selector for SLPs */}
            {userRole === 'slp' && (
              <div className="max-w-7xl mx-auto mb-8">
                <div className="max-w-md">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Select School
                  </label>
                  <SLPSchoolSelector />
                </div>
              </div>
            )}

            {/* Dashboard Content */}
            <div className="max-w-7xl mx-auto">
              <div className="space-y-8">
                {userRole === 'slp' ? (
                  <>
                    <SLPQuickActions />
                    <SLPDashboardStats />
                  </>
                ) : (
                  <>
                    <QuickActions />
                    <DashboardStats />
                  </>
                )}
              </div>
            </div>
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};

const Index = () => {
  return (
    <OrganizationProvider>
      <SchoolProvider>
        <DashboardContent />
      </SchoolProvider>
    </OrganizationProvider>
  );
};

export default Index;
