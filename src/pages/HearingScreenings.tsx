import { useState } from 'react'
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar'
import AppSidebar from '@/components/AppSidebar'
import Header from '@/components/Header'
import { useOrganization } from '@/contexts/OrganizationContext'
import { Button } from '@/components/ui/button'
import { Plus, Ear } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

const HearingScreeningsContent = () => {
  const { currentSchool, userProfile } = useOrganization()
  const navigate = useNavigate()

  const userRole = userProfile?.role || 'slp'
  const userName = userProfile
    ? `${userProfile.first_name} ${userProfile.last_name}`
    : 'User'

  const handleCreateScreening = () => {
    if (currentSchool?.id) {
      navigate(`/school/${currentSchool.id}/screening/hearing`)
    } else {
      navigate('/screening/hearing')
    }
  }

  return (
    <SidebarProvider>
      <div className='min-h-screen flex w-full'>
        <AppSidebar />
        <SidebarInset>
          <Header userRole={userRole} userName={userName} />
          <div className='flex-1 bg-gray-25 p-4 md:p-6 lg:p-8'>
            <div className='max-w-7xl mx-auto'>
              <div className='mb-8'>
                <div className='flex items-center justify-between mb-6'>
                  <div>
                    <div className='flex items-center gap-3 mb-2'>
                      <Ear className='w-8 h-8 text-blue-600' />
                      <h1 className='text-3xl font-semibold text-gray-900'>Hearing Screenings</h1>
                    </div>
                    <p className='text-gray-600'>
                      Manage and track all hearing screenings
                      {currentSchool && ` for ${currentSchool.name}`}
                    </p>
                  </div>
                  <Button
                    onClick={handleCreateScreening}
                    className='bg-blue-600 hover:bg-blue-700'>
                    <Plus className='w-4 h-4 mr-2' />
                    Create Hearing Screening
                  </Button>
                </div>
              </div>

              <div className='bg-white rounded-lg shadow p-6'>
                <div className='text-center py-12'>
                  <Ear className='w-16 h-16 text-gray-400 mx-auto mb-4' />
                  <h3 className='text-lg font-medium text-gray-900 mb-2'>
                    Hearing Screenings Table Coming Soon
                  </h3>
                  <p className='text-gray-600 mb-6'>
                    The hearing screenings table view is currently under development.
                    <br />
                    Click "Create Hearing Screening" above to add a new hearing screening.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  )
}

const HearingScreenings = () => {
  return <HearingScreeningsContent />
}

export default HearingScreenings
