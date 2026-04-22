import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Calendar, CheckCircle, Clock, FileText, Users } from 'lucide-react'
import { useScreenings, useScreeningsBySchool } from '@/hooks/screenings/use-screenings'
import { useOrganization } from '@/contexts/OrganizationContext'
import ScreeningStatsSkeleton from '@/components/skeletons/ScreeningStatsSkeleton'

interface ScreeningStatsProps {
  onFilterClick?: (filterValues: string[], deduplicate: boolean) => void
  onClearAllFilters?: () => void
  dateRangeFilter?: string
}

const ScreeningStats = ({
  onFilterClick,
  onClearAllFilters,
  dateRangeFilter = 'school_year',
}: ScreeningStatsProps) => {
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
  } = useScreeningsBySchool(
    currentSchool?.id,
    dateRangeFilter === 'school_year' ? 'school_year' : 'all',
    1,
    10000 // fetch all records
  )

  const schoolScreenings = currentSchool
    ? (schoolScreeningsData?.screenings ?? [])
    : (allScreeningsData ?? [])
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
    latestScreenings.filter(s => s.service_status === 'graduated').map(s => s.student_id)
  )

  const qualifiedStudentIds = new Set(
    latestScreenings.filter(s => s.program_status === 'qualified').map(s => s.student_id)
  )

  const subStudentIds = new Set(
    latestScreenings.filter(s => s.program_status === 'sub').map(s => s.student_id)
  )

  const pausedStudentIds = new Set(
    latestScreenings.filter(s => s.service_status === 'paused').map(s => s.student_id)
  )

  const caseloadStudentIds = new Set([...qualifiedStudentIds, ...subStudentIds])

  // Raw screening record counts
  const rawCounts = {
    total: schoolScreenings.length,
    qualified: schoolScreenings.filter(s => s.program_status === 'qualified').length,
    sub: schoolScreenings.filter(s => s.program_status === 'sub').length,
    paused: schoolScreenings.filter(s => s.service_status === 'paused').length,
    graduated: schoolScreenings.filter(s => s.service_status === 'graduated').length,
    caseload: schoolScreenings.filter(
      s => s.program_status === 'qualified' || s.program_status === 'sub'
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

  const handleCardClick = (filterValues: string[], deduplicate: boolean) => {
    if (onFilterClick) {
      onFilterClick(filterValues, deduplicate)
    }
  }

  const handleClearAll = () => {
    if (onClearAllFilters) {
      onClearAllFilters()
    }
  }

  if (isLoading) {
    return <ScreeningStatsSkeleton />
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

      {/* Caseload */}
      <Card
        className='cursor-pointer hover:bg-gray-50 transition-colors'
        onClick={() => handleCardClick(['qualified', 'sub'], false)}>
        <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
          <CardTitle className='text-sm font-medium'>Caseload</CardTitle>
          <Users className='h-4 w-4 text-muted-foreground' />
        </CardHeader>
        <CardContent>
          <div className='text-2xl font-bold'>{stats.caseloadScreenings}</div>
          <div className='flex gap-2 mt-2'>
            <button
              className='text-xs text-blue-600 hover:underline'
              onClick={e => {
                e.stopPropagation()
                handleCardClick(['qualified', 'sub'], true)
              }}>
              {stats.caseloadScreenings} students
            </button>
            <span className='text-xs text-muted-foreground'>·</span>
            <button
              className='text-xs text-muted-foreground hover:underline'
              onClick={e => {
                e.stopPropagation()
                handleCardClick(['qualified', 'sub'], false)
              }}>
              {rawCounts.caseload} screenings
            </button>
          </div>
        </CardContent>
      </Card>

      {/* Qualified */}
      <Card
        className='cursor-pointer hover:bg-gray-50 transition-colors'
        onClick={() => handleCardClick(['qualified'], false)}>
        <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
          <CardTitle className='text-sm font-medium'>Qualified</CardTitle>
          <CheckCircle className='h-4 w-4 text-muted-foreground' />
        </CardHeader>
        <CardContent>
          <div className='text-2xl font-bold'>{stats.qualifiedScreenings}</div>
          <div className='flex gap-2 mt-2'>
            <button
              className='text-xs text-blue-600 hover:underline'
              onClick={e => {
                e.stopPropagation()
                handleCardClick(['qualified'], true)
              }}>
              {stats.qualifiedScreenings} students
            </button>
            <span className='text-xs text-muted-foreground'>·</span>
            <button
              className='text-xs text-muted-foreground hover:underline'
              onClick={e => {
                e.stopPropagation()
                handleCardClick(['qualified'], false)
              }}>
              {rawCounts.qualified} screenings
            </button>
          </div>
        </CardContent>
      </Card>

      {/* Subs */}
      <Card
        className='cursor-pointer hover:bg-gray-50 transition-colors'
        onClick={() => handleCardClick(['sub'], false)}>
        <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
          <CardTitle className='text-sm font-medium'>Subs</CardTitle>
          <Clock className='h-4 w-4 text-muted-foreground' />
        </CardHeader>
        <CardContent>
          <div className='text-2xl font-bold'>{stats.subsScreenings}</div>
          <div className='flex gap-2 mt-2'>
            <button
              className='text-xs text-blue-600 hover:underline'
              onClick={e => {
                e.stopPropagation()
                handleCardClick(['sub'], true)
              }}>
              {stats.subsScreenings} students
            </button>
            <span className='text-xs text-muted-foreground'>·</span>
            <button
              className='text-xs text-muted-foreground hover:underline'
              onClick={e => {
                e.stopPropagation()
                handleCardClick(['sub'], false)
              }}>
              {rawCounts.sub} screenings
            </button>
          </div>
        </CardContent>
      </Card>

      {/* Graduated */}
      <Card
        className='cursor-pointer hover:bg-gray-50 transition-colors'
        onClick={() => handleCardClick(['graduated'], false)}>
        <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
          <CardTitle className='text-sm font-medium'>Graduated</CardTitle>
          <Calendar className='h-4 w-4 text-muted-foreground' />
        </CardHeader>
        <CardContent>
          <div className='text-2xl font-bold'>{stats.graduatedScreenings}</div>
          <div className='flex gap-2 mt-2'>
            <button
              className='text-xs text-blue-600 hover:underline'
              onClick={e => {
                e.stopPropagation()
                handleCardClick(['graduated'], true)
              }}>
              {stats.graduatedScreenings} students
            </button>
            <span className='text-xs text-muted-foreground'>·</span>
            <button
              className='text-xs text-muted-foreground hover:underline'
              onClick={e => {
                e.stopPropagation()
                handleCardClick(['graduated'], false)
              }}>
              {rawCounts.graduated} screenings
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default ScreeningStats
