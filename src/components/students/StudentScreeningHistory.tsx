import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Plus, Volume2, Mic } from 'lucide-react'
import { Student } from '@/types/database'
import ScreeningFilters from './screening-filters/ScreeningFilters'
import ScreeningsList from './screening-filters/ScreeningsList'
import { useScreeningsByStudent } from '@/hooks/screenings/use-screenings'
import { useOrganization } from '@/contexts/OrganizationContext'
import { format } from 'date-fns'
import { parseDateSafely } from '@/utils/dateUtils'

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

  const { userProfile } = useOrganization()

  const isHearingTechnician = userProfile?.role === 'hearing_technician'
  const isSlp = userProfile?.role === 'slp'
  const visibleScreenings = isHearingTechnician
    ? screenings.filter(screening => screening.source_table !== 'speech')
    : isSlp
      ? screenings.filter(screening => screening.source_table !== 'hearing')
      : screenings

  const graduationScreening =
    student.program_status === 'graduated'
      ? [...screenings]
          .filter(screening => screening.error_patterns?.screening_metadata?.graduated_date)
          .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0]
      : undefined

  const graduatedDate = graduationScreening?.error_patterns?.screening_metadata?.graduated_date
  const graduatedNotes = graduationScreening?.error_patterns?.screening_metadata?.graduated_notes

  return (
    <Card>
      <CardHeader>
        <div className='flex items-center justify-between'>
          <CardTitle className='text-2xl font-semibold'>Screening History</CardTitle>
          {visibleScreenings.length > 0 && (
            <span className='inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800'>
              {visibleScreenings.length} screening{visibleScreenings.length !== 1 ? 's' : ''}
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

        {graduatedDate && (
          <div className='mb-4 p-3 rounded-md border border-blue-200 bg-blue-50 space-y-1'>
            <p className='text-sm font-medium text-blue-800'>
              Graduated On: {format(parseDateSafely(graduatedDate), 'MMM d, yyyy')}
            </p>

            {graduatedNotes && <p className='text-sm text-blue-900'>{graduatedNotes}</p>}
          </div>
        )}

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
