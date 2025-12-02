import React from 'react'
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar'
import AppSidebar from '@/components/AppSidebar'
import Header from '@/components/Header'
import { OrganizationProvider, useOrganization } from '@/contexts/OrganizationContext'
import { useParams } from 'react-router-dom'
import HearingReportsContent from '@/components/reports/HearingReportsContent'

const HearingReportsMain = () => {
  const { userProfile } = useOrganization()
  const { reportId } = useParams()
  const userRole = userProfile?.role || 'slp'
  const userName = userProfile
    ? `${userProfile.first_name} ${userProfile.last_name}`
    : 'Dr. Sarah Johnson'

  return (
    <SidebarProvider>
      <div className='min-h-screen flex w-full bg-gray-25 overflow-hidden'>
        <AppSidebar userRole={userRole} userName={userName} className='font-medium' />

        <SidebarInset className='flex-1 overflow-hidden'>
          <Header userRole={userRole} userName={userName} userProfile={userProfile} />

          <main className='flex-1 p-4 md:p-6 lg:p-8 pb-8 overflow-x-hidden max-w-full'>
            <HearingReportsContent reportId={reportId} />
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  )
}

const HearingReports = () => {
  return <HearingReportsMain />
}

export default HearingReports
