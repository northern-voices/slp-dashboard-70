import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Calendar, CheckCircle, Clock, FileText } from 'lucide-react'
import { useScreenings, useScreeningsBySchool } from '@/hooks/screenings/use-screenings'
import { useOrganization } from '@/contexts/OrganizationContext'

interface ScreeningStatsProps {
  onFilterClick?: (filterValue: string) => void
  onClearAllFilters?: () => void
}

const ScreeningStats = ({ onFilterClick, onClearAllFilters }: ScreeningStatsProps) => {
  const { currentSchool } = useOrganization()

  // Use school-specific query when a school is selected
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

  // Determine which data to use
  const schoolScreenings = currentSchool ? schoolScreeningsData || [] : allScreeningsData || []
  const isLoading = currentSchool ? isLoadingSchool : isLoadingAll
  const isFetching = currentSchool ? isFetchingSchool : isFetchingAll
  const error = currentSchool ? errorSchool : errorAll

  // Get the latest screening for each student
  const latestScreeningsByStudent = schoolScreenings.reduce((acc, screening) => {
    const studentId = screening.student_id
    const existingScreening = acc.get(studentId)

    if (
      !existingScreening ||
      new Date(screening.created_at) > new Date(existingScreening.created_at)
    ) {
      acc.set(studentId, screening)
    }

    return acc
  }, new Map())

  const latestScreenings = Array.from(latestScreeningsByStudent.values())

  const qualifiedScreenings = latestScreenings.filter(
    s => s.error_patterns?.screening_metadata?.qualifies_for_speech_program === true
  )
  const subsScreenings = latestScreenings.filter(
    s => s.error_patterns?.screening_metadata?.sub === true
  )
  const graduatedScreenings = latestScreenings.filter(
    s => s.error_patterns?.screening_metadata?.graduated === true
  )

  const stats = {
    totalScreenings: schoolScreenings.length,
    qualifiedScreenings: qualifiedScreenings.length,
    subsScreenings: subsScreenings.length,
    scheduledScreenings: graduatedScreenings.length,
  }

  const handleCardClick = (filterValue: string) => {
    if (onFilterClick) {
      onFilterClick(filterValue)
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
        {[...Array(4)].map((_, i) => (
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
    <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8'>
      {/* Total Screenings*/}
      <Card className='cursor-pointer hover:bg-gray-50 transition-colors' onClick={handleClearAll}>
        <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
          <CardTitle className='text-sm font-medium'>Total Screenings</CardTitle>
          <FileText className='h-4 w-4 text-muted-foreground' />
        </CardHeader>
        <CardContent>
          <div className='text-2xl font-bold'>{stats.totalScreenings}</div>
        </CardContent>
      </Card>

      {/* Qualified */}
      <Card
        className='cursor-pointer hover:bg-gray-50 transition-colors'
        onClick={() => handleCardClick('qualified')}>
        <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
          <CardTitle className='text-sm font-medium'>Qualified</CardTitle>
          <CheckCircle className='h-4 w-4 text-muted-foreground' />
        </CardHeader>
        <CardContent>
          <div className='text-2xl font-bold'>{stats.qualifiedScreenings}</div>
        </CardContent>
      </Card>

      {/* Subs */}
      <Card
        className='cursor-pointer hover:bg-gray-50 transition-colors'
        onClick={() => handleCardClick('sub')}>
        <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
          <CardTitle className='text-sm font-medium'>Subs</CardTitle>
          <Clock className='h-4 w-4 text-muted-foreground' />
        </CardHeader>
        <CardContent>
          <div className='text-2xl font-bold'>{stats.subsScreenings}</div>
        </CardContent>
      </Card>

      {/* Graduated */}
      <Card
        className='cursor-pointer hover:bg-gray-50 transition-colors'
        onClick={() => handleCardClick('graduated')}>
        <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
          <CardTitle className='text-sm font-medium'>Graduated</CardTitle>
          <Calendar className='h-4 w-4 text-muted-foreground' />
        </CardHeader>
        <CardContent>
          <div className='text-2xl font-bold'>{stats.scheduledScreenings}</div>
        </CardContent>
      </Card>
    </div>
  )
}

export default ScreeningStats
