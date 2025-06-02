
import React from 'react';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import AppSidebar from '@/components/AppSidebar';
import Header from '@/components/Header';
import DashboardStats from '@/components/DashboardStats';
import QuickActions from '@/components/QuickActions';
import BottomNavigation from '@/components/BottomNavigation';
import { OrganizationProvider, useOrganization } from '@/contexts/OrganizationContext';

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
          
          <main className="flex-1 px-6 py-8 pb-20 md:pb-8">
            {/* Page Header */}
            <div className="mb-8">
              <div className="max-w-7xl mx-auto">
                <h1 className="text-2xl font-semibold text-gray-900 tracking-tight mb-2">
                  {currentSchool ? `${currentSchool.name} Dashboard` : 'Dashboard'}
                </h1>
                <p className="text-gray-600 text-sm leading-relaxed">
                  Welcome back, {userName}. Start new assessments and manage your speech & language screenings.
                </p>
              </div>
            </div>

            {/* Dashboard Content */}
            <div className="max-w-7xl mx-auto">
              <div className="space-y-8">
                <QuickActions />
                <DashboardStats />
              </div>
            </div>
          </main>
        </SidebarInset>
        
        <BottomNavigation />
      </div>
    </SidebarProvider>
  );
};

const Index = () => {
  return (
    <OrganizationProvider>
      <DashboardContent />
    </OrganizationProvider>
  );
};

export default Index;
