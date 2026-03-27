import { Outlet } from 'react-router-dom'
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar'
import AppSidebar from '@/components/AppSidebar'
import Header from '@/components/Header'
import { useOrganization } from '@/contexts/OrganizationContext'

const DashboardLayout = () => {
  const { userProfile } = useOrganization()

  const userRole = userProfile?.role || 'slp'
  const userName = userProfile
    ? `${userProfile.first_name} ${userProfile.last_name}`
    : 'Dr. Sarah Johnson'

  return (
    <SidebarProvider>
      <div className='flex w-full min-h-screen bg-gray-25'>
        <AppSidebar userRole={userRole} userName={userName} />
        <SidebarInset className='flex-1'>
          <Header userRole={userRole} userName={userName} userProfile={userProfile} />

          <main className='flex-1 px-6 py-8 pb-8'>
            <Outlet />
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  )
}

export default DashboardLayout
