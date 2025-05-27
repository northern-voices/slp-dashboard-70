
import React, { useState } from 'react';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import AppSidebar from '@/components/AppSidebar';
import Header from '@/components/Header';
import BottomNavigation from '@/components/BottomNavigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { CalendarDays, Clock, Plus, User } from 'lucide-react';
import { OrganizationProvider, useOrganization } from '@/contexts/OrganizationContext';

const CalendarContent = () => {
  const { userProfile } = useOrganization();
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());

  const userRole = userProfile?.role || 'slp';
  const userName = userProfile ? `${userProfile.first_name} ${userProfile.last_name}` : 'Dr. Sarah Johnson';

  const mockEvents = [
    {
      id: 1,
      title: "Speech Screening - Emma Thompson",
      time: "09:00 AM",
      duration: "30 min",
      type: "screening",
      student: "Emma Thompson",
      status: "scheduled"
    },
    {
      id: 2,
      title: "Progress Review - Math Johnson",
      time: "10:30 AM",
      duration: "45 min",
      type: "review",
      student: "Math Johnson",
      status: "in_progress"
    },
    {
      id: 3,
      title: "Hearing Assessment - Sarah Davis",
      time: "02:00 PM",
      duration: "30 min",
      type: "assessment",
      student: "Sarah Davis",
      status: "scheduled"
    }
  ];

  const getEventTypeBadge = (type: string) => {
    switch (type) {
      case 'screening':
        return <Badge className="bg-blue-100 text-blue-800 text-xs">Screening</Badge>;
      case 'review':
        return <Badge className="bg-green-100 text-green-800 text-xs">Review</Badge>;
      case 'assessment':
        return <Badge className="bg-purple-100 text-purple-800 text-xs">Assessment</Badge>;
      default:
        return <Badge variant="secondary" className="text-xs">{type}</Badge>;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'scheduled':
        return <Badge variant="outline" className="text-xs">Scheduled</Badge>;
      case 'in_progress':
        return <Badge className="bg-yellow-100 text-yellow-800 text-xs">In Progress</Badge>;
      case 'completed':
        return <Badge className="bg-green-100 text-green-800 text-xs">Completed</Badge>;
      default:
        return <Badge variant="secondary" className="text-xs">{status}</Badge>;
    }
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-gray-25">
        <AppSidebar userRole={userRole} userName={userName} />
        
        <SidebarInset className="flex-1">
          <Header userRole={userRole} userName={userName} />
          
          <main className="flex-1 p-4 md:p-6 lg:p-8 pb-20 md:pb-8">
            {/* Mobile-optimized header */}
            <div className="mb-6">
              <h1 className="text-xl md:text-2xl font-semibold text-gray-900 mb-2">Calendar</h1>
              <p className="text-gray-600 text-sm md:text-base mb-4">Schedule and manage screening appointments</p>
              
              {/* Mobile-first New Appointment button */}
              <Button className="w-full md:w-auto h-12 md:h-10 bg-blue-600 hover:bg-blue-700">
                <Plus className="w-4 h-4 mr-2" />
                New Appointment
              </Button>
            </div>

            {/* Mobile-first layout - stacked on mobile, side-by-side on desktop */}
            <div className="space-y-6 lg:grid lg:grid-cols-3 lg:gap-6 lg:space-y-0">
              {/* Calendar Component - Full width on mobile */}
              <Card className="lg:col-span-1 shadow-sm border-gray-200">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center text-lg font-semibold text-gray-900">
                    <CalendarDays className="w-5 h-5 mr-2 text-blue-600" />
                    Schedule
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="bg-white rounded-lg border border-gray-200 p-1">
                    <CalendarComponent
                      mode="single"
                      selected={selectedDate}
                      onSelect={setSelectedDate}
                      className="w-full"
                    />
                  </div>
                  
                  {/* Mobile-optimized quick actions */}
                  <div className="space-y-4">
                    <h4 className="font-semibold text-sm text-gray-900">Quick Actions</h4>
                    <div className="space-y-3">
                      <Button variant="outline" size="sm" className="w-full justify-start h-12 border-gray-200 hover:bg-blue-50 hover:border-blue-300">
                        <Plus className="w-4 h-4 mr-3 text-blue-600" />
                        <span className="text-gray-700">Schedule Screening</span>
                      </Button>
                      <Button variant="outline" size="sm" className="w-full justify-start h-12 border-gray-200 hover:bg-green-50 hover:border-green-300">
                        <User className="w-4 h-4 mr-3 text-green-600" />
                        <span className="text-gray-700">Book Follow-up</span>
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Today's Schedule - Full width on mobile */}
              <Card className="lg:col-span-2 shadow-sm border-gray-200">
                <CardHeader className="pb-4">
                  <CardTitle className="text-lg font-semibold text-gray-900">Today's Schedule</CardTitle>
                  <CardDescription className="text-sm text-gray-600">
                    {selectedDate ? selectedDate.toLocaleDateString('en-US', { 
                      weekday: 'long', 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    }) : 'Select a date to view schedule'}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {mockEvents.map((event) => (
                      <div key={event.id} className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 hover:border-gray-300 transition-all duration-200">
                        {/* Mobile-first event layout */}
                        <div className="space-y-3">
                          {/* Time and duration */}
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                              <Clock className="w-4 h-4 text-blue-600" />
                              <span className="text-sm font-semibold text-gray-900">{event.time}</span>
                              <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">({event.duration})</span>
                            </div>
                          </div>
                          
                          {/* Event details */}
                          <div>
                            <h3 className="font-semibold text-gray-900 text-sm md:text-base">{event.title}</h3>
                            <p className="text-xs md:text-sm text-gray-600 mt-1">Student: {event.student}</p>
                          </div>
                          
                          {/* Badges and actions */}
                          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                            <div className="flex flex-wrap items-center gap-2">
                              {getEventTypeBadge(event.type)}
                              {getStatusBadge(event.status)}
                            </div>
                            <div className="flex gap-2">
                              <Button variant="outline" size="sm" className="flex-1 sm:flex-none h-9 border-gray-200 hover:bg-blue-50">
                                Edit
                              </Button>
                              <Button size="sm" className="flex-1 sm:flex-none h-9 bg-blue-600 hover:bg-blue-700">
                                Start
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Upcoming Appointments - Mobile optimized */}
            <Card className="mt-6 shadow-sm border-gray-200">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg font-semibold text-gray-900">Upcoming This Week</CardTitle>
                <CardDescription className="text-sm text-gray-600">Your scheduled appointments for the next 7 days</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {[1, 2, 3, 4, 5, 6].map((day) => (
                    <div key={day} className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 hover:border-gray-300 transition-all duration-200">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-semibold text-sm text-gray-900">May {day + 26}</h4>
                        <Badge variant="outline" className="text-xs border-blue-200 text-blue-700">
                          {Math.floor(Math.random() * 5) + 1} appointments
                        </Badge>
                      </div>
                      <p className="text-xs text-gray-600">
                        {day % 2 === 0 ? 'Speech screenings' : 'Progress reviews'}
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
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
