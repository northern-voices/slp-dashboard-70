import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { FileText, CheckCircle, XCircle, TrendingUp } from 'lucide-react'

const HearingScreeningStats = () => {
  // Dummy stats based on the 8 screenings in the table
  const stats = {
    totalScreenings: 8,
    passedScreenings: 4,
    referredScreenings: 4,
    completionRate: 100,
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
          <p className='text-xs text-muted-foreground'>All hearing screenings</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
          <CardTitle className='text-sm font-medium'>Passed</CardTitle>
          <CheckCircle className='h-4 w-4 text-green-600' />
        </CardHeader>
        <CardContent>
          <div className='text-2xl font-bold text-green-600'>{stats.passedScreenings}</div>
          <p className='text-xs text-muted-foreground'>
            {((stats.passedScreenings / stats.totalScreenings) * 100).toFixed(0)}% pass rate
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
          <CardTitle className='text-sm font-medium'>Referred</CardTitle>
          <XCircle className='h-4 w-4 text-red-600' />
        </CardHeader>
        <CardContent>
          <div className='text-2xl font-bold text-red-600'>{stats.referredScreenings}</div>
          <p className='text-xs text-muted-foreground'>
            {((stats.referredScreenings / stats.totalScreenings) * 100).toFixed(0)}% referred
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
          <CardTitle className='text-sm font-medium'>Completion Rate</CardTitle>
          <TrendingUp className='h-4 w-4 text-blue-600' />
        </CardHeader>
        <CardContent>
          <div className='text-2xl font-bold text-blue-600'>{stats.completionRate}%</div>
          <p className='text-xs text-muted-foreground'>On track</p>
        </CardContent>
      </Card>
    </div>
  )
}

export default HearingScreeningStats
