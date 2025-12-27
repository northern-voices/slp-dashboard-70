import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar'
import AppSidebar from '@/components/AppSidebar'
import Header from '@/components/Header'
import { useOrganization } from '@/contexts/OrganizationContext'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import ReportGenerationForm from '@/components/reports/ReportGenerationForm'
const SchoolWideReportsContent = () => {
  const { userProfile } = useOrganization()
  const navigate = useNavigate()
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
            <div className='space-y-6'>
              {/* Navigation */}
              <div className='flex items-center gap-4'>
                <Button
                  variant='outline'
                  size='sm'
                  onClick={() => navigate(-1)}
                  className='flex items-center gap-2'>
                  <ArrowLeft className='w-4 h-4' />
                  Back
                </Button>
              </div>

              {/* Page Header */}
              <div className='space-y-1 sm:space-y-2'>
                <h1 className='text-xl sm:text-2xl lg:text-3xl font-semibold text-gray-900'>
                  School Wide Speech Reports
                </h1>
                <p className='text-sm sm:text-base text-gray-600'>
                  Generate comprehensive school-wide speech reports for students
                </p>
              </div>

              {/* Report Generation Form */}
              <div className='w-full max-w-full'>
                <ReportGenerationForm />
              </div>
            </div>
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  )
}
const GenerateReport = () => {
  return <SchoolWideReportsContent />
}
export default GenerateReport
