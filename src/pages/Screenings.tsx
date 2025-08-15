import { useState } from 'react'
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar'
import AppSidebar from '@/components/AppSidebar'
import Header from '@/components/Header'
import { OrganizationProvider, useOrganization } from '@/contexts/OrganizationContext'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import ScreeningStats from '@/components/screenings/ScreeningStats'
import ScreeningsFilters from '@/components/screenings/ScreeningsFilters'
import ScreeningsTable from '@/components/screenings/ScreeningsTable'
import CreateScreeningModal from '@/components/screenings/CreateScreeningModal'
import { Screening } from '@/types/database'

const ScreeningsContent = () => {
  const { currentSchool } = useOrganization()
  const [searchTerm, setSearchTerm] = useState('')

  // Basic filters
  const [resultFilter, setResultFilter] = useState('all')
  const [dateRangeFilter, setDateRangeFilter] = useState('all')
  const [gradeFilter, setGradeFilter] = useState('all')

  // Speech program filters
  const [qualifiesForSpeechProgramFilter, setQualifiesForSpeechProgramFilter] = useState('all')
  const [vocabularySupportFilter, setVocabularySupportFilter] = useState('all')
  const [casFilter, setCasFilter] = useState('all')
  const [languageComprehensionFilter, setLanguageComprehensionFilter] = useState('all')
  const [priorityRescreenFilter, setPriorityRescreenFilter] = useState('all')

  // Notes and recommendations filters
  const [recommendationsFilter, setRecommendationsFilter] = useState('all')
  const [clinicalNotesFilter, setClinicalNotesFilter] = useState('all')

  const [selectedScreenings, setSelectedScreenings] = useState<Screening[]>([])
  const [showCreateModal, setShowCreateModal] = useState(false)

  const handleBulkAction = (action: string) => {
    console.log(`Performing ${action} on selected screenings:`, selectedScreenings)
    // Implement bulk actions like:
    // - Export selected screenings
    // - Delete selected screenings
    // - Mark as completed/in progress
    // - Generate reports for selected screenings

    switch (action) {
      case 'export':
        // Export logic here
        break
      case 'delete':
        // Delete logic is now handled by the DeleteScreeningsModal
        // The modal will handle the actual deletion and reset the selection
        break
      default:
        console.log('Unknown bulk action:', action)
    }
  }

  const { userProfile } = useOrganization()

  const userRole = userProfile?.role || 'slp'
  const userName = userProfile
    ? `${userProfile.first_name} ${userProfile.last_name}`
    : 'Dr. Sarah Johnson'

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
                    <h1 className='text-3xl font-semibold text-gray-900 mb-2'>Screenings</h1>
                    <p className='text-gray-600'>
                      Manage and track all speech and hearing screenings
                      {currentSchool && ` for ${currentSchool.name}`}
                    </p>
                  </div>
                  <Button
                    onClick={() => setShowCreateModal(true)}
                    className='bg-blue-600 hover:bg-blue-700'>
                    <Plus className='w-4 h-4 mr-2' />
                    Create Screening
                  </Button>
                </div>

                <ScreeningStats />
              </div>

              <div className='space-y-6'>
                <ScreeningsFilters
                  searchTerm={searchTerm}
                  setSearchTerm={setSearchTerm}
                  resultFilter={resultFilter}
                  setResultFilter={setResultFilter}
                  dateRangeFilter={dateRangeFilter}
                  setDateRangeFilter={setDateRangeFilter}
                  qualifiesForSpeechProgramFilter={qualifiesForSpeechProgramFilter}
                  setQualifiesForSpeechProgramFilter={setQualifiesForSpeechProgramFilter}
                  vocabularySupportFilter={vocabularySupportFilter}
                  setVocabularySupportFilter={setVocabularySupportFilter}
                  casFilter={casFilter}
                  setCasFilter={setCasFilter}
                  gradeFilter={gradeFilter}
                  setGradeFilter={setGradeFilter}
                  recommendationsFilter={recommendationsFilter}
                  setRecommendationsFilter={setRecommendationsFilter}
                  clinicalNotesFilter={clinicalNotesFilter}
                  setClinicalNotesFilter={setClinicalNotesFilter}
                  languageComprehensionFilter={languageComprehensionFilter}
                  setLanguageComprehensionFilter={setLanguageComprehensionFilter}
                  priorityRescreenFilter={priorityRescreenFilter}
                  setPriorityRescreenFilter={setPriorityRescreenFilter}
                />

                <ScreeningsTable
                  searchTerm={searchTerm}
                  resultFilter={resultFilter}
                  dateRangeFilter={dateRangeFilter}
                  qualifiesForSpeechProgramFilter={qualifiesForSpeechProgramFilter}
                  vocabularySupportFilter={vocabularySupportFilter}
                  casFilter={casFilter}
                  gradeFilter={gradeFilter}
                  recommendationsFilter={recommendationsFilter}
                  clinicalNotesFilter={clinicalNotesFilter}
                  languageComprehensionFilter={languageComprehensionFilter}
                  priorityRescreenFilter={priorityRescreenFilter}
                  selectedScreenings={selectedScreenings}
                  setSelectedScreenings={setSelectedScreenings}
                  onBulkAction={handleBulkAction}
                  currentSchool={currentSchool}
                />
              </div>
            </div>
          </div>
        </SidebarInset>
      </div>

      <CreateScreeningModal isOpen={showCreateModal} onClose={() => setShowCreateModal(false)} />
    </SidebarProvider>
  )
}

const Screenings = () => {
  return (
    <OrganizationProvider>
      <ScreeningsContent />
    </OrganizationProvider>
  )
}

export default Screenings
