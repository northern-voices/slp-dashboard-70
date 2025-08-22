import React from 'react'
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar'
import AppSidebar from '@/components/AppSidebar'
import Header from '@/components/Header'
import { OrganizationProvider, useOrganization } from '@/contexts/OrganizationContext'
import AdminPanelHeader from '@/components/admin/AdminPanelHeader'
import AdminUserManagement from '@/components/admin/AdminUserManagement'
import AdminAccessGuard from '@/components/admin/AdminAccessGuard'

const AdminPanelContent = () => {
  const { userProfile } = useOrganization()

  const userRole = userProfile?.role || 'admin'
  const userName = userProfile
    ? `${userProfile.first_name} ${userProfile.last_name}`
    : 'Dr. Sarah Johnson'

  return (
    <SidebarProvider>
      <div className='min-h-screen flex w-full bg-gray-25'>
        <AppSidebar userRole={userRole} userName={userName} />

        <SidebarInset className='flex-1'>
          <Header userRole={userRole} userName={userName} />

          <main className='flex-1 p-4 md:p-6 lg:p-8 pb-8'>
            <AdminAccessGuard userRole={userRole}>
              <AdminPanelHeader userRole={userRole} userName={userName} />
              <AdminUserManagement />
            </AdminAccessGuard>
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  )
}

const AdminPanel = () => {
  return <AdminPanelContent />
}

export default AdminPanel
