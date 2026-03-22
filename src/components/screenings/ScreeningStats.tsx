import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Calendar, CheckCircle, Clock, FileText, Users } from 'lucide-react'
import { useScreenings, useScreeningsBySchool } from '@/hooks/screenings/use-screenings'
import { useOrganization } from '@/contexts/OrganizationContext'

interface ScreeningStatsProps {
  onFilterClick?: (filterValues: string[]) => void
  onClearAllFilters?: () => void
}

const ScreeningStats = ({ onFilterClick, onClearAllFilters }: ScreeningStatsProps) => {
  const { currentSchool } = useOrganization()

  const {
    data: allScreeningsData,
    isLoading: isLoadingAll,
    isFetching: isFetchingAll,
    error: errorAll,
  } = useScreenings()
  const {
    data: schoolScreeningsData,
    isLoading: isLoadingSchool,
    isFetching: isFetchingSchool,
    error: errorSchool,
  } = useScreeningsBySchool(currentSchool?.id, 'school_year')

  const schoolScreenings = currentSchool ? schoolScreeningsData || [] : allScreeningsData || []
  const isLoading = currentSchool ? isLoadingSchool : isLoadingAll
  const isFetching = currentSchool ? isFetchingSchool : isFetchingAll
  const error = currentSchool ? errorSchool : errorAll

  // Get the latest screening per student
  const latestScreeningByStudent = new Map<string, (typeof schoolScreenings)[0]>()
  schoolScreenings.forEach(s => {
    const existing = latestScreeningByStudent.get(s.student_id)
    if (!existing || new Date(s.created_at) > new Date(existing.created_at)) {
      latestScreeningByStudent.set(s.student_id, s)
    }
  })
  const latestScreenings = Array.from(latestScreeningByStudent.values())

  const graduatedStudentIds = new Set(
    latestScreenings
      .filter(s => s.error_patterns?.screening_metadata?.graduated === true)
      .map(s => s.student_id)
  )
  const qualifiedStudentIds = new Set(
    latestScreenings
      .filter(s => s.error_patterns?.screening_metadata?.qualifies_for_speech_program === true)
      .map(s => s.student_id)
  )
  const subStudentIds = new Set(
    latestScreenings
      .filter(s => s.error_patterns?.screening_metadata?.sub === true)
      .map(s => s.student_id)
  )
  const pausedStudentIds = new Set(
    latestScreenings
      .filter(s => s.error_patterns?.screening_metadata?.paused === true)
      .map(s => s.student_id)
  )
  const caseloadStudentIds = new Set([...qualifiedStudentIds, ...subStudentIds])

  // Raw screening record counts
  const rawCounts = {
    total: schoolScreenings.length,
    qualified: schoolScreenings.filter(
      s => s.error_patterns?.screening_metadata?.qualifies_for_speech_program === true
    ).length,
    sub: schoolScreenings.filter(s => s.error_patterns?.screening_metadata?.sub === true).length,
    paused: schoolScreenings.filter(s => s.error_patterns?.screening_metadata?.paused === true)
      .length,
    graduated: schoolScreenings.filter(
      s => s.error_patterns?.screening_metadata?.graduated === true
    ).length,
    caseload: schoolScreenings.filter(
      s =>
        s.error_patterns?.screening_metadata?.qualifies_for_speech_program === true ||
        s.error_patterns?.screening_metadata?.sub === true
    ).length,
  }

  const stats = {
    totalScreenings: latestScreeningByStudent.size,
    qualifiedScreenings: qualifiedStudentIds.size,
    subsScreenings: subStudentIds.size,
    pausedScreenings: pausedStudentIds.size,
    graduatedScreenings: graduatedStudentIds.size,
    caseloadScreenings: caseloadStudentIds.size,
  }

  const handleCardClick = (filterValues: string[]) => {
    if (onFilterClick) {
      onFilterClick(filterValues)
    }
  }

  const handleClearAll = () => {
    if (onClearAllFilters) {
      onClearAllFilters()
    }
  }

  if (isLoading) {
    return (
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8'>
        {[...Array(5)].map((_, i) => (
          <Card key={i}>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <div className='h-4 bg-gray-200 rounded animate-pulse w-24'></div>
              <div className='h-4 w-4 bg-gray-200 rounded animate-pulse'></div>
            </CardHeader>
            <CardContent>
              <div className='h-8 bg-gray-200 rounded animate-pulse w-16 mb-2'></div>
              <div className='h-3 bg-gray-200 rounded animate-pulse w-20'></div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8'>
        <Card>
          <CardContent className='pt-6'>
            <div className='text-center text-red-600'>
              <p className='text-sm'>Error loading stats</p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8'>
      {/* Total Screenings*/}
      <Card className='cursor-pointer hover:bg-gray-50 transition-colors' onClick={handleClearAll}>
        <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
          <CardTitle className='text-sm font-medium'>Total Screenings</CardTitle>
          <FileText className='h-4 w-4 text-muted-foreground' />
        </CardHeader>
        <CardContent>
          <div className='text-2xl font-bold'>{stats.totalScreenings}</div>
          <p className='text-xs text-muted-foreground mt-1'>{rawCounts.total} screenings</p>
        </CardContent>
      </Card>

      {/* Qualified */}
      <Card
        className='cursor-pointer hover:bg-gray-50 transition-colors'
        onClick={() => handleCardClick(['qualified'])}>
        <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
          <CardTitle className='text-sm font-medium'>Qualified</CardTitle>
          <CheckCircle className='h-4 w-4 text-muted-foreground' />
        </CardHeader>
        <CardContent>
          <div className='text-2xl font-bold'>{stats.qualifiedScreenings}</div>
          <p className='text-xs text-muted-foreground mt-1'>{rawCounts.qualified} screenings</p>
        </CardContent>
      </Card>

      {/* Subs */}
      <Card
        className='cursor-pointer hover:bg-gray-50 transition-colors'
        onClick={() => handleCardClick(['sub'])}>
        <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
          <CardTitle className='text-sm font-medium'>Subs</CardTitle>
          <Clock className='h-4 w-4 text-muted-foreground' />
        </CardHeader>
        <CardContent>
          <div className='text-2xl font-bold'>{stats.subsScreenings}</div>
          <p className='text-xs text-muted-foreground mt-1'>{rawCounts.sub} screenings</p>
        </CardContent>
      </Card>

      {/* Graduated */}
      <Card
        className='cursor-pointer hover:bg-gray-50 transition-colors'
        onClick={() => handleCardClick(['graduated'])}>
        <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
          <CardTitle className='text-sm font-medium'>Graduated</CardTitle>
          <Calendar className='h-4 w-4 text-muted-foreground' />
        </CardHeader>
        <CardContent>
          <div className='text-2xl font-bold'>{stats.graduatedScreenings}</div>
          <p className='text-xs text-muted-foreground mt-1'>{rawCounts.graduated} screenings</p>
        </CardContent>
      </Card>

      {/* Caseload */}
      <Card
        className='cursor-pointer hover:bg-gray-50 transition-colors'
        onClick={() => handleCardClick(['qualified', 'sub'])}>
        <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
          <CardTitle className='text-sm font-medium'>Caseload</CardTitle>
          <Users className='h-4 w-4 text-muted-foreground' />
        </CardHeader>
        <CardContent>
          <div className='text-2xl font-bold'>{stats.caseloadScreenings}</div>
          <p className='text-xs text-muted-foreground mt-1'>{rawCounts.caseload} screenings</p>
        </CardContent>
      </Card>
    </div>
  )
}

export default ScreeningStats
