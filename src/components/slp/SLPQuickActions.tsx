import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useOrganization } from '@/contexts/OrganizationContext'
import { Plus, FileText, Users, Activity } from 'lucide-react'

const SLPQuickActions = () => {
  const { currentSchool } = useOrganization()

  const quickActions = [
    {
      title: 'New Speech Screening',
      description: 'Start a new speech and language screening',
      icon: Plus,
      color: 'bg-blue-600 hover:bg-blue-700',
      disabled: !currentSchool,
    },
    {
      title: 'New Hearing Screening',
      description: 'Begin a hearing assessment',
      icon: FileText,
      color: 'bg-emerald-600 hover:bg-emerald-700',
      disabled: !currentSchool,
    },
    {
      title: 'View Students',
      description: currentSchool
        ? `Browse students at ${currentSchool.name}`
        : 'Select a school to view students',
      icon: Users,
      color: 'bg-purple-600 hover:bg-purple-700',
      disabled: !currentSchool,
    },
    {
      title: 'Generate Report',
      description: 'Create screening reports',
      icon: Activity,
      color: 'bg-orange-600 hover:bg-orange-700',
      disabled: !currentSchool,
    },
  ]

  return (
    <Card className='bg-white border border-gray-100 shadow-sm rounded-xl'>
      <CardHeader className='pb-4'>
        <CardTitle className='text-lg font-medium text-gray-900'>Quick Actions</CardTitle>
        {!currentSchool && (
          <p className='text-sm text-gray-600'>Select a school above to enable screening actions</p>
        )}
      </CardHeader>
      <CardContent className='pt-0'>
        <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4'>
          {quickActions.map((action, index) => (
            <Button
              key={index}
              className={`h-auto p-4 flex flex-col items-center space-y-2 ${
                action.color
              } text-white transition-all duration-200 ${
                action.disabled ? 'opacity-50 cursor-not-allowed' : ''
              }`}
              disabled={action.disabled}>
              <action.icon className='w-6 h-6' />
              <div className='text-center'>
                <div className='font-medium text-sm'>{action.title}</div>
                <div className='text-xs opacity-90 mt-1'>{action.description}</div>
              </div>
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

export default SLPQuickActions
