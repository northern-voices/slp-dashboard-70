import React from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ScreeningFormData } from '@/types/screening'
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar'
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbSeparator,
  BreadcrumbPage,
} from '@/components/ui/breadcrumb'
import { Button } from '@/components/ui/button'
import { ChevronLeft, FileText } from 'lucide-react'
import AppSidebar from '@/components/AppSidebar'
import Header from '@/components/Header'
import MultiStepHearingScreeningForm from '@/components/screening/hearing/MultiStepHearingScreeningForm'
import { useOrganization } from '@/contexts/OrganizationContext'
import { useToast } from '@/hooks/use-toast'
import LoadingSpinner from '@/components/common/LoadingSpinner'
import { useStudent } from '@/hooks/students/use-students'

const HearingScreeningContent = () => {
  const { studentId } = useParams<{
    studentId: string
  }>()
  const navigate = useNavigate()
  const { toast } = useToast()
  const { userProfile } = useOrganization()

  // Use React Query hook to fetch student
  const { data: student = null, isLoading: loading } = useStudent(studentId)
  const handleSubmit = (screeningData: ScreeningFormData) => {
    console.log('Hearing screening submitted:', screeningData)
    toast({
      title: 'Hearing Screening completed',
      description: 'Hearing screening has been recorded successfully.',
    })

    // Navigate back to appropriate page
    if (studentId) {
      navigate(`/students/${studentId}`)
    } else {
      navigate('/screenings')
    }
  }
  const handleCancel = () => {
    if (studentId) {
      navigate(`/students/${studentId}`)
    } else {
      navigate('/screenings')
    }
  }
  const handleViewDrafts = () => {
    navigate('/drafts')
  }
  const userName = userProfile
    ? `${userProfile.first_name} ${userProfile.last_name}`
    : 'Dr. Sarah Johnson'
  const userRole = userProfile?.role || 'slp'
  if (loading) {
    return (
      <div className='min-h-screen flex w-full bg-gray-25'>
        <SidebarProvider>
          <AppSidebar userRole={userRole as 'admin' | 'slp' | 'supervisor'} userName={userName} />
          <SidebarInset>
            <Header userRole={userRole as 'admin' | 'slp' | 'supervisor'} userName={userName} />
            <main className='flex-1 p-4 md:p-6 lg:p-8'>
              <div className='flex justify-center items-center h-64'>
                <LoadingSpinner size='lg' />
              </div>
            </main>
          </SidebarInset>
        </SidebarProvider>
      </div>
    )
  }
  return (
    <div className='min-h-screen flex w-full bg-gray-25'>
      <SidebarProvider>
        <AppSidebar userRole={userRole as 'admin' | 'slp' | 'supervisor'} userName={userName} />
        <SidebarInset>
          <Header userRole={userRole as 'admin' | 'slp' | 'supervisor'} userName={userName} />
          <main className='flex-1 p-4 md:p-6 lg:p-8'>
            {/* Breadcrumb Navigation */}
            <div className='mb-6'>
              <div className='flex items-center gap-4 mb-4'>
                <Button
                  variant='ghost'
                  size='sm'
                  onClick={handleCancel}
                  className='text-gray-600 hover:text-gray-900 hover:bg-gray-100 px-2'>
                  <ChevronLeft className='w-4 h-4 mr-1' />
                  Back
                </Button>

                <Breadcrumb></Breadcrumb>
              </div>

              {/* Title and View Drafts Button */}
              <div className='flex items-start justify-between'>
                <div className='space-y-1'>
                  <h1 className='text-2xl font-semibold text-gray-900'>Hearing Screening</h1>
                  {student ? (
                    <p className='text-gray-600'>
                      Creating hearing screening for {student.first_name} {student.last_name}
                    </p>
                  ) : (
                    <p className='text-gray-600'>Creating new hearing screening</p>
                  )}
                </div>
                {/* // TODO: Fix drafts functionality */}
                {/* <Button
                  variant='outline'
                  size='sm'
                  onClick={handleViewDrafts}
                  className='flex items-center gap-2 text-gray-700 hover:text-gray-900 hover:bg-gray-50'>
                  <FileText className='w-4 h-4' />
                  View Drafts
                </Button> */}
              </div>
            </div>

            {/* Screening Form */}
            <div className='bg-white rounded-lg border border-gray-200 shadow-sm'>
              <div className='p-6'>
                <MultiStepHearingScreeningForm
                  onSubmit={handleSubmit}
                  onCancel={handleCancel}
                  existingStudent={student}
                />
              </div>
            </div>
          </main>
        </SidebarInset>
      </SidebarProvider>
    </div>
  )
}
const HearingScreening = () => {
  return <HearingScreeningContent />
}
export default HearingScreening
