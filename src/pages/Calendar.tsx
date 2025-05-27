
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
        return <Badge className="bg-blue-100 text-blue-800">Screening</Badge>;
      case 'review':
        return <Badge className="bg-green-100 text-green-800">Review</Badge>;
      case 'assessment':
        return <Badge className="bg-purple-100 text-purple-800">Assessment</Badge>;
      default:
        return <Badge variant="secondary">{type}</Badge>;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'scheduled':
        return <Badge variant="outline">Scheduled</Badge>;
      case 'in_progress':
        return <Badge className="bg-yellow-100 text-yellow-800">In Progress</Badge>;
      case 'completed':
        return <Badge className="bg-green-100 text-green-800">Completed</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-gray-25">
        <AppSidebar userRole={userRole} userName={userName} />
        
        <SidebarInset className="flex-1">
          <Header userRole={userRole} userName={userName} />
          
          <main className="flex-1 p-4 md:p-6 lg:p-8 pb-20 md:pb-8">
            <div className="mb-6 md:mb-8">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h1 className="text-xl md:text-2xl lg:text-3xl font-semibold text-gray-900 mb-2">Calendar</h1>
                  <p className="text-gray-600 text-sm md:text-base">Schedule and manage screening appointments</p>
                </div>
                <Button className="w-full md:w-auto">
                  <Plus className="w-4 h-4 mr-2" />
                  New Appointment
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Calendar Component */}
              <Card className="lg:col-span-1">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <CalendarDays className="w-5 h-5 mr-2" />
                    Schedule
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <CalendarComponent
                    mode="single"
                    selected={selectedDate}
                    onSelect={setSelectedDate}
                    className="rounded-md border"
                  />
                  
                  <div className="mt-4 space-y-2">
                    <h4 className="font-medium text-sm text-gray-900">Quick Actions</h4>
                    <div className="space-y-2">
                      <Button variant="outline" size="sm" className="w-full justify-start">
                        <Plus className="w-4 h-4 mr-2" />
                        Schedule Screening
                      </Button>
                      <Button variant="outline" size="sm" className="w-full justify-start">
                        <User className="w-4 h-4 mr-2" />
                        Book Follow-up
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Today's Schedule */}
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle>Today's Schedule</CardTitle>
                  <CardDescription>
                    {selectedDate ? selectedDate.toDateString() : 'Select a date to view schedule'}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {mockEvents.map((event) => (
                      <div key={event.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                        <div className="flex items-center space-x-4">
                          <div className="flex flex-col items-center">
                            <Clock className="w-4 h-4 text-gray-400" />
                            <span className="text-sm font-medium text-gray-900">{event.time}</span>
                            <span className="text-xs text-gray-500">{event.duration}</span>
                          </div>
                          <div className="flex-1">
                            <h3 className="font-medium text-gray-900">{event.title}</h3>
                            <p className="text-sm text-gray-600">Student: {event.student}</p>
                            <div className="flex items-center space-x-2 mt-2">
                              {getEventTypeBadge(event.type)}
                              {getStatusBadge(event.status)}
                            </div>
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          <Button variant="outline" size="sm">Edit</Button>
                          <Button variant="outline" size="sm">Start</Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Upcoming Appointments */}
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Upcoming This Week</CardTitle>
                <CardDescription>Your scheduled appointments for the next 7 days</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {[1, 2, 3, 4, 5, 6].map((day) => (
                    <div key={day} className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium">Dec {day + 1}</h4>
                        <Badge variant="outline">{Math.floor(Math.random() * 5) + 1} appointments</Badge>
                      </div>
                      <p className="text-sm text-gray-600">
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
