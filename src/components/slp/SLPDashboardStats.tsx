import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { FileText, ArrowUp, GraduationCap } from 'lucide-react'
import { useSchool } from '@/contexts/SchoolContext'
import { useStudentCountBySchool } from '@/hooks/students'
import { useRecentScreeningsBySchool } from '@/hooks/screenings'

const SLPDashboardStats = () => {
  const { selectedSchool, isLoading: schoolLoading } = useSchool()

  // Fetch real data based on selected school
  const { data: studentCount = 0, isLoading: studentsLoading } = useStudentCountBySchool(
    selectedSchool?.id
  )

  const { data: recentScreeningsCount = 0, isLoading: screeningsLoading } =
    useRecentScreeningsBySchool(
      selectedSchool?.id,
      7 // Last 7 days
    )

  const isLoading = schoolLoading || studentsLoading || screeningsLoading

  // Calculate percentage change (mock for now, could be enhanced with historical data)
  const getPercentageChange = (current: number, previous: number = 0) => {
    if (previous === 0) return current > 0 ? '+100%' : '0%'
    const change = ((current - previous) / previous) * 100
    return change >= 0 ? `+${change.toFixed(1)}%` : `${change.toFixed(1)}%`
  }

  const statsData = [
    {
      title: 'Students',
      value: studentCount.toString(),
      change: selectedSchool ? `at ${selectedSchool.name}` : 'No school selected',
      percentage: getPercentageChange(studentCount, Math.floor(studentCount * 0.95)), // Mock previous value
      icon: GraduationCap,
      color: 'text-brand',
      bgColor: 'bg-blue-50',
    },
    {
      title: 'Recent Screenings',
      value: recentScreeningsCount.toString(),
      change: 'Last 7 days',
      percentage: getPercentageChange(
        recentScreeningsCount,
        Math.floor(recentScreeningsCount * 0.9)
      ), // Mock previous value
      icon: FileText,
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-50',
    },
  ]

  if (isLoading) {
    return (
      <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
        {[1, 2].map(i => (
          <Card key={i} className='bg-white border border-gray-100 shadow-sm rounded-xl'>
            <CardHeader className='pb-3'>
              <div className='flex items-center justify-between'>
                <div className='h-4 bg-gray-200 rounded w-28 animate-pulse'></div>
                <div className='w-12 h-12 bg-gray-100 rounded-xl animate-pulse'></div>
              </div>
            </CardHeader>
            <CardContent className='pt-0'>
              <div className='space-y-3'>
                <div className='h-8 bg-gray-200 rounded w-16 animate-pulse'></div>
                <div className='flex items-center justify-between'>
                  <div className='h-4 bg-gray-200 rounded w-24 animate-pulse'></div>
                  <div className='h-6 bg-gray-200 rounded-full w-16 animate-pulse'></div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (!selectedSchool) {
    return (
      <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
        <Card className='bg-white border border-gray-100 shadow-sm rounded-xl'>
          <CardContent className='p-6'>
            <div className='text-center'>
              <GraduationCap className='w-12 h-12 text-gray-400 mx-auto mb-4' />
              <h3 className='text-lg font-medium text-gray-900 mb-2'>Select a School</h3>
              <p className='text-gray-600 text-sm'>
                Choose a school from the dropdown above to view statistics and manage students.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
      {statsData.map((stat, index) => (
        <Card
          key={index}
          className='bg-white border border-gray-100 shadow-sm hover:shadow-md transition-all duration-200 rounded-xl'>
          <CardHeader className='pb-3'>
            <div className='flex items-center justify-between'>
              <CardTitle className='text-sm font-medium text-gray-600 tracking-wide'>
                {stat.title}
              </CardTitle>
              <div
                className={`w-12 h-12 ${stat.bgColor} rounded-xl flex items-center justify-center transition-colors duration-200`}>
                <stat.icon className={`h-6 w-6 ${stat.color}`} />
              </div>
            </div>
          </CardHeader>
          <CardContent className='pt-0'>
            <div className='space-y-3'>
              <div className='text-3xl font-semibold text-gray-900 tracking-tight'>
                {stat.value}
              </div>
              <div className='flex items-center justify-between'>
                <p className='text-sm text-gray-500 font-medium'>{stat.change}</p>
                <div className='flex items-center space-x-1 px-2.5 py-1 rounded-full text-xs font-medium text-emerald-600 bg-emerald-50'>
                  <ArrowUp className='w-3 h-3' />
                  <span>{stat.percentage}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

export default SLPDashboardStats
