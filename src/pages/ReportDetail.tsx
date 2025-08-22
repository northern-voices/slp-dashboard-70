import React from 'react'
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar'
import AppSidebar from '@/components/AppSidebar'
import Header from '@/components/Header'
import { OrganizationProvider, useOrganization } from '@/contexts/OrganizationContext'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Download, FileText } from 'lucide-react'
import { useNavigate, useParams } from 'react-router-dom'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'
import ReportDetailContent from '@/components/reports/ReportDetailContent'

const ReportDetailPageContent = () => {
  const { userProfile } = useOrganization()
  const navigate = useNavigate()
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
            <div className='space-y-6'>
              {/* Navigation */}
              <div className='flex items-center gap-4'>
                <Button
                  variant='outline'
                  size='sm'
                  onClick={() => navigate('/reports')}
                  className='flex items-center gap-2'>
                  <ArrowLeft className='w-4 h-4' />
                  Back to Reports
                </Button>

                <Breadcrumb>
                  <BreadcrumbList>
                    <BreadcrumbItem>
                      <BreadcrumbLink href='/reports'>Reports</BreadcrumbLink>
                    </BreadcrumbItem>
                    <BreadcrumbSeparator />
                    <BreadcrumbItem>
                      <BreadcrumbPage>Report Details</BreadcrumbPage>
                    </BreadcrumbItem>
                  </BreadcrumbList>
                </Breadcrumb>
              </div>

              {/* Report Detail Content */}
              <div className='w-full max-w-full'>
                <ReportDetailContent reportId={reportId} />
              </div>
            </div>
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  )
}

const ReportDetail = () => {
  return <ReportDetailPageContent />
}

export default ReportDetail
