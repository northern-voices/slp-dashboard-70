
import React, { useState } from 'react';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import AppSidebar from '@/components/AppSidebar';
import Header from '@/components/Header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Building2, Users, Settings, Plus, UserPlus } from 'lucide-react';
import { OrganizationProvider, useOrganization } from '@/contexts/OrganizationContext';

const ManagementContent = () => {
  const { userProfile } = useOrganization();

  const userRole = userProfile?.role || 'slp';
  const userName = userProfile ? `${userProfile.first_name} ${userProfile.last_name}` : 'Dr. Sarah Johnson';

  const mockSchools = [
    {
      id: 1,
      name: "Lincoln Elementary School",
      address: "123 Main St, Springfield, IL",
      principal: "Dr. Jane Smith",
      studentCount: 245,
      slpCount: 2,
      status: "active"
    },
    {
      id: 2,
      name: "Washington Middle School",
      address: "456 Oak Ave, Springfield, IL",
      principal: "Mr. John Davis",
      studentCount: 380,
      slpCount: 3,
      status: "active"
    }
  ];

  const mockSLPs = [
    {
      id: 1,
      name: "Dr. Sarah Johnson",
      email: "sarah.johnson@district.edu",
      schools: ["Lincoln Elementary", "Roosevelt High"],
      role: "slp",
      status: "active",
      lastActive: "2024-11-20"
    },
    {
      id: 2,
      name: "Ms. Emily Chen",
      email: "emily.chen@district.edu",
      schools: ["Washington Middle"],
      role: "slp",
      status: "active",
      lastActive: "2024-11-19"
    }
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-100 text-green-800">Active</Badge>;
      case 'inactive':
        return <Badge variant="outline">Inactive</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'admin':
        return <Badge className="bg-purple-100 text-purple-800">Administrator</Badge>;
      case 'supervisor':
        return <Badge className="bg-blue-100 text-blue-800">Supervisor</Badge>;
      case 'slp':
        return <Badge className="bg-green-100 text-green-800">SLP</Badge>;
      default:
        return <Badge variant="secondary">{role}</Badge>;
    }
  };

  // Only show management page for admin/supervisor roles
  if (userRole === 'slp') {
    return (
      <SidebarProvider>
        <div className="min-h-screen flex w-full bg-gray-25">
          <AppSidebar userRole={userRole} userName={userName} />
          
          <SidebarInset className="flex-1">
            <Header userRole={userRole} userName={userName} />
            
            <main className="flex-1 p-6 lg:p-8">
              <div className="text-center py-12">
                <Settings className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h1 className="text-2xl font-semibold text-gray-900 mb-2">Access Restricted</h1>
                <p className="text-gray-600">You don't have permission to access management features.</p>
                <Button className="mt-4" onClick={() => window.history.back()}>
                  Go Back
                </Button>
              </div>
            </main>
          </SidebarInset>
        </div>
      </SidebarProvider>
    );
  }

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-gray-25">
        <AppSidebar userRole={userRole} userName={userName} />
        
        <SidebarInset className="flex-1">
          <Header userRole={userRole} userName={userName} />
          
          <main className="flex-1 p-6 lg:p-8">
            <div className="mb-8">
              <h1 className="text-2xl lg:text-3xl font-semibold text-gray-900 mb-2">Management</h1>
              <p className="text-gray-600">Manage schools, users, and system settings</p>
            </div>

            <Tabs defaultValue="schools" className="space-y-6">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="schools" className="flex items-center">
                  <Building2 className="w-4 h-4 mr-2" />
                  Schools
                </TabsTrigger>
                <TabsTrigger value="users" className="flex items-center">
                  <Users className="w-4 h-4 mr-2" />
                  Users
                </TabsTrigger>
                <TabsTrigger value="settings" className="flex items-center">
                  <Settings className="w-4 h-4 mr-2" />
                  Settings
                </TabsTrigger>
              </TabsList>

              <TabsContent value="schools" className="space-y-6">
                <div className="flex justify-between items-center">
                  <h2 className="text-xl font-semibold">School Management</h2>
                  <Button>
                    <Plus className="w-4 h-4 mr-2" />
                    Add School
                  </Button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {mockSchools.map((school) => (
                    <Card key={school.id} className="hover:shadow-md transition-shadow">
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-lg">{school.name}</CardTitle>
                          {getStatusBadge(school.status)}
                        </div>
                        <CardDescription>{school.address}</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          <p className="text-sm"><strong>Principal:</strong> {school.principal}</p>
                          <p className="text-sm"><strong>Students:</strong> {school.studentCount}</p>
                          <p className="text-sm"><strong>SLPs Assigned:</strong> {school.slpCount}</p>
                        </div>
                        <div className="flex space-x-2 mt-4">
                          <Button variant="outline" size="sm">Edit</Button>
                          <Button variant="outline" size="sm">View Details</Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="users" className="space-y-6">
                <div className="flex justify-between items-center">
                  <h2 className="text-xl font-semibold">User Management</h2>
                  <Button>
                    <UserPlus className="w-4 h-4 mr-2" />
                    Invite User
                  </Button>
                </div>

                <Card>
                  <CardContent className="p-0">
                    <div className="space-y-4 p-6">
                      {mockSLPs.map((slp) => (
                        <div key={slp.id} className="flex items-center justify-between p-4 border rounded-lg">
                          <div className="space-y-1">
                            <h3 className="font-medium text-gray-900">{slp.name}</h3>
                            <p className="text-sm text-gray-600">{slp.email}</p>
                            <div className="flex items-center space-x-2">
                              {getRoleBadge(slp.role)}
                              {getStatusBadge(slp.status)}
                            </div>
                            <p className="text-xs text-gray-500">
                              Schools: {slp.schools.join(', ')}
                            </p>
                            <p className="text-xs text-gray-500">
                              Last active: {slp.lastActive}
                            </p>
                          </div>
                          <div className="flex space-x-2">
                            <Button variant="outline" size="sm">Edit</Button>
                            <Button variant="outline" size="sm">Deactivate</Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="settings" className="space-y-6">
                <h2 className="text-xl font-semibold">System Settings</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Organization Settings</CardTitle>
                      <CardDescription>Manage organization-wide preferences</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Button variant="outline" className="w-full">Configure</Button>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Screening Templates</CardTitle>
                      <CardDescription>Customize screening forms and assessments</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Button variant="outline" className="w-full">Manage Templates</Button>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Notifications</CardTitle>
                      <CardDescription>Configure system notifications and alerts</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Button variant="outline" className="w-full">Settings</Button>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Data Export</CardTitle>
                      <CardDescription>Export and backup system data</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Button variant="outline" className="w-full">Export Data</Button>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
            </Tabs>
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};

const Management = () => {
  return (
    <OrganizationProvider>
      <ManagementContent />
    </OrganizationProvider>
  );
};

export default Management;
