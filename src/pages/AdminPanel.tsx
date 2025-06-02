
import React, { useState } from 'react';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import AppSidebar from '@/components/AppSidebar';
import Header from '@/components/Header';
import BottomNavigation from '@/components/BottomNavigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Settings, Database, Shield, Bell, FileText, Activity, Server, Key, Users, UserPlus, Upload, Download } from 'lucide-react';
import { OrganizationProvider, useOrganization } from '@/contexts/OrganizationContext';
import AdminSystemSettings from '@/components/admin/AdminSystemSettings';
import AdminSecuritySettings from '@/components/admin/AdminSecuritySettings';
import UsersTable from '@/components/management/UsersTable';
import UserInviteModal from '@/components/management/UserInviteModal';
import UserEditModal from '@/components/users/UserEditModal';
import UsersBulkActions from '@/components/users/UsersBulkActions';

const AdminPanelContent = () => {
  const { userProfile } = useOrganization();
  
  const userRole = userProfile?.role || 'admin';
  const userName = userProfile ? `${userProfile.first_name} ${userProfile.last_name}` : 'Dr. Sarah Johnson';

  // User Management State
  const [userInviteOpen, setUserInviteOpen] = useState(false);
  const [userEditOpen, setUserEditOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);

  const [mockUsers, setMockUsers] = useState([
    {
      id: "1",
      name: "Dr. Sarah Johnson",
      email: "sarah.johnson@district.edu",
      schools: ["Lincoln Elementary", "Roosevelt High"],
      role: "admin",
      status: "active",
      lastActive: "2024-11-20",
      licenseNumber: "ADMIN-12345"
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
    },
    {
      id: "3",
      name: "Dr. Michael Rodriguez",
      email: "m.rodriguez@district.edu",
      schools: ["Lincoln Elementary"],
      role: "slp",
      status: "active",
      lastActive: "2024-11-18",
      licenseNumber: "SLP-11111"
    },
    {
      id: "4",
      name: "Ms. Jessica Taylor",
      email: "j.taylor@district.edu",
      schools: [],
      role: "slp",
      status: "pending",
      lastActive: "Never",
      licenseNumber: "SLP-22222"
    }
  ]);

  // User Management Handlers
  const handleInviteUser = (userData: any) => {
    const newUser = {
      id: (mockUsers.length + 1).toString(),
      name: `${userData.firstName} ${userData.lastName}`,
      email: userData.email,
      role: userData.role,
      status: 'pending',
      schools: userData.selectedSchools.map((id: string) => 
        `School ${id}`
      ).filter(Boolean),
      lastActive: 'Never',
      licenseNumber: userData.licenseNumber
    };
    setMockUsers(prev => [...prev, newUser]);
  };

  const handleEditUser = (user: any) => {
    setEditingUser(user);
    setUserEditOpen(true);
  };

  const handleUpdateUser = (userData: any) => {
    setMockUsers(prev => prev.map(user => 
      user.id === editingUser?.id ? { ...user, ...userData } : user
    ));
    setEditingUser(null);
  };

  const handleDeactivateUser = (userId: string) => {
    setMockUsers(prev => prev.map(user => 
      user.id === userId 
        ? { ...user, status: user.status === 'active' ? 'inactive' : 'active' }
        : user
    ));
  };

  const handleResendInvite = (userId: string) => {
    console.log('Resend invite to user:', userId);
  };

  const handleBulkAction = (action: string, userIds: string[]) => {
    console.log(`Bulk ${action} for users:`, userIds);
    setSelectedUsers([]);
  };

  // Only allow admin access
  if (userRole !== 'admin') {
    return (
      <SidebarProvider>
        <div className="min-h-screen flex w-full bg-gray-25">
          <AppSidebar userRole={userRole} userName={userName} />
          
          <SidebarInset className="flex-1">
            <Header userRole={userRole} userName={userName} />
            
            <main className="flex-1 p-4 md:p-6 lg:p-8 pb-20 md:pb-8">
              <div className="text-center py-12">
                <Shield className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h1 className="text-2xl font-semibold text-gray-900 mb-2">Admin Access Required</h1>
                <p className="text-gray-600">You need administrator privileges to access this panel.</p>
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
              <h1 className="text-xl md:text-2xl lg:text-3xl font-semibold text-gray-900 mb-2">Admin Panel</h1>
              <p className="text-gray-600 text-sm md:text-base">System administration and configuration</p>
            </div>

            <Tabs defaultValue="system" className="space-y-6">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="system" className="flex items-center">
                  <Settings className="w-4 h-4 mr-2" />
                  System
                </TabsTrigger>
                <TabsTrigger value="security" className="flex items-center">
                  <Shield className="w-4 h-4 mr-2" />
                  Security
                </TabsTrigger>
                <TabsTrigger value="database" className="flex items-center">
                  <Database className="w-4 h-4 mr-2" />
                  Database
                </TabsTrigger>
                <TabsTrigger value="users" className="flex items-center">
                  <Users className="w-4 h-4 mr-2" />
                  Users
                </TabsTrigger>
              </TabsList>

              <TabsContent value="system" className="space-y-6">
                <AdminSystemSettings />
              </TabsContent>

              <TabsContent value="security" className="space-y-6">
                <AdminSecuritySettings />
              </TabsContent>

              <TabsContent value="database" className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <Database className="w-5 h-5 mr-2" />
                        Database Status
                      </CardTitle>
                      <CardDescription>Monitor database health and performance</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span>Status:</span>
                          <span className="text-green-600 font-medium">Online</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Connections:</span>
                          <span>24/100</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Storage Used:</span>
                          <span>2.3 GB / 10 GB</span>
                        </div>
                      </div>
                      <Button className="w-full mt-4" variant="outline">
                        View Details
                      </Button>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <Server className="w-5 h-5 mr-2" />
                        Backup Management
                      </CardTitle>
                      <CardDescription>Manage database backups and restoration</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span>Last Backup:</span>
                          <span>2 hours ago</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Backup Size:</span>
                          <span>1.8 GB</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Retention:</span>
                          <span>30 days</span>
                        </div>
                      </div>
                      <div className="flex gap-2 mt-4">
                        <Button className="flex-1" variant="outline">
                          Create Backup
                        </Button>
                        <Button className="flex-1" variant="outline">
                          Restore
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="users" className="space-y-6">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900 mb-2">User Management</h2>
                    <p className="text-gray-600 text-sm">Manage users, roles, and permissions across your organization</p>
                  </div>
                  
                  <div className="flex flex-wrap gap-2">
                    <Button onClick={() => setUserInviteOpen(true)}>
                      <UserPlus className="w-4 h-4 mr-2" />
                      Invite User
                    </Button>
                    <Button variant="outline">
                      <Upload className="w-4 h-4 mr-2" />
                      Import Users
                    </Button>
                    <Button variant="outline">
                      <Download className="w-4 h-4 mr-2" />
                      Export Users
                    </Button>
                  </div>
                </div>

                {selectedUsers.length > 0 && (
                  <UsersBulkActions 
                    selectedCount={selectedUsers.length}
                    onBulkAction={handleBulkAction}
                    selectedUsers={selectedUsers}
                  />
                )}

                <UsersTable 
                  users={mockUsers}
                  onEditUser={handleEditUser}
                  onDeactivateUser={handleDeactivateUser}
                  onResendInvite={handleResendInvite}
                  selectedUsers={selectedUsers}
                  onSelectionChange={setSelectedUsers}
                />
              </TabsContent>
            </Tabs>
          </main>
        </SidebarInset>
        
        <BottomNavigation />
      </div>

      {/* User Management Modals */}
      <UserInviteModal
        isOpen={userInviteOpen}
        onClose={() => setUserInviteOpen(false)}
        onInvite={handleInviteUser}
      />

      <UserEditModal
        isOpen={userEditOpen}
        onClose={() => {
          setUserEditOpen(false);
          setEditingUser(null);
        }}
        user={editingUser}
        onUpdate={handleUpdateUser}
      />
    </SidebarProvider>
  );
};

const AdminPanel = () => {
  return (
    <OrganizationProvider>
      <AdminPanelContent />
    </OrganizationProvider>
  );
};

export default AdminPanel;
