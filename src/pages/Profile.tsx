
import React from 'react';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import AppSidebar from '@/components/AppSidebar';
import Header from '@/components/Header';
import BottomNavigation from '@/components/BottomNavigation';
import { OrganizationProvider, useOrganization } from '@/contexts/OrganizationContext';
import PageHeader from '@/components/layout/PageHeader';
import PersonalInformationSection from '@/components/profile/PersonalInformationSection';
import AccountSettingsSection from '@/components/profile/AccountSettingsSection';
import ProfessionalInformationSection from '@/components/profile/ProfessionalInformationSection';
import NotificationPreferencesSection from '@/components/profile/NotificationPreferencesSection';
import ActivitySecuritySection from '@/components/profile/ActivitySecuritySection';

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
            <PageHeader 
              title="Profile Settings"
              description="Manage your account information, security settings, and preferences"
            />

            <div className="space-y-6">
              <PersonalInformationSection />
              <AccountSettingsSection />
              <ProfessionalInformationSection />
              <NotificationPreferencesSection />
              <ActivitySecuritySection />
            </div>
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
