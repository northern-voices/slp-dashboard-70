
import React, { useState } from 'react';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import AppSidebar from '@/components/AppSidebar';
import Header from '@/components/Header';
import BottomNavigation from '@/components/BottomNavigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CalendarDays, Download, FileText, Filter, Search } from 'lucide-react';
import { OrganizationProvider, useOrganization } from '@/contexts/OrganizationContext';

const ReportsContent = () => {
  const { userProfile } = useOrganization();
  const [selectedTimeframe, setSelectedTimeframe] = useState('this_month');
  const [selectedReportType, setSelectedReportType] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  const userRole = userProfile?.role || 'slp';
  const userName = userProfile ? `${userProfile.first_name} ${userProfile.last_name}` : 'Dr. Sarah Johnson';

  const mockReports = [
    {
      id: 1,
      title: "Monthly Screening Summary - November 2024",
      type: "summary",
      date: "2024-11-01",
      status: "completed",
      studentCount: 45,
      description: "Comprehensive screening results for all students"
    },
    {
      id: 2,
      title: "Individual Report - Emma Thompson",
      type: "individual",
      date: "2024-11-15",
      status: "completed",
      description: "Speech screening assessment results"
    },
    {
      id: 3,
      title: "Progress Report - Math Johnson",
      type: "progress",
      date: "2024-11-20",
      status: "draft",
      description: "6-month progress evaluation"
    }
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge variant="default" className="bg-green-100 text-green-800">Completed</Badge>;
      case 'draft':
        return <Badge variant="outline">Draft</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getReportTypeIcon = (type: string) => {
    switch (type) {
      case 'summary':
        return <FileText className="w-4 h-4 text-blue-600" />;
      case 'individual':
        return <FileText className="w-4 h-4 text-green-600" />;
      case 'progress':
        return <FileText className="w-4 h-4 text-purple-600" />;
      default:
        return <FileText className="w-4 h-4" />;
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
              <h1 className="text-xl md:text-2xl lg:text-3xl font-semibold text-gray-900 mb-2">Reports</h1>
              <p className="text-gray-600 text-sm md:text-base">Generate and manage screening reports and assessments</p>
            </div>

            {/* Mobile-Optimized Filters and Actions */}
            <div className="space-y-4 mb-6">
              {/* Row 1: Timeframe and Report Type */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="timeframe" className="text-sm font-medium">Timeframe</Label>
                  <Select value={selectedTimeframe} onValueChange={setSelectedTimeframe}>
                    <SelectTrigger className="h-11">
                      <SelectValue placeholder="Select timeframe" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="this_week">This Week</SelectItem>
                      <SelectItem value="this_month">This Month</SelectItem>
                      <SelectItem value="last_month">Last Month</SelectItem>
                      <SelectItem value="this_year">This Year</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="report_type" className="text-sm font-medium">Report Type</Label>
                  <Select value={selectedReportType} onValueChange={setSelectedReportType}>
                    <SelectTrigger className="h-11">
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Reports</SelectItem>
                      <SelectItem value="summary">Summary Reports</SelectItem>
                      <SelectItem value="individual">Individual Reports</SelectItem>
                      <SelectItem value="progress">Progress Reports</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Row 2: Search */}
              <div className="space-y-2">
                <Label htmlFor="search" className="text-sm font-medium">Search Reports</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    id="search"
                    placeholder="Search by student name..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 h-11"
                  />
                </div>
              </div>

              {/* Row 3: Apply Filters Button */}
              <Button className="w-full h-11">
                <Filter className="w-4 h-4 mr-2" />
                Apply Filters
              </Button>
            </div>

            {/* Mobile-Optimized Quick Actions */}
            <div className="space-y-4 mb-8">
              <Card className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">Generate Summary Report</CardTitle>
                  <CardDescription>Create comprehensive reports for multiple students</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button className="w-full h-11">Generate Report</Button>
                </CardContent>
              </Card>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Card className="hover:shadow-md transition-shadow">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg">Export Data</CardTitle>
                    <CardDescription>Download screening data in various formats</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button variant="outline" className="w-full h-11">
                      <Download className="w-4 h-4 mr-2" />
                      Export CSV
                    </Button>
                  </CardContent>
                </Card>

                <Card className="hover:shadow-md transition-shadow">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg">Schedule Reports</CardTitle>
                    <CardDescription>Set up automated report generation</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button variant="outline" className="w-full h-11">
                      <CalendarDays className="w-4 h-4 mr-2" />
                      Schedule
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Mobile-Optimized Reports List */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Reports</CardTitle>
                <CardDescription>Your generated reports and assessments</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {mockReports.map((report) => (
                    <div key={report.id} className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-4 border rounded-lg hover:bg-gray-50 space-y-3 sm:space-y-0">
                      <div className="flex items-start space-x-4">
                        <div className="flex-shrink-0 mt-1">
                          {getReportTypeIcon(report.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-medium text-gray-900 break-words">{report.title}</h3>
                          <p className="text-sm text-gray-600 break-words">{report.description}</p>
                          <div className="flex flex-wrap items-center gap-2 mt-2">
                            <span className="text-xs text-gray-500">{report.date}</span>
                            {report.studentCount && (
                              <span className="text-xs text-gray-500">• {report.studentCount} students</span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center justify-between sm:justify-end space-x-3 sm:flex-col sm:space-x-0 sm:space-y-2 lg:flex-row lg:space-y-0 lg:space-x-3">
                        {getStatusBadge(report.status)}
                        <Button variant="outline" size="sm" className="h-9">
                          <Download className="w-4 h-4 mr-2" />
                          Download
                        </Button>
                      </div>
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

const Reports = () => {
  return (
    <OrganizationProvider>
      <ReportsContent />
    </OrganizationProvider>
  );
};

export default Reports;
