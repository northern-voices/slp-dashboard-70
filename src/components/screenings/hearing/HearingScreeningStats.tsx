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
        </CardContent>
      </Card>

      <Card>
        <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
          <CardTitle className='text-sm font-medium'>Passed</CardTitle>
          <CheckCircle className='h-4 w-4 text-muted-foreground' />
        </CardHeader>
        <CardContent>
          <div className='text-2xl font-bold'>{stats.passedScreenings}</div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
          <CardTitle className='text-sm font-medium'>Referred</CardTitle>
          <XCircle className='h-4 w-4' />
        </CardHeader>
        <CardContent>
          <div className='text-2xl font-bold'>{stats.referredScreenings}</div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
          <CardTitle className='text-sm font-medium'>Completion Rate</CardTitle>
          <TrendingUp className='h-4 w-4' />
        </CardHeader>
        <CardContent>
          <div className='text-2xl font-bold'>{stats.completionRate}%</div>
        </CardContent>
      </Card>
    </div>
  )
}

export default HearingScreeningStats
