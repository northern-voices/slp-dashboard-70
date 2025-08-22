import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar'
import AppSidebar from '@/components/AppSidebar'
import Header from '@/components/Header'
import { OrganizationProvider } from '@/contexts/OrganizationContext'
import { Button } from '@/components/ui/button'
import { ChevronLeft } from 'lucide-react'
import SchoolSupportForm from '@/components/students/school-support/SchoolSupportForm'
import { useToast } from '@/hooks/use-toast'

const CreateSchoolSupportFormContent = () => {
  const navigate = useNavigate()
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (values: Record<string, unknown>) => {
    setIsSubmitting(true)
    try {
      // TODO: Replace with actual API call
      console.log('School support form submitted:', values)
      toast({
        title: 'School Support Form Saved',
        description: 'The support form has been successfully created.',
      })
      navigate('/school-support')
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
    navigate('/school-support')
  }

  return (
    <SidebarProvider>
      <div className='min-h-screen flex w-full'>
        <AppSidebar />
        <SidebarInset>
          <Header />
          <div className='flex-1 bg-gray-25 p-4 md:p-6 lg:p-8'>
            <div className='max-w-4xl mx-auto'>
              <div className='flex items-center gap-4 mb-6'>
                <Button
                  variant='ghost'
                  size='sm'
                  onClick={() => navigate('/school-support')}
                  className='text-gray-600 hover:text-gray-900'>
                  <ChevronLeft className='w-4 h-4 mr-1' />
                  Back to School Support
                </Button>
                <div className='h-4 w-px bg-gray-300' />
                <h1 className='text-2xl font-semibold text-gray-900'>
                  Create School Support Request
                </h1>
              </div>
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

const CreateSchoolSupportForm = () => {
  return <CreateSchoolSupportFormContent />
}

export default CreateSchoolSupportForm
