import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Plus, Volume2, Mic } from 'lucide-react'
import { Student } from '@/types/database'
import ScreeningFilters from './screening-filters/ScreeningFilters'
import ScreeningsList from './screening-filters/ScreeningsList'
import { useScreeningsByStudent } from '@/hooks/screenings/use-screenings'

interface StudentScreeningHistoryProps {
  studentId?: string
  student: Student
  onAddHearingScreening: () => void
  onAddSpeechScreening?: () => void
}

const StudentScreeningHistory = ({
  studentId,
  student,
  onAddHearingScreening,
  onAddSpeechScreening,
}: StudentScreeningHistoryProps) => {
  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState('all')
  const [filterStatus, setFilterStatus] = useState('all')
  const [dateRangeFilter, setDateRangeFilter] = useState('all')
  const [qualifiesForSpeechProgramFilter, setQualifiesForSpeechProgramFilter] = useState('all')
  const [vocabularySupportFilter, setVocabularySupportFilter] = useState('all')
  const [casFilter, setCasFilter] = useState('all')
  const [gradeFilter, setGradeFilter] = useState('all')
  const [recommendationsFilter, setRecommendationsFilter] = useState('all')
  const [clinicalNotesFilter, setClinicalNotesFilter] = useState('all')
  const [languageComprehensionFilter, setLanguageComprehensionFilter] = useState('all')
  const [priorityRescreenFilter, setPriorityRescreenFilter] = useState('all')

  // Fetch screenings to get count
  const { data: screenings = [] } = useScreeningsByStudent(studentId || '')

  return (
    <Card>
      <CardHeader>
        <div className='flex items-center justify-between'>
          <CardTitle className='text-lg font-semibold'>Screening History</CardTitle>
          {screenings.length > 0 && (
            <span className='inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800'>
              {screenings.length} screening{screenings.length !== 1 ? 's' : ''}
            </span>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {/* <ScreeningFilters
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          filterType={filterType}
          setFilterType={setFilterType}
          filterStatus={filterStatus}
          setFilterStatus={setFilterStatus}
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
        /> */}

        <ScreeningsList
          studentId={studentId}
          searchTerm={searchTerm}
          filterType={filterType}
          filterStatus={filterStatus}
          dateRangeFilter={dateRangeFilter}
          qualifiesForSpeechProgramFilter={qualifiesForSpeechProgramFilter}
          vocabularySupportFilter={vocabularySupportFilter}
          casFilter={casFilter}
          gradeFilter={gradeFilter}
          recommendationsFilter={recommendationsFilter}
          clinicalNotesFilter={clinicalNotesFilter}
          languageComprehensionFilter={languageComprehensionFilter}
          priorityRescreenFilter={priorityRescreenFilter}
        />
      </CardContent>
    </Card>
  )
}

export default StudentScreeningHistory
