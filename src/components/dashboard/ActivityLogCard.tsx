import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Calendar, Plus, FileText, Trash2, User, Pencil } from 'lucide-react'
import { parseDateSafely } from '@/utils/dateUtils'
import { Activity } from '@/types/database'

interface ActivityLogCardProps {
  activities: Activity[]
  onAddActivity: () => void
  onDeleteActivity?: (activityId: string) => void
  onEditActivity?: (
    activityId: string,
    updates: Partial<Pick<Activity, 'activity_type' | 'activity_date' | 'notes'>>
  ) => void
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

const ActivityLogCard: React.FC<ActivityLogCardProps> = ({
  activities,
  onAddActivity,
  onDeleteActivity,
  onEditActivity,
}) => {
  const [activityToDeleteId, setActivityToDeleteId] = useState<string | null>(null)
  const [activityToEdit, setActivityToEdit] = useState<Activity | null>(null)
  const [editForm, setEditForm] = useState({ activity_type: '', activity_date: '', notes: '' })

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

                      {activity.creator && (
                        <div className='flex items-center space-x-1.5 text-xs text-gray-400'>
                          <User className='w-3 h-3' />
                          <span>
                            {activity.creator.first_name} {activity.creator.last_name}
                          </span>
                        </div>
                      )}
                    </div>
                    <div className='flex items-center mt-2 space-x-2 text-xs text-gray-500'>
                      <Calendar className='w-3 h-3' />
                      <span>{formatDate(activity.activity_date)}</span>
                    </div>
                    {activity.notes && (
                      <p className='mt-2 text-sm text-gray-700'>{activity.notes}</p>
                    )}
                  </div>
                  {onDeleteActivity && (
                    <Button
                      variant='ghost'
                      size='sm'
                      className='shrink-0 ml-2 h-8 w-8 p-0 text-gray-400 hover:text-red-600 hover:bg-red-50'
                      onClick={() => setActivityToDeleteId(activity.id)}
                      aria-label='Delete activity'>
                      <Trash2 className='w-4 h-4' />
                    </Button>
                  )}

                  {onEditActivity && (
                    <Button
                      variant='ghost'
                      size='sm'
                      className='shrink-0 ml-2 h-8 w-8 p-0 text-gray-400 hover:text-blue-600 hover:bg-blue-50'
                      onClick={() => {
                        setActivityToEdit(activity)
                        setEditForm({
                          activity_type: activity.activity_type,
                          activity_date: activity.activity_date,
                          notes: activity.notes ?? '',
                        })
                      }}
                      aria-label='Edit Activity'>
                      <Pencil className='w-4 h-4' />
                    </Button>
                  )}
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

      <AlertDialog
        open={!!activityToDeleteId}
        onOpenChange={open => !open && setActivityToDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Activity</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this activity? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setActivityToDeleteId(null)}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (activityToDeleteId && onDeleteActivity) {
                  onDeleteActivity(activityToDeleteId)
                  setActivityToDeleteId(null)
                }
              }}
              className='bg-red-600 hover:bg-red-700'>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={!!activityToEdit} onOpenChange={open => !open && setActivityToEdit(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Edit Activity</AlertDialogTitle>
          </AlertDialogHeader>

          <div className='space-y-3 py-2'>
            <div>
              <label className='text-xs font-medium text-gray-700'>Activity Type</label>
              <select
                className='mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm'
                value={editForm.activity_type}
                onChange={e => setEditForm(f => ({ ...f, activity_type: e.target.value }))}>
                {Object.entries(ACTIVITY_TYPE_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className='text-xs font-medium text-gray-700'>Date</label>
              <input
                type='date'
                className='mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm'
                value={editForm.activity_date.slice(0, 10)}
                onChange={e => setEditForm(f => ({ ...f, activity_date: e.target.value }))}
              />
            </div>

            <div>
              <label className='text-xs font-medium text-gray-700'>Notes</label>
              <textarea
                className='mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm'
                rows={3}
                value={editForm.notes}
                onChange={e => setEditForm(f => ({ ...f, notes: e.target.value }))}
              />
            </div>
          </div>

          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setActivityToEdit(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (activityToEdit && onEditActivity) {
                  onEditActivity(activityToEdit.id, {
                    activity_type: editForm.activity_type,
                    activity_date: editForm.activity_date,
                    notes: editForm.notes || null,
                  })
                  setActivityToEdit(null)
                }
              }}>
              Save
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  )
}

export default ActivityLogCard
