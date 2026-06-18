import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useOrganization } from '@/contexts/OrganizationContext'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import MonthlyMeetingsFilters from '@/components/monthly-meetings/MonthlyMeetingsFilters'
import MonthlyMeetingsTable from '@/components/monthly-meetings/MonthlyMeetingsTable'
import AttendanceSheetsSection from '@/components/caseload/AttendanceSheetsSection'

const buttonLabels: Record<string, string> = {
  progress_checkin: 'Create Monthly Meeting',
  coaching_call: 'Create Coaching Call Meeting',
  school_visit_summary: 'Create School Visit Meeting',
}

const MonthlyMeetingsContent = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [dateRangeFilter, setDateRangeFilter] = useState('all')
  const [facilitatorFilter, setFacilitatorFilter] = useState('all')

  const navigate = useNavigate()
  const location = useLocation()
  const [activeTab, setActiveTab] = useState(location.state?.activeTab ?? 'progress_checkin')

  const { currentSchool } = useOrganization()

  const handleCreateMeeting = () => {
    const path = currentSchool?.id
      ? `/school/${currentSchool.id}/monthly-meetings/create`
      : '/monthly-meetings/create'

    navigate(path, { state: { meeting_type: activeTab } })
  }

  return (
    <main className='max-w-7xl mx-auto'>
      <div className='mb-8'>
        <div className='flex items-center justify-between mb-6'>
          <div>
            <h1 className='text-3xl font-semibold text-gray-900 mb-2'>Meetings</h1>
            <p className='text-gray-600'>
              Manage and track all meetings
              {currentSchool && ` for ${currentSchool.name}`}
            </p>
          </div>

          {activeTab !== 'attendance' && (
            <Button onClick={handleCreateMeeting} className='bg-blue-600 hover:bg-blue-700'>
              <Plus className='w-4 h-4 mr-2' />
              {buttonLabels[activeTab]}
            </Button>
          )}
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className='space-y-6'>
        <TabsList className='flex-wrap justify-start w-full h-auto p-1'>
          <TabsTrigger value='progress_checkin' className='flex-shrink-0'>
            Progress Check-in
          </TabsTrigger>
          <TabsTrigger value='coaching_call' className='flex-shrink-0'>
            Coaching Call
          </TabsTrigger>
          <TabsTrigger value='school_visit_summary' className='flex-shrink-0'>
            School Visit Summary
          </TabsTrigger>
          <TabsTrigger value='attendance' className='flex-shrink-0'>
            Attendance Sheets
          </TabsTrigger>
        </TabsList>

        {(['progress_checkin', 'coaching_call', 'school_visit_summary'] as const).map(type => (
          <TabsContent key={type} value={type} className='space-y-6'>
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
              meetingTypeFilter={type}
            />
          </TabsContent>
        ))}

        <TabsContent value='attendance' className='space-y-6'>
          {currentSchool?.id && <AttendanceSheetsSection schoolId={currentSchool.id} />}
        </TabsContent>
      </Tabs>
    </main>
  )
}

const MonthlyMeetings = () => <MonthlyMeetingsContent />

export default MonthlyMeetings
