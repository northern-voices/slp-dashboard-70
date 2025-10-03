import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Plus, Volume2, Mic } from 'lucide-react'
import { Student } from '@/types/database'
import ScreeningFilters from './screening-filters/ScreeningFilters'
import ScreeningsList from './screening-filters/ScreeningsList'

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

  return (
    <Card>
      <CardHeader>
        <div className='flex items-center justify-between'>
          <CardTitle className='text-lg font-semibold'>Screening History</CardTitle>
          <div className='flex gap-2'>
            {onAddSpeechScreening && (
              <Button
                variant='outline'
                size='sm'
                onClick={onAddSpeechScreening}
                className='flex items-center gap-2'>
                <Mic className='w-4 h-4' />
                Add Speech Screening
              </Button>
            )}
            {/* <Button
              variant='outline'
              size='sm'
              onClick={onAddHearingScreening}
              className='flex items-center gap-2'>
              <Volume2 className='w-4 h-4' />
              Add Hearing Screening
            </Button> */}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <ScreeningFilters
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
        />

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
