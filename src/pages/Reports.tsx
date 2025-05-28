import React, { useState } from 'react';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import AppSidebar from '@/components/AppSidebar';
import Header from '@/components/Header';
import BottomNavigation from '@/components/BottomNavigation';
import { OrganizationProvider, useOrganization } from '@/contexts/OrganizationContext';
import ScheduleReportsModal from '@/components/reports/ScheduleReportsModal';
import ScheduleReportsHero from '@/components/reports/ScheduleReportsHero';
import ReportsFilters from '@/components/reports/ReportsFilters';
import ReportsQuickActions from '@/components/reports/ReportsQuickActions';
import ReportsTable from '@/components/reports/ReportsTable';
const ReportsContent = () => {
  const {
    userProfile
  } = useOrganization();
  const [selectedTimeframe, setSelectedTimeframe] = useState('last_month');
  const [selectedReportType, setSelectedReportType] = useState('individual');
  const [searchTerm, setSearchTerm] = useState('');
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const userRole = userProfile?.role || 'slp';
  const userName = userProfile ? `${userProfile.first_name} ${userProfile.last_name}` : 'Dr. Sarah Johnson';
  const mockReports = [{
    id: 1,
    title: "Monthly Screening Summary - November 2024",
    type: "summary",
    date: "2024-11-01",
    status: "completed",
    studentCount: 45,
    description: "Comprehensive screening results for all students"
  }, {
    id: 2,
    title: "Individual Report - Emma Thompson",
    type: "individual",
    date: "2024-11-15",
    status: "completed",
    description: "Speech screening assessment results"
  }, {
    id: 3,
    title: "Progress Report - Math Johnson",
    type: "progress",
    date: "2024-11-20",
    status: "draft",
    description: "6-month progress evaluation"
  }];
  return <SidebarProvider>
      <div className="min-h-screen flex w-full bg-gray-25">
        <AppSidebar userRole={userRole} userName={userName} className="font-medium" />
        
        <SidebarInset className="flex-1">
          <Header userRole={userRole} userName={userName} />
          
          <main className="flex-1 p-4 md:p-6 lg:p-8 pb-20 md:pb-8">
            <div className="mb-8">
              <h1 className="text-2xl md:text-3xl text-gray-900 mb-2 font-medium">Reports</h1>
              <p className="text-gray-600 text-base">Generate and manage screening reports and assessments</p>
            </div>

            <ScheduleReportsHero onScheduleClick={() => setShowScheduleModal(true)} />

            <ReportsFilters selectedTimeframe={selectedTimeframe} setSelectedTimeframe={setSelectedTimeframe} selectedReportType={selectedReportType} setSelectedReportType={setSelectedReportType} searchTerm={searchTerm} setSearchTerm={setSearchTerm} />

            <ReportsQuickActions />

            <ReportsTable reports={mockReports} />
          </main>
        </SidebarInset>
        
        <BottomNavigation />
        
        <ScheduleReportsModal open={showScheduleModal} onOpenChange={setShowScheduleModal} />
      </div>
    </SidebarProvider>;
};
const Reports = () => {
  return <OrganizationProvider>
      <ReportsContent />
    </OrganizationProvider>;
};
export default Reports;