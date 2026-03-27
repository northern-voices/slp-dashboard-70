import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar'
import AppSidebar from '@/components/AppSidebar'
import Header from '@/components/Header'
import { useOrganization } from '@/contexts/OrganizationContext'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import MonthlyMeetingsFilters from '@/components/monthly-meetings/MonthlyMeetingsFilters'
import MonthlyMeetingsTable from '@/components/monthly-meetings/MonthlyMeetingsTable'

const MonthlyMeetingsContent = () => {
  const { userProfile, currentSchool } = useOrganization()
  const navigate = useNavigate()
  const [searchTerm, setSearchTerm] = useState('')
  const [dateRangeFilter, setDateRangeFilter] = useState('all')
  const [facilitatorFilter, setFacilitatorFilter] = useState('all')

  const userRole = userProfile?.role || 'slp'
  const userName = userProfile
    ? `${userProfile.first_name} ${userProfile.last_name}`
    : 'Dr. Sarah Johnson'

  const handleCreateMeeting = () => {
    // Navigate with school context if available
    if (currentSchool?.id) {
      navigate(`/school/${currentSchool.id}/monthly-meetings/create`)
    } else {
      navigate('/monthly-meetings/create')
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
                    <h1 className='text-3xl font-semibold text-gray-900 mb-2'>Monthly Meetings</h1>
                    <p className='text-gray-600'>
                      Manage and track all monthly meetings
                      {currentSchool && ` for ${currentSchool.name}`}
                    </p>
                  </div>
                  <Button
                    onClick={handleCreateMeeting}
                    className='bg-blue-600 hover:bg-blue-700'>
                    <Plus className='w-4 h-4 mr-2' />
                    Create Monthly Meeting
                  </Button>
                </div>
              </div>

              <div className='space-y-6'>
                <MonthlyMeetingsFilters
                  searchTerm={searchTerm}
                  setSearchTerm={setSearchTerm}
                  dateRangeFilter={dateRangeFilter}
                  setDateRangeFilter={setDateRangeFilter}
                  facilitatorFilter={facilitatorFilter}
                  setFacilitatorFilter={setFacilitatorFilter}
                />

                <MonthlyMeetingsTable
                  searchTerm={searchTerm}
                  dateRangeFilter={dateRangeFilter}
                  facilitatorFilter={facilitatorFilter}
                />
              </div>
            </div>
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  )
}

const MonthlyMeetings = () => {
  return <MonthlyMeetingsContent />
}

export default MonthlyMeetings
