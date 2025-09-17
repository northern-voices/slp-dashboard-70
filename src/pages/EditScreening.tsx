import React from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Screening } from '@/types/database'
import { screeningsApi } from '@/api/screenings'
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
import { OrganizationProvider, useOrganization } from '@/contexts/OrganizationContext'
import { useToast } from '@/hooks/use-toast'
import LoadingSpinner from '@/components/common/LoadingSpinner'

const EditScreeningContent = () => {
  const { screeningId } = useParams<{
    screeningId: string
  }>()
  const navigate = useNavigate()
  const { toast } = useToast()
  const { userProfile } = useOrganization()
  const [screening, setScreening] = React.useState<Screening | null>(null)
  const [loading, setLoading] = React.useState(false)

  React.useEffect(() => {
    if (screeningId) {
      const fetchScreening = async () => {
        setLoading(true)
        try {
          // For now, we'll fetch all screenings and find the one we need
          // This is a temporary solution until a getById method is added to the API
          // TODO: Make a getScreeningById to be able to make this functionality work
          const allScreenings = await screeningsApi.getScreeningsList()
          const screeningData = allScreenings.find(s => s.id === screeningId)

          if (screeningData) {
            setScreening(screeningData)
          } else {
            throw new Error('Screening not found')
          }
        } catch (error) {
          console.error('Failed to fetch screening:', error)
          toast({
            title: 'Error',
            description: 'Failed to load screening data',
            variant: 'destructive',
          })
        } finally {
          setLoading(false)
        }
      }
      fetchScreening()
    }
  }, [screeningId, toast])

  const handleGoBack = () => {
    navigate(-1)
  }

  if (loading) {
    return <LoadingSpinner />
  }

  if (!screening) {
    return (
      <div className='flex items-center justify-center h-screen'>
        <div className='text-center'>
          <h2 className='text-2xl font-semibold text-gray-900'>Screening not found</h2>
          <p className='text-gray-600 mt-2'>The screening you're looking for doesn't exist.</p>
          <Button onClick={handleGoBack} className='mt-4'>
            Go Back
          </Button>
        </div>
      </div>
    )
  }

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <Header />
        <div className='flex flex-1 flex-col gap-4 p-4 pt-0'>
          <div className='flex items-center gap-4'>
            <Button variant='ghost' size='sm' onClick={handleGoBack} className='gap-2'>
              <ChevronLeft className='w-4 h-4' />
              Back
            </Button>
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbLink href='/students'>Students</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbLink href={`/students/${screening.student_id}`}>
                    {screening.student_name}
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbPage>Edit Screening</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>

          <div className='min-h-[100vh] flex-1 rounded-xl bg-muted/50 md:min-h-min'>
            <div className='p-6'>
              <div className='flex items-center gap-3 mb-6'>
                <FileText className='w-6 h-6' />
                <div>
                  <h1 className='text-2xl font-semibold'>Edit Screening</h1>
                  <p className='text-gray-600'>
                    Editing {screening.screening_type} screening for {screening.student_name}
                  </p>
                </div>
              </div>

              {/* TODO: Add the actual edit form component here */}
              <div className='bg-white rounded-lg p-6 border'>
                <h3 className='text-lg font-medium mb-4'>Screening Details</h3>
                <div className='space-y-4'>
                  <div>
                    <label className='block text-sm font-medium text-gray-700'>Student</label>
                    <p className='text-sm text-gray-900'>{screening.student_name}</p>
                  </div>
                  <div>
                    <label className='block text-sm font-medium text-gray-700'>Grade</label>
                    <p className='text-sm text-gray-900'>{screening.grade}</p>
                  </div>
                  <div>
                    <label className='block text-sm font-medium text-gray-700'>
                      Screening Type
                    </label>
                    <p className='text-sm text-gray-900'>
                      {screening.screening_type?.charAt(0).toUpperCase() +
                        screening.screening_type?.slice(1)}
                    </p>
                  </div>
                  <div>
                    <label className='block text-sm font-medium text-gray-700'>
                      Current Result
                    </label>
                    <p className='text-sm text-gray-900'>{screening.result || 'No result'}</p>
                  </div>
                </div>

                <div className='mt-6 pt-6 border-t'>
                  <p className='text-sm text-gray-600'>
                    The edit form will be implemented here. This will allow you to modify the
                    screening data and save the changes.
                  </p>
                  <div className='flex gap-2 mt-4'>
                    <Button variant='outline' onClick={handleGoBack}>
                      Cancel
                    </Button>
                    <Button disabled>Save Changes (Coming Soon)</Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}

const EditScreening = () => (
  <OrganizationProvider>
    <EditScreeningContent />
  </OrganizationProvider>
)

export default EditScreening
