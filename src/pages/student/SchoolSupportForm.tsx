import React, { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar'
import AppSidebar from '@/components/AppSidebar'
import Header from '@/components/Header'
import SchoolSupportHeader from '@/components/students/school-support/SchoolSupportHeader'
import SchoolSupportForm from '@/components/students/school-support/SchoolSupportForm'
import { useToast } from '@/hooks/use-toast'

const SchoolSupportFormPage = () => {
  const { studentId } = useParams<{ studentId: string }>()
  const navigate = useNavigate()
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (values: any) => {
    setIsSubmitting(true)
    try {
      // TODO: Replace with actual API call
      console.log('School support form submitted:', values)
      toast({
        title: 'School Support Form Saved',
        description: 'The support form has been successfully created.',
      })
      navigate(`/students/${studentId}`)
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to save the support form. Please try again.',
        variant: 'destructive',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCancel = () => {
    navigate(`/students/${studentId}`)
  }

  if (!studentId) {
    return <div>Student ID not found</div>
  }

  return (
    <SidebarProvider>
      <div className='min-h-screen flex w-full'>
        <AppSidebar />
        <SidebarInset>
          <Header />
          <div className='flex-1 bg-gray-25 p-4 md:p-6 lg:p-8'>
            <div className='max-w-4xl mx-auto'>
              <SchoolSupportHeader studentId={studentId} />
              <SchoolSupportForm
                onSubmit={handleSubmit}
                onCancel={handleCancel}
                isSubmitting={isSubmitting}
              />
            </div>
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  )
}

export default SchoolSupportFormPage
