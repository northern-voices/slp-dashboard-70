import React, { useState } from 'react';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import AppSidebar from '@/components/AppSidebar';
import Header from '@/components/Header';
import BottomNavigation from '@/components/BottomNavigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Building2, Users, Settings, Plus, UserPlus, Search } from 'lucide-react';
import { OrganizationProvider, useOrganization } from '@/contexts/OrganizationContext';
import { Input } from '@/components/ui/input';
import ManagementStats from '@/components/management/ManagementStats';
import SchoolForm from '@/components/management/SchoolForm';
import UserInviteModal from '@/components/management/UserInviteModal';
import UsersTable from '@/components/management/UsersTable';

const ManagementContent = () => {
  const { userProfile } = useOrganization();
  const [schoolFormOpen, setSchoolFormOpen] = useState(false);
  const [userInviteOpen, setUserInviteOpen] = useState(false);
  const [editingSchool, setEditingSchool] = useState(null);
  const [schoolSearch, setSchoolSearch] = useState('');

  const userRole = userProfile?.role || 'slp';
  const userName = userProfile ? `${userProfile.first_name} ${userProfile.last_name}` : 'Dr. Sarah Johnson';

  const [mockSchools, setMockSchools] = useState([
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
  ]);

  const [mockSLPs, setMockSLPs] = useState([
    {
      id: "1",
      name: "Dr. Sarah Johnson",
      email: "sarah.johnson@district.edu",
      schools: ["Lincoln Elementary", "Roosevelt High"],
      role: "slp",
      status: "active",
      lastActive: "2024-11-20",
      licenseNumber: "SLP-12345"
    },
    {
      id: "2",
      name: "Ms. Emily Chen",
      email: "emily.chen@district.edu",
      schools: ["Washington Middle"],
      role: "supervisor",
      status: "active",
      lastActive: "2024-11-19",
      licenseNumber: "SLP-67890"
    }
  ]);

  const filteredSchools = mockSchools.filter(school =>
    school.name.toLowerCase().includes(schoolSearch.toLowerCase())
  );

  const handleSaveSchool = (schoolData: any) => {
    if (editingSchool) {
      setMockSchools(prev => prev.map(school => 
        school.id === editingSchool.id ? { ...school, ...schoolData } : school
      ));
    } else {
      const newSchool = {
        id: mockSchools.length + 1,
        ...schoolData,
        studentCount: 0,
        slpCount: 0
      };
      setMockSchools(prev => [...prev, newSchool]);
    }
    setEditingSchool(null);
  };

  const handleEditSchool = (school: any) => {
    setEditingSchool(school);
    setSchoolFormOpen(true);
  };

  const handleInviteUser = (userData: any) => {
    const newUser = {
      id: (mockSLPs.length + 1).toString(),
      name: `${userData.firstName} ${userData.lastName}`,
      email: userData.email,
      role: userData.role,
      status: 'pending',
      schools: userData.selectedSchools.map((id: string) => 
        mockSchools.find(school => school.id.toString() === id)?.name || ''
      ).filter(Boolean),
      lastActive: 'Never',
      licenseNumber: userData.licenseNumber
    };
    setMockSLPs(prev => [...prev, newUser]);
  };

  const handleEditUser = (user: any) => {
    console.log('Edit user:', user);
  };

  const handleDeactivateUser = (userId: string) => {
    setMockSLPs(prev => prev.map(user => 
      user.id === userId 
        ? { ...user, status: user.status === 'active' ? 'inactive' : 'active' }
        : user
    ));
  };

  const handleResendInvite = (userId: string) => {
    console.log('Resend invite to user:', userId);
  };

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

  // Only show management page for admin/supervisor roles
  if (userRole === 'slp') {
    return (
      <SidebarProvider>
        <div className="min-h-screen flex w-full bg-gray-25">
          <AppSidebar userRole={userRole} userName={userName} />
          
          <SidebarInset className="flex-1">
            <Header userRole={userRole} userName={userName} />
            
            <main className="flex-1 p-4 md:p-6 lg:p-8 pb-20 md:pb-8">
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
          
          <BottomNavigation />
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
          
          <main className="flex-1 p-4 md:p-6 lg:p-8 pb-20 md:pb-8">
            <div className="mb-6 md:mb-8">
              <h1 className="text-xl md:text-2xl lg:text-3xl font-semibold text-gray-900 mb-2">Management</h1>
              <p className="text-gray-600 text-sm md:text-base">Manage schools, users, and system settings</p>
            </div>

            <ManagementStats />

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
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <h2 className="text-xl font-semibold">School Management</h2>
                  <Button onClick={() => setSchoolFormOpen(true)}>
                    <Plus className="w-4 h-4 mr-2" />
                    Add School
                  </Button>
                </div>

                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Search schools..."
                    value={schoolSearch}
                    onChange={(e) => setSchoolSearch(e.target.value)}
                    className="pl-10 max-w-md"
                  />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {filteredSchools.map((school) => (
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
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleEditSchool(school)}
                          >
                            Edit
                          </Button>
                          <Button variant="outline" size="sm">View Details</Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="users" className="space-y-6">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <h2 className="text-xl font-semibold">User Management</h2>
                  <Button onClick={() => setUserInviteOpen(true)}>
                    <UserPlus className="w-4 h-4 mr-2" />
                    Invite User
                  </Button>
                </div>

                <UsersTable 
                  users={mockSLPs}
                  onEditUser={handleEditUser}
                  onDeactivateUser={handleDeactivateUser}
                  onResendInvite={handleResendInvite}
                />
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
        
        <BottomNavigation />
      </div>

      <SchoolForm
        isOpen={schoolFormOpen}
        onClose={() => {
          setSchoolFormOpen(false);
          setEditingSchool(null);
        }}
        school={editingSchool}
        onSave={handleSaveSchool}
      />

      <UserInviteModal
        isOpen={userInviteOpen}
        onClose={() => setUserInviteOpen(false)}
        onInvite={handleInviteUser}
      />
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
