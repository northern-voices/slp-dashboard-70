import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useOrganization } from '@/contexts/OrganizationContext'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import MonthlyMeetingsFilters from '@/components/monthly-meetings/MonthlyMeetingsFilters'
import MonthlyMeetingsTable from '@/components/monthly-meetings/MonthlyMeetingsTable'
import AttendanceSheetsSection from '@/components/caseload/AttendanceSheetsSection'

const MonthlyMeetingsContent = () => {
  const { userProfile, currentSchool } = useOrganization()
  const navigate = useNavigate()
  const [searchTerm, setSearchTerm] = useState('')
  const [dateRangeFilter, setDateRangeFilter] = useState('all')
  const [facilitatorFilter, setFacilitatorFilter] = useState('all')

  const handleCreateMeeting = () => {
    if (currentSchool?.id) {
      navigate(`/school/${currentSchool.id}/monthly-meetings/create`)
    } else {
      navigate('/monthly-meetings/create')
    }
  }

  return (
    <main className='max-w-7xl mx-auto'>
      <div className='mb-8'>{/* ...unchanged header... */}</div>

      <Tabs defaultValue='progress_checkin' className='space-y-6'>
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
