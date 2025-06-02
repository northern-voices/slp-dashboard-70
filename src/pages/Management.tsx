
import React from 'react';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import AppSidebar from '@/components/AppSidebar';
import Header from '@/components/Header';
import BottomNavigation from '@/components/BottomNavigation';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Building2, Users, Settings } from 'lucide-react';
import { OrganizationProvider, useOrganization } from '@/contexts/OrganizationContext';
import ManagementStats from '@/components/management/ManagementStats';
import SchoolForm from '@/components/management/SchoolForm';
import UserInviteModal from '@/components/management/UserInviteModal';
import NotificationSettingsModal from '@/components/management/NotificationSettingsModal';
import ScreeningTemplatesModal from '@/components/management/ScreeningTemplatesModal';
import OrganizationSettingsModal from '@/components/management/OrganizationSettingsModal';
import SchoolDetailsModal from '@/components/management/SchoolDetailsModal';
import SchoolsTabContent from '@/components/management/SchoolsTabContent';
import UsersTabContent from '@/components/management/UsersTabContent';
import SettingsTabContent from '@/components/management/SettingsTabContent';
import { useManagement } from '@/hooks/useManagement';

const ManagementContent = () => {
  const { userProfile } = useOrganization();
  const {
    // State
    schoolFormOpen,
    schoolDetailsOpen,
    userInviteOpen,
    notificationSettingsOpen,
    screeningTemplatesOpen,
    organizationSettingsOpen,
    editingSchool,
    selectedSchool,
    schoolSearch,
    mockSLPs,
    filteredSchools,
    
    // Setters
    setSchoolFormOpen,
    setSchoolDetailsOpen,
    setUserInviteOpen,
    setNotificationSettingsOpen,
    setScreeningTemplatesOpen,
    setOrganizationSettingsOpen,
    setEditingSchool,
    setSelectedSchool,
    setSchoolSearch,
    
    // Handlers
    handleSaveSchool,
    handleEditSchool,
    handleViewSchoolDetails,
    handleEditFromDetails,
    handleInviteUser,
    handleEditUser,
    handleDeactivateUser,
    handleResendInvite,
    getStatusBadge
  } = useManagement();

  const userRole = userProfile?.role || 'slp';
  const userName = userProfile ? `${userProfile.first_name} ${userProfile.last_name}` : 'Dr. Sarah Johnson';

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

              <TabsContent value="schools">
                <SchoolsTabContent
                  schoolSearch={schoolSearch}
                  setSchoolSearch={setSchoolSearch}
                  filteredSchools={filteredSchools}
                  onAddSchool={() => setSchoolFormOpen(true)}
                  onEditSchool={handleEditSchool}
                  onViewSchoolDetails={handleViewSchoolDetails}
                  getStatusBadge={getStatusBadge}
                />
              </TabsContent>

              <TabsContent value="users">
                <UsersTabContent
                  mockSLPs={mockSLPs}
                  onInviteUser={() => setUserInviteOpen(true)}
                  onEditUser={handleEditUser}
                  onDeactivateUser={handleDeactivateUser}
                  onResendInvite={handleResendInvite}
                />
              </TabsContent>

              <TabsContent value="settings">
                <SettingsTabContent
                  onOpenOrganizationSettings={() => setOrganizationSettingsOpen(true)}
                  onOpenScreeningTemplates={() => setScreeningTemplatesOpen(true)}
                  onOpenNotificationSettings={() => setNotificationSettingsOpen(true)}
                />
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

      <SchoolDetailsModal
        isOpen={schoolDetailsOpen}
        onClose={() => {
          setSchoolDetailsOpen(false);
          setSelectedSchool(null);
        }}
        school={selectedSchool}
        onEdit={handleEditFromDetails}
      />

      <UserInviteModal
        isOpen={userInviteOpen}
        onClose={() => setUserInviteOpen(false)}
        onInvite={handleInviteUser}
      />

      <NotificationSettingsModal
        isOpen={notificationSettingsOpen}
        onClose={() => setNotificationSettingsOpen(false)}
      />

      <ScreeningTemplatesModal
        isOpen={screeningTemplatesOpen}
        onClose={() => setScreeningTemplatesOpen(false)}
      />

      <OrganizationSettingsModal
        isOpen={organizationSettingsOpen}
        onClose={() => setOrganizationSettingsOpen(false)}
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
