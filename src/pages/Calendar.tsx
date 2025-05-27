
import React, { useState } from 'react';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import AppSidebar from '@/components/AppSidebar';
import Header from '@/components/Header';
import BottomNavigation from '@/components/BottomNavigation';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { OrganizationProvider, useOrganization } from '@/contexts/OrganizationContext';
import CalendarSidebar from '@/components/calendar/CalendarSidebar';
import ScheduleList from '@/components/calendar/ScheduleList';

const CalendarContent = () => {
  const { userProfile } = useOrganization();
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());

  const userRole = userProfile?.role || 'slp';
  const userName = userProfile ? `${userProfile.first_name} ${userProfile.last_name}` : 'Dr. Sarah Johnson';

  const mockEvents = [
    {
      id: 1,
      title: "Speech Screening",
      student: "Emma Thompson",
      time: "09:00 AM",
      duration: "30 min",
      type: "screening",
      status: "scheduled"
    },
    {
      id: 2,
      title: "Progress Review", 
      student: "Math Johnson",
      time: "10:30 AM",
      duration: "45 min",
      type: "review",
      status: "in_progress"
    },
    {
      id: 3,
      title: "Hearing Assessment",
      student: "Sarah Davis",
      time: "02:00 PM", 
      duration: "30 min",
      type: "assessment",
      status: "scheduled"
    }
  ];

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-gray-50">
        <AppSidebar userRole={userRole} userName={userName} />
        
        <SidebarInset className="flex-1">
          <Header userRole={userRole} userName={userName} />
          
          <main className="flex-1 p-3 md:p-6 pb-20 md:pb-8 overflow-x-hidden">
            {/* Page Header */}
            <div className="mb-4 md:mb-6">
              <h1 className="text-xl md:text-2xl font-semibold text-gray-900 mb-2">Calendar</h1>
              <p className="text-gray-600 text-sm md:text-base mb-4">Schedule and manage screening appointments</p>
              
              <Button className="bg-blue-600 hover:bg-blue-700 text-white w-full sm:w-auto">
                <Plus className="w-4 h-4 mr-2" />
                New Appointment
              </Button>
            </div>

            {/* Main Content - Stack on mobile, side by side on desktop */}
            <div className="flex flex-col lg:flex-row gap-4 md:gap-6">
              <CalendarSidebar 
                selectedDate={selectedDate} 
                onSelectDate={setSelectedDate} 
              />
              <ScheduleList 
                selectedDate={selectedDate} 
                events={mockEvents} 
              />
            </div>
          </main>
        </SidebarInset>
        
        <BottomNavigation />
      </div>
    </SidebarProvider>
  );
};

const Calendar = () => {
  return (
    <OrganizationProvider>
      <CalendarContent />
    </OrganizationProvider>
  );
};

export default Calendar;
