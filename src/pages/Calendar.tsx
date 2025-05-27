
import React, { useState } from 'react';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import AppSidebar from '@/components/AppSidebar';
import Header from '@/components/Header';
import BottomNavigation from '@/components/BottomNavigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
        return <Badge className="bg-blue-100 text-blue-700 text-xs font-medium">Screening</Badge>;
      case 'review':
        return <Badge className="bg-green-100 text-green-700 text-xs font-medium">Review</Badge>;
      case 'assessment':
        return <Badge className="bg-purple-100 text-purple-700 text-xs font-medium">Assessment</Badge>;
      default:
        return <Badge variant="secondary" className="text-xs">{type}</Badge>;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'scheduled':
        return <Badge variant="outline" className="text-xs border-gray-300 text-gray-600">Scheduled</Badge>;
      case 'in_progress':
        return <Badge className="bg-yellow-100 text-yellow-700 text-xs font-medium">In Progress</Badge>;
      case 'completed':
        return <Badge className="bg-green-100 text-green-700 text-xs font-medium">Completed</Badge>;
      default:
        return <Badge variant="secondary" className="text-xs">{status}</Badge>;
    }
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-gray-50">
        <AppSidebar userRole={userRole} userName={userName} />
        
        <SidebarInset className="flex-1">
          <Header userRole={userRole} userName={userName} />
          
          <main className="flex-1 p-6 pb-20 md:pb-8">
            {/* Page Header */}
            <div className="mb-8">
              <h1 className="text-2xl font-semibold text-gray-900 mb-2">Calendar</h1>
              <p className="text-gray-600 mb-6">Schedule and manage screening appointments</p>
              
              <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                <Plus className="w-4 h-4 mr-2" />
                New Appointment
              </Button>
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Schedule Section */}
              <div className="lg:col-span-1">
                <Card className="shadow-sm border-gray-200">
                  <CardHeader className="pb-4">
                    <CardTitle className="flex items-center text-lg font-semibold text-gray-900">
                      <CalendarDays className="w-5 h-5 mr-2 text-blue-600" />
                      Schedule
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Calendar Component */}
                    <div className="bg-white rounded-lg border border-gray-100">
                      <CalendarComponent
                        mode="single"
                        selected={selectedDate}
                        onSelect={setSelectedDate}
                        className="w-full"
                      />
                    </div>
                    
                    {/* Quick Actions */}
                    <div className="space-y-4">
                      <h4 className="font-semibold text-sm text-gray-900">Quick Actions</h4>
                      <div className="space-y-3">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="w-full justify-start text-left border-gray-200 hover:bg-blue-50 hover:border-blue-300"
                        >
                          <Plus className="w-4 h-4 mr-3 text-blue-600" />
                          <span className="text-gray-700">Schedule Screening</span>
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="w-full justify-start text-left border-gray-200 hover:bg-green-50 hover:border-green-300"
                        >
                          <User className="w-4 h-4 mr-3 text-green-600" />
                          <span className="text-gray-700">Book Follow-up</span>
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Today's Schedule */}
              <div className="lg:col-span-2">
                <Card className="shadow-sm border-gray-200">
                  <CardHeader className="pb-4">
                    <CardTitle className="text-lg font-semibold text-gray-900">Today's Schedule</CardTitle>
                    <p className="text-sm text-gray-600 mt-1">
                      {selectedDate ? selectedDate.toLocaleDateString('en-US', { 
                        weekday: 'long', 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                      }) : 'Select a date to view schedule'}
                    </p>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {mockEvents.map((event) => (
                        <div key={event.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                          <div className="flex items-center space-x-4">
                            {/* Time */}
                            <div className="flex items-center text-blue-600">
                              <Clock className="w-4 h-4 mr-2" />
                              <span className="font-semibold text-sm">{event.time}</span>
                              <span className="text-xs text-gray-500 ml-2">({event.duration})</span>
                            </div>
                            
                            {/* Event Details */}
                            <div className="flex-1">
                              <h3 className="font-semibold text-gray-900 text-sm mb-1">{event.title}</h3>
                              <p className="text-xs text-gray-600">Student: {event.student}</p>
                            </div>
                            
                            {/* Badges */}
                            <div className="flex items-center space-x-2">
                              {getEventTypeBadge(event.type)}
                              {getStatusBadge(event.status)}
                            </div>
                          </div>
                          
                          {/* Actions */}
                          <div className="flex items-center space-x-2 ml-4">
                            <Button variant="outline" size="sm" className="border-gray-200 hover:bg-gray-50">
                              Edit
                            </Button>
                            <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                              Start
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
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
