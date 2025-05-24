
import React from 'react';
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
    <div className="min-h-screen bg-gray-25">
      <Header userRole={userRole} userName={userName} />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section with enhanced typography */}
        <div className="mb-10">
          <h2 className="text-3xl font-semibold text-gray-900 mb-3 tracking-tight">
            {getGreeting()}, {userName.split(' ')[1]}!
          </h2>
          <p className="text-lg text-gray-600 font-medium">
            Here's what's happening with your students today.
          </p>
        </div>

        {/* Dashboard Stats */}
        <DashboardStats />

        {/* Quick Actions */}
        <QuickActions />

        {/* Recent Activity */}
        <RecentActivity />
      </main>
    </div>
  );
};

export default Index;
