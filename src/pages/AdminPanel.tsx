
import React, { useState } from 'react';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import AppSidebar from '@/components/AppSidebar';
import Header from '@/components/Header';
import BottomNavigation from '@/components/BottomNavigation';
import { Button } from '@/components/ui/button';
import { Shield, Users, UserPlus, Upload, Download } from 'lucide-react';
import { OrganizationProvider, useOrganization } from '@/contexts/OrganizationContext';
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
              <p className="text-gray-600 text-sm md:text-base">Manage users, roles, and permissions across your organization</p>
            </div>

            <div className="space-y-6">
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
            </div>
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
