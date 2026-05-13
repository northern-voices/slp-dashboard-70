import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { CheckCircle, Clock, PauseCircle } from 'lucide-react'

interface CaseloadStatsProps {
  stats: { qualified: number; sub: number; paused: number }
  activeFilter: string
  onFilterChange: (filter: string) => void
}

const CaseloadStats = ({ stats, activeFilter, onFilterChange }: CaseloadStatsProps) => {
  const toggle = (value: string) => onFilterChange(activeFilter === value ? 'all' : value)

  return (
    <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
      <Card
        className={`cursor-pointer transition-colors ${
          activeFilter === 'qualified' ? 'ring-2 ring-red-300 bg-red-50' : 'hover:bg-gray-50'
        }`}
        onClick={() => toggle('qualified')}>
        <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
          <CardTitle className='text-sm font-medium'>Qualified</CardTitle>
          <CheckCircle className='h-4 w-4 text-red-500' />
        </CardHeader>
        <CardContent>
          <div className='text-2xl font-bold'>{stats.qualified}</div>
          <p className='text-xs text-muted-foreground mt-1'>students in program</p>
        </CardContent>
      </Card>

      <Card
        className={`cursor-pointer transition-colors ${
          activeFilter === 'sub' ? 'ring-2 ring-orange-300 bg-orange-50' : 'hover:bg-gray-50'
        }`}
        onClick={() => toggle('sub')}>
        <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
          <CardTitle className='text-sm font-medium'>Subs</CardTitle>
          <Clock className='h-4 w-4 text-orange-500' />
        </CardHeader>
        <CardContent>
          <div className='text-2xl font-bold'>{stats.sub}</div>
          <p className='text-xs text-muted-foreground mt-1'>students on sub list</p>
        </CardContent>
      </Card>

      <Card
        className={`cursor-pointer transition-colors ${
          activeFilter === 'paused' ? 'ring-2 ring-purple-300 bg-purple-50' : 'hover:bg-gray-50'
        }`}
        onClick={() => toggle('paused')}>
        <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
          <CardTitle className='text-sm font-medium'>Pause / Away</CardTitle>
          <PauseCircle className='h-4 w-4 text-purple-500' />
        </CardHeader>
        <CardContent>
          <div className='text-2xl font-bold'>{stats.paused}</div>
          <p className='text-xs text-muted-foreground mt-1'>students paused</p>
        </CardContent>
      </Card>
    </div>
  )
}

export default CaseloadStats
