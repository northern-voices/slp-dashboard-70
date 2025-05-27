import React from 'react';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import AppSidebar from '@/components/AppSidebar';
import Header from '@/components/Header';
import DashboardStats from '@/components/DashboardStats';
import QuickActions from '@/components/QuickActions';
import RecentActivity from '@/components/RecentActivity';
import BottomNavigation from '@/components/BottomNavigation';
import { OrganizationProvider, useOrganization } from '@/contexts/OrganizationContext';
const DashboardContent = () => {
  const {
    userProfile,
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
            <div className="mb-6 md:mb-8">
              <h1 className="text-xl md:text-2xl lg:text-3xl font-semibold text-gray-900 mb-2">Dashboard</h1>
              <p className="text-gray-600 text-sm md:text-base">Welcome back! Here's an overview of your students and activities.</p>
            </div>

            <div className="space-y-6 md:space-y-8">
              <DashboardStats />
              
              <div className="grid grid-cols-1 lg:grid-cols-1 gap-6 md:gap-8">
                <div className="lg:col-span-2">
                  <RecentActivity />
                </div>
                
              </div>
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