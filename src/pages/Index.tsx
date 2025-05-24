
import React from 'react';
import Header from '@/components/Header';
import DashboardStats from '@/components/DashboardStats';
import QuickActions from '@/components/QuickActions';
import RecentActivity from '@/components/RecentActivity';

const Index = () => {
  // This would typically come from authentication context
  const userRole = 'slp'; // or 'admin'
  const userName = 'Dr. Sarah Johnson';

  return (
    <div className="min-h-screen bg-gray-50">
      <Header userRole={userRole} userName={userName} />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Welcome back, {userName.split(' ')[1]}!
          </h2>
          <p className="text-gray-600">
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
