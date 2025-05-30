
import React from 'react';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import AppSidebar from '@/components/AppSidebar';
import Header from '@/components/Header';
import DashboardStats from '@/components/DashboardStats';
import QuickActions from '@/components/QuickActions';
import BottomNavigation from '@/components/BottomNavigation';
import { OrganizationProvider, useOrganization } from '@/contexts/OrganizationContext';
import { GraduationCap } from 'lucide-react';

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
    return <div className="min-h-screen flex w-full bg-gray-25">
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading dashboard...</p>
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
            {/* Context Banner - Below header */}
            {currentSchool && <div className="bg-brand/10 border border-brand/20 rounded-lg p-3 mb-6">
                <div className="flex items-center space-x-2">
                  <GraduationCap className="w-4 h-4 text-brand flex-shrink-0" />
                  <div className="min-w-0">
                    <h3 className="font-medium text-brand text-sm truncate">
                      Viewing data for {currentSchool.name}
                    </h3>
                    <p className="text-xs text-brand/70 truncate">
                      {currentOrganization?.name} • Switch schools using the sidebar
                    </p>
                  </div>
                </div>
              </div>}

            <div className="mb-6 md:mb-8">
              <h1 className="text-xl md:text-2xl lg:text-3xl text-gray-900 mb-2 font-medium">Dashboard</h1>
              <p className="text-gray-600 text-sm md:text-base">Welcome back! Here's an overview of your students and activities.</p>
            </div>

            <div className="space-y-6 md:space-y-8">
              <QuickActions />
              <DashboardStats />
            </div>
          </main>
        </SidebarInset>
        
        <BottomNavigation />
      </div>
    </SidebarProvider>;
};

const Index = () => {
  return <OrganizationProvider>
      <DashboardContent />
    </OrganizationProvider>;
};

export default Index;
