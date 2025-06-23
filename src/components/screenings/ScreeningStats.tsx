import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Calendar, CheckCircle, Clock, FileText, Loader2 } from 'lucide-react'
import { useScreenings } from '@/hooks/screenings/use-screenings'
import { useOrganization } from '@/contexts/OrganizationContext'

const ScreeningStats = () => {
  const { currentSchool } = useOrganization()
  const { data: allScreenings, isLoading, error } = useScreenings()

  // Filter screenings by current school
  const schoolScreenings = currentSchool
    ? (allScreenings || []).filter(screening => screening.school_id === currentSchool.id)
    : allScreenings || []

  // Calculate stats from real data
  const stats = {
    totalScreenings: schoolScreenings.length,
    completedScreenings: schoolScreenings.filter(s => s.status === 'completed').length,
    pendingScreenings: schoolScreenings.filter(s => s.status === 'in_progress').length,
    scheduledScreenings: schoolScreenings.filter(s => s.status === 'scheduled').length,
    completionRate:
      schoolScreenings.length > 0
        ? Math.round(
            (schoolScreenings.filter(s => s.status === 'completed').length /
              schoolScreenings.length) *
              100
          )
        : 0,
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
      <Card>
        <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
          <CardTitle className='text-sm font-medium'>Total Screenings</CardTitle>
          <FileText className='h-4 w-4 text-muted-foreground' />
        </CardHeader>
        <CardContent>
          <div className='text-2xl font-bold'>{stats.totalScreenings}</div>
          <p className='text-xs text-muted-foreground'>All time</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
          <CardTitle className='text-sm font-medium'>Completed</CardTitle>
          <CheckCircle className='h-4 w-4 text-muted-foreground' />
        </CardHeader>
        <CardContent>
          <div className='text-2xl font-bold'>{stats.completedScreenings}</div>
          <p className='text-xs text-muted-foreground'>{stats.completionRate}% completion rate</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
          <CardTitle className='text-sm font-medium'>In Progress</CardTitle>
          <Clock className='h-4 w-4 text-muted-foreground' />
        </CardHeader>
        <CardContent>
          <div className='text-2xl font-bold'>{stats.pendingScreenings}</div>
          <p className='text-xs text-muted-foreground'>Requires attention</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
          <CardTitle className='text-sm font-medium'>Scheduled</CardTitle>
          <Calendar className='h-4 w-4 text-muted-foreground' />
        </CardHeader>
        <CardContent>
          <div className='text-2xl font-bold'>{stats.scheduledScreenings}</div>
          <p className='text-xs text-muted-foreground'>Upcoming</p>
        </CardContent>
      </Card>
    </div>
  )
}

export default ScreeningStats
