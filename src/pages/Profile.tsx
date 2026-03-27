import React, { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import AppSidebar from '@/components/AppSidebar'
import Header from '@/components/Header'
import { OrganizationProvider, useOrganization } from '@/contexts/OrganizationContext'
import PersonalInformationSection from '@/components/profile/PersonalInformationSection'
import AccountSettingsSection from '@/components/profile/AccountSettingsSection'
import NotificationPreferencesSection from '@/components/profile/NotificationPreferencesSection'
import { User, Settings, Bell } from 'lucide-react'

const ProfileContent = () => {
  const { userProfile } = useOrganization()
  const [searchParams] = useSearchParams()
  const [activeTab, setActiveTab] = useState('personal')

  const userRole = userProfile?.role || 'admin'
  const userName = userProfile
    ? `${userProfile.first_name} ${userProfile.last_name}`
    : 'Dr. Sarah Johnson'

  console.log(userProfile, 'userProfile')

  useEffect(() => {
    const tabParam = searchParams.get('tab')
    if (tabParam && ['personal', 'account', 'notifications'].includes(tabParam)) {
      setActiveTab(tabParam)
    }
  }, [searchParams])

  return (
    <SidebarProvider>
      <div className='min-h-screen flex w-full bg-gray-25'>
        <AppSidebar userRole={userRole} userName={userName} />

        <SidebarInset className='flex-1'>
          <Header userRole={userRole} userName={userName} />

          <main className='flex-1 p-4 md:p-6 lg:p-8 pb-8'>
            <div className='mb-6 md:mb-8'>
              <h1 className='text-xl md:text-2xl lg:text-3xl font-semibold text-gray-900 mb-2'>
                Profile Settings
              </h1>
              <p className='text-gray-600 text-sm md:text-base'>
                Manage your account information and preferences
              </p>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab} className='space-y-6'>
              <TabsList className='w-full justify-start flex-wrap h-auto p-1'>
                <TabsTrigger value='personal' className='flex items-center flex-shrink-0'>
                  <User className='w-4 h-4 mr-2' />
                  Personal
                </TabsTrigger>
                <TabsTrigger value='account' className='flex items-center flex-shrink-0'>
                  <Settings className='w-4 h-4 mr-2' />
                  Account
                </TabsTrigger>
                <TabsTrigger value='notifications' className='flex items-center flex-shrink-0'>
                  <Bell className='w-4 h-4 mr-2' />
                  Notifications
                </TabsTrigger>
              </TabsList>

              <TabsContent value='personal' className='space-y-6'>
                <PersonalInformationSection />
              </TabsContent>

              <TabsContent value='account' className='space-y-6'>
                <AccountSettingsSection />
              </TabsContent>

              <TabsContent value='notifications' className='space-y-6'>
                <NotificationPreferencesSection />
              </TabsContent>
            </Tabs>
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  )
}

const Profile = () => {
  return <ProfileContent />
}

export default Profile
