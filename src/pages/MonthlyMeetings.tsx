import React from 'react'
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar'
import AppSidebar from '@/components/AppSidebar'
import Header from '@/components/Header'
import { useOrganization } from '@/contexts/OrganizationContext'

const MonthlyMeetingsContent = () => {
  const { userProfile } = useOrganization()

  const userRole = userProfile?.role || 'slp'
  const userName = userProfile ? `${userProfile.first_name} ${userProfile.last_name}` : 'User'

  return (
    <SidebarProvider>
      <div className='min-h-screen flex w-full bg-gray-25 overflow-hidden'>
        <AppSidebar userRole={userRole} userName={userName} className='font-medium' />

        <SidebarInset className='flex-1 overflow-hidden'>
          <Header userRole={userRole} userName={userName} userProfile={userProfile} />

          <main className='flex-1 p-4 md:p-6 lg:p-8 pb-8 overflow-x-hidden max-w-full'>
            <div className='space-y-6'>
              <div>
                <h1 className='text-3xl font-semibold text-gray-900'>Monthly Meetings</h1>
                <p className='text-sm text-gray-500 mt-1'>View and manage monthly meetings</p>
              </div>

              {/* Add your monthly meetings content here */}
              <div className='bg-white rounded-lg border border-gray-200 p-6'>
                <p className='text-gray-600'>Monthly meetings content will be displayed here.</p>
              </div>
            </div>
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  )
}

const MonthlyMeetings = () => {
  return <MonthlyMeetingsContent />
}

export default MonthlyMeetings
