import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Shield, Activity } from 'lucide-react'
import AdminSecuritySettings from '@/components/admin/AdminSecuritySettings'
import AdminActivityLogs from '@/components/admin/AdminActivityLogs'

const AdminTabContent = () => {
  return (
    <div className='space-y-6'>
      <div>
        <h2 className='text-xl font-semibold text-gray-900 mb-2'>Super Admin</h2>
        <p className='text-gray-600 text-sm'>
          Organization-wide security policy and audit visibility
        </p>
      </div>

      <Tabs defaultValue='security' className='space-y-6'>
        <TabsList>
          <TabsTrigger value='security' className='flex items-center'>
            <Shield className='w-4 h-4 mr-2' />
            Security
          </TabsTrigger>
          <TabsTrigger value='activity' className='flex items-center'>
            <Activity className='w-4 h-4 mr-2' />
            Activity Logs
          </TabsTrigger>
        </TabsList>

        <TabsContent value='security'>
          <AdminSecuritySettings />
        </TabsContent>

        <TabsContent value='activity'>
          <AdminActivityLogs />
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default AdminTabContent
