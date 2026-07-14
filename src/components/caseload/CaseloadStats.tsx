import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { CheckCircle, Clock, GraduationCap, Users } from 'lucide-react'

interface CaseloadStatsProps {
  stats: { qualified: number; sub: number; graduated: number }
  activeFilter: string
  onFilterChange: (filter: string) => void
}

const CaseloadStats = ({ stats, activeFilter, onFilterChange }: CaseloadStatsProps) => {
  const toggle = (value: string) => onFilterChange(activeFilter === value ? 'all' : value)
  const total = stats.qualified + stats.sub + stats.graduated

  return (
    <div className='grid grid-cols-1 md:grid-cols-4 gap-4'>
      <Card
        className={`cursor-pointer transition-colors ${
          activeFilter === 'all' ? 'ring-2 ring-blue-300 bg-blue-50' : 'hover:bg-gray-50'
        }`}
        onClick={() => onFilterChange('all')}>
        <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
          <CardTitle className='text-sm font-medium'>Total</CardTitle>
          <Users className='h-4 w-4 text-blue-600' />
        </CardHeader>
        <CardContent>
          <div className='text-2xl font-bold'>{total}</div>
          <p className='text-xs text-muted-foreground mt-1'>total students</p>
        </CardContent>
      </Card>

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
          activeFilter === 'graduated' ? 'ring-2 ring-blue-300 bg-blue-50' : 'hover:bg-gray-50'
        }`}
        onClick={() => toggle('graduated')}>
        <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
          <CardTitle className='text-sm font-medium'>Graduated</CardTitle>
          <GraduationCap className='h-4 w-4 text-blue-500' />
        </CardHeader>
        <CardContent>
          <div className='text-2xl font-bold'>{stats.graduated}</div>
          <p className='text-xs text-muted-foreground mt-1'>students graduated</p>
        </CardContent>
      </Card>
    </div>
  )
}

export default CaseloadStats
