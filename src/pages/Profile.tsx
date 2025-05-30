
import React from 'react';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import AppSidebar from '@/components/AppSidebar';
import Header from '@/components/Header';
import BottomNavigation from '@/components/BottomNavigation';
import { OrganizationProvider, useOrganization } from '@/contexts/OrganizationContext';
import PersonalInformationSection from '@/components/profile/PersonalInformationSection';
import AccountSettingsSection from '@/components/profile/AccountSettingsSection';
import ProfessionalInformationSection from '@/components/profile/ProfessionalInformationSection';
import NotificationPreferencesSection from '@/components/profile/NotificationPreferencesSection';
import ActivitySecuritySection from '@/components/profile/ActivitySecuritySection';
import { User, Settings, Briefcase, Bell, Shield } from 'lucide-react';

const ProfileContent = () => {
  const { userProfile } = useOrganization();
  const userRole = userProfile?.role || 'admin';
  const userName = userProfile ? `${userProfile.first_name} ${userProfile.last_name}` : 'Dr. Sarah Johnson';

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-gray-25">
        <AppSidebar userRole={userRole} userName={userName} />
        
        <SidebarInset className="flex-1">
          <Header userRole={userRole} userName={userName} />
          
          <main className="flex-1 p-4 md:p-6 lg:p-8 pb-20 md:pb-8">
            <div className="mb-6 md:mb-8">
              <h1 className="text-xl md:text-2xl lg:text-3xl font-semibold text-gray-900 mb-2">Profile Settings</h1>
              <p className="text-gray-600 text-sm md:text-base">Manage your account information, security settings, and preferences</p>
            </div>

            <Tabs defaultValue="personal" className="space-y-6">
              <TabsList className="grid w-full grid-cols-5">
                <TabsTrigger value="personal" className="flex items-center">
                  <User className="w-4 h-4 mr-2" />
                  Personal
                </TabsTrigger>
                <TabsTrigger value="account" className="flex items-center">
                  <Settings className="w-4 h-4 mr-2" />
                  Account
                </TabsTrigger>
                <TabsTrigger value="professional" className="flex items-center">
                  <Briefcase className="w-4 h-4 mr-2" />
                  Professional
                </TabsTrigger>
                <TabsTrigger value="notifications" className="flex items-center">
                  <Bell className="w-4 h-4 mr-2" />
                  Notifications
                </TabsTrigger>
                <TabsTrigger value="security" className="flex items-center">
                  <Shield className="w-4 h-4 mr-2" />
                  Security
                </TabsTrigger>
              </TabsList>

              <TabsContent value="personal" className="space-y-6">
                <PersonalInformationSection />
              </TabsContent>

              <TabsContent value="account" className="space-y-6">
                <AccountSettingsSection />
              </TabsContent>

              <TabsContent value="professional" className="space-y-6">
                <ProfessionalInformationSection />
              </TabsContent>

              <TabsContent value="notifications" className="space-y-6">
                <NotificationPreferencesSection />
              </TabsContent>

              <TabsContent value="security" className="space-y-6">
                <ActivitySecuritySection />
              </TabsContent>
            </Tabs>
          </main>
        </SidebarInset>
        
        <BottomNavigation />
      </div>
    </SidebarProvider>
  );
};

const Profile = () => {
  return (
    <OrganizationProvider>
      <ProfileContent />
    </OrganizationProvider>
  );
};

export default Profile;
