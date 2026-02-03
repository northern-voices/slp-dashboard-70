import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Calendar, Plus, FileText } from 'lucide-react'
import { parseDateSafely } from '@/utils/dateUtils'

interface Activity {
  id: string
  activity_type: string
  activity_date: string
  notes: string | null
  created_at: string
}

interface ActivityLogCardProps {
  activities: Activity[]
  onAddActivity: () => void
}

const ACTIVITY_TYPE_LABELS: Record<string, string> = {
  speech_screen: 'Speech Screen',
  hearing_screen: 'Hearing Screen',
  school_visit_training: 'School Visit: Training',
  school_visit_other: 'School Visit: Other',
  monthly_meeting: 'Monthly Meeting',
  phone_call: 'Phone Call',
  email: 'Email',
  consult_outside_providers: 'Consult: Outside Service Providers',
}

const ActivityLogCard: React.FC<ActivityLogCardProps> = ({ activities, onAddActivity }) => {
  const formatDate = (dateString: string) => {
    console.log('--- Date Debug ---')
    console.log('Raw from DB:', dateString)
    console.log('With new Date():', new Date(dateString).toLocaleDateString('en-US'))
    console.log('With parseDateSafely():', parseDateSafely(dateString).toLocaleDateString('en-US'))
    console.log('User timezone:', Intl.DateTimeFormat().resolvedOptions().timeZone)

    const date = parseDateSafely(dateString)
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  return (
    <Card className='bg-white border border-gray-100 shadow-sm rounded-xl'>
      <CardHeader className='pb-4'>
        <div className='flex items-center justify-between'>
          <div className='flex items-center space-x-3'>
            <div className='flex items-center justify-center w-8 h-8 rounded-lg bg-green-50'>
              <FileText className='w-4 h-4 text-green-600' />
            </div>
            <div>
              <CardTitle className='text-xl font-semibold tracking-tight text-gray-900'>
                Activity Log
              </CardTitle>
              <p className='text-xs text-gray-500 mt-0.5'>
                {activities.length} {activities.length === 1 ? 'activity' : 'activities'}
              </p>
            </div>
          </div>

          <Button
            onClick={onAddActivity}
            size='sm'
            className='h-8 px-3 text-xs font-medium text-white rounded-lg bg-brand hover:bg-brand/90'>
            <div className='flex items-center space-x-1.5'>
              <Plus className='w-3.5 h-3.5' />
              <span className='leading-none'>Add Activity</span>
            </div>
          </Button>
        </div>
      </CardHeader>

      <CardContent className='pt-0'>
        {activities.length > 0 ? (
          <div className='space-y-2'>
            {activities.map(activity => (
              <div
                key={activity.id}
                className='p-3 transition-colors duration-150 rounded-lg bg-gray-50 hover:bg-gray-100'>
                <div className='flex items-start justify-between'>
                  <div className='flex-1'>
                    <div className='flex items-center space-x-2'>
                      <span className='inline-block px-2 py-0.5 rounded-md bg-green-100 text-green-700 text-xs font-medium'>
                        {ACTIVITY_TYPE_LABELS[activity.activity_type] || activity.activity_type}
                      </span>
                    </div>
                    <div className='flex items-center mt-2 space-x-2 text-xs text-gray-500'>
                      <Calendar className='w-3 h-3' />
                      <span>{formatDate(activity.activity_date)}</span>
                    </div>
                    {activity.notes && (
                      <p className='mt-2 text-sm text-gray-700'>{activity.notes}</p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className='p-6 border-2 border-gray-200 border-dashed rounded-lg bg-gray-50'>
            <div className='flex flex-col items-center justify-center text-center'>
              <div className='flex items-center justify-center w-12 h-12 mb-3 bg-gray-100 rounded-full'>
                <FileText className='w-6 h-6 text-gray-400' />
              </div>
              <h4 className='mb-1 text-sm font-semibold text-gray-900'>No Activities Yet</h4>
              <p className='mb-4 text-xs text-gray-500'>
                Start logging school activities to keep track of your interactions.
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export default ActivityLogCard
