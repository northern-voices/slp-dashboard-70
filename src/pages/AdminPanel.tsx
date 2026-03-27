import { useOrganization } from '@/contexts/OrganizationContext'
import AdminPanelHeader from '@/components/admin/AdminPanelHeader'
import AdminUserManagement from '@/components/admin/AdminUserManagement'
import AdminAccessGuard from '@/components/admin/AdminAccessGuard'

const AdminPanel = () => {
  const { userProfile } = useOrganization()
  const userRole = userProfile?.role || 'admin'
  const userName = userProfile
    ? `${userProfile.first_name} ${userProfile.last_name}`
    : 'Dr. Sarah Johnson'

  return (
    <AdminAccessGuard userRole={userRole}>
      <AdminPanelHeader userRole={userRole} userName={userName} />
      <AdminUserManagement />
    </AdminAccessGuard>
  )
}

export default AdminPanel
