import { useState } from 'react'
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar'
import AppSidebar from '@/components/AppSidebar'
import Header from '@/components/Header'
import { useOrganization } from '@/contexts/OrganizationContext'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import HearingScreeningStats from '@/components/screenings/hearing/HearingScreeningStats'
import HearingScreeningsFilters from '@/components/screenings/hearing/HearingScreeningsFilters'
import HearingScreeningsTable from '@/components/screenings/hearing/HearingScreeningsTable'
import { useHearingScreenings } from '@/hooks/screenings/use-hearing-screenings'
import { Screening } from '@/types/database'
import LoadingSpinner from '@/components/common/LoadingSpinner'

const HearingScreeningsContent = () => {
  const { currentSchool, userProfile } = useOrganization()
  const navigate = useNavigate()
  const [searchTerm, setSearchTerm] = useState('')
  const [dateRangeFilter, setDateRangeFilter] = useState('school_year')
  const [gradeFilter, setGradeFilter] = useState('all')
  const [resultFilter, setResultFilter] = useState('all')
  const [referralNotesFilter, setReferralNotesFilter] = useState('all')
  const [nonCompliantFilter, setNonCompliantFilter] = useState('all')
  const [complexNeedsFilter, setComplexNeedsFilter] = useState('all')
  const [selectedScreenings, setSelectedScreenings] = useState<Screening[]>([])

  const { data: screenings = [], isLoading } = useHearingScreenings(currentSchool?.id)

  const userRole = userProfile?.role || 'slp'
  const userName = userProfile ? `${userProfile.first_name} ${userProfile.last_name}` : 'User'

  const handleCreateScreening = () => {
    if (currentSchool?.id) {
      navigate(`/school/${currentSchool.id}/screening/hearing`)
    } else {
      navigate('/screening/hearing')
    }
  }

  const clearAllFilters = () => {
    setSearchTerm('')
    setDateRangeFilter('school_year')
    setGradeFilter('all')
    setResultFilter('all')
    setReferralNotesFilter('all')
    setNonCompliantFilter('all')
    setComplexNeedsFilter('all')
  }

  if (isLoading) {
    return (
      <SidebarProvider>
        <div className='min-h-screen flex w-full'>
          <AppSidebar />
          <SidebarInset>
            <Header userRole={userRole} userName={userName} />
            <div className='flex-1 bg-gray-25 p-4 md:p-6 lg:p-8 flex items-center justify-center'>
              <LoadingSpinner size='lg' />
            </div>
          </SidebarInset>
        </div>
      </SidebarProvider>
    )
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
                    <h1 className='text-3xl font-semibold text-gray-900 mb-2'>
                      Hearing Screenings
                    </h1>
                    <p className='text-gray-600'>
                      Manage and track all hearing screenings
                      {currentSchool && ` for ${currentSchool.name}`}
                    </p>
                  </div>
                  <Button onClick={handleCreateScreening} className='bg-blue-600 hover:bg-blue-700'>
                    <Plus className='w-4 h-4 mr-2' />
                    Create Screening
                  </Button>
                </div>

                <HearingScreeningStats
                  screenings={screenings}
                  onFilterClick={setResultFilter}
                  onClearAllFilters={clearAllFilters}
                />
              </div>

              <div className='space-y-6'>
                <HearingScreeningsFilters
                  searchTerm={searchTerm}
                  setSearchTerm={setSearchTerm}
                  dateRangeFilter={dateRangeFilter}
                  setDateRangeFilter={setDateRangeFilter}
                  gradeFilter={gradeFilter}
                  setGradeFilter={setGradeFilter}
                  resultFilter={resultFilter}
                  setResultFilter={setResultFilter}
                  referralNotesFilter={referralNotesFilter}
                  setReferralNotesFilter={setReferralNotesFilter}
                  nonCompliantFilter={nonCompliantFilter}
                  setNonCompliantFilter={setNonCompliantFilter}
                  complexNeedsFilter={complexNeedsFilter}
                  setComplexNeedsFilter={setComplexNeedsFilter}
                />

                <HearingScreeningsTable
                  searchTerm={searchTerm}
                  dateRangeFilter={dateRangeFilter}
                  gradeFilter={gradeFilter}
                  resultFilter={resultFilter}
                  referralNotesFilter={referralNotesFilter}
                  nonCompliantFilter={nonCompliantFilter}
                  complexNeedsFilter={complexNeedsFilter}
                  selectedScreenings={selectedScreenings}
                  setSelectedScreenings={setSelectedScreenings}
                />
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
