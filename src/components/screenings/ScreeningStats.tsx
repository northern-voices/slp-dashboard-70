import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Calendar, CheckCircle, Clock, FileText, Users } from 'lucide-react'
import { useScreeningStats } from '@/hooks/screenings/use-screenings'
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

  const { data, isLoading, error } = useScreeningStats(
    currentSchool?.id,
    dateRangeFilter === 'school_year' ? 'school_year' : 'all'
  )

  const handleCardClick = (filterValues: string[], deduplicate: boolean) => {
    if (onFilterClick) onFilterClick(filterValues, deduplicate)
  }

  const handleClearAll = () => {
    if (onClearAllFilters) onClearAllFilters()
  }

  if (isLoading) return <ScreeningStatsSkeleton />

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
      {/* Total Screenings */}
      <Card className='cursor-pointer hover:bg-gray-50 transition-colors' onClick={handleClearAll}>
        <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
          <CardTitle className='text-sm font-medium'>Total Screenings</CardTitle>
          <FileText className='h-4 w-4 text-muted-foreground' />
        </CardHeader>
        <CardContent>
          <div className='text-2xl font-bold'>{data?.total_students ?? 0}</div>
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
          <div className='text-2xl font-bold'>{data?.caseload ?? 0}</div>
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
          <div className='text-2xl font-bold'>{data?.qualified ?? 0}</div>
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
          <div className='text-2xl font-bold'>{data?.sub ?? 0}</div>
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
          <div className='text-2xl font-bold'>{data?.graduated ?? 0}</div>
        </CardContent>
      </Card>
    </div>
  )
}

export default ScreeningStats
