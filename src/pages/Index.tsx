
import React from 'react';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import AppSidebar from '@/components/AppSidebar';
import Header from '@/components/Header';
import DashboardStats from '@/components/DashboardStats';
import QuickActions from '@/components/QuickActions';
import RecentActivity from '@/components/RecentActivity';

const Index = () => {
  // This would typically come from authentication context
  const userRole = 'slp'; // or 'admin'
  const userName = 'Dr. Sarah Johnson';

  // Time-aware greeting
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-gray-25">
        <AppSidebar userRole={userRole} userName={userName} />
        
        <SidebarInset className="flex-1">
          <Header userRole={userRole} userName={userName} />
          
          <main className="flex-1 p-6 lg:p-8">
            {/* Welcome Section with enhanced layout */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h1 className="text-2xl lg:text-3xl font-semibold text-gray-900 mb-2 tracking-tight">
                    {getGreeting()}, {userName.split(' ')[1]}!
                  </h1>
                  <p className="text-base lg:text-lg text-gray-600 font-medium">
                    Here's what's happening with your students today.
                  </p>
                </div>
                <div className="hidden lg:block">
                  <div className="text-right">
                    <p className="text-sm text-gray-500">Today</p>
                    <p className="text-lg font-semibold text-gray-900">
                      {new Date().toLocaleDateString('en-US', { 
                        weekday: 'long', 
                        month: 'short', 
                        day: 'numeric' 
                      })}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Dashboard Stats */}
            <DashboardStats />

            {/* Quick Actions */}
            <QuickActions />

            {/* Recent Activity */}
            <RecentActivity />
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};

export default Index;
