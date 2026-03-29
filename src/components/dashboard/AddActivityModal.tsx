import React from 'react'
import { useForm, Controller } from 'react-hook-form'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

interface Activity {
  activity_type: string
  activity_date: string
  notes: string
}

interface AddActivityModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onAddActivity: (activity: Activity) => void
}

const ACTIVITY_TYPES = [
  { value: 'speech_screen', label: 'Speech Screen' },
  { value: 'hearing_screen', label: 'Hearing Screen' },
  { value: 'school_visit_training', label: 'School Visit: Training' },
  { value: 'school_visit_other', label: 'School Visit: Other' },
  { value: 'monthly_meeting', label: 'Monthly Meeting' },
  { value: 'phone_call', label: 'Phone Call' },
  { value: 'email', label: 'Email' },
  { value: 'consult_outside_providers', label: 'Consult: Outside Service Providers' },
]

const AddActivityModal: React.FC<AddActivityModalProps> = ({
  open,
  onOpenChange,
  onAddActivity,
}) => {
  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { isValid },
  } = useForm<Activity>({
    defaultValues: {
      activity_type: '',
      activity_date: new Date().toISOString().split('T')[0],
      notes: '',
    },
    mode: 'onChange',
  })

  const onSubmit = (data: Activity) => {
    onAddActivity(data)
    onOpenChange(false)
    reset({
      activity_type: '',
      activity_date: new Date().toISOString().split('T')[0],
      notes: '',
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-[500px]'>
        <DialogHeader>
          <DialogTitle className='text-xl font-semibold text-gray-900'>
            Add School Activity
          </DialogTitle>
          <DialogDescription className='text-sm text-gray-500'>
            Log a new activity for this school.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className='space-y-4 py-4'>
          {/* Activity Type */}
          <div className='space-y-2'>
            <Label htmlFor='activity_type' className='text-sm font-medium text-gray-700'>
              Activity Type <span className='text-red-500'>*</span>
            </Label>

            <Controller
              name='activity_type'
              control={control}
              rules={{ required: true }}
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger className='h-10 rounded-lg border-gray-200'>
                    <SelectValue placeholder='Select activity type' />
                  </SelectTrigger>
                  <SelectContent>
                    {ACTIVITY_TYPES.map(type => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </div>

          {/* Date */}
          <div className='space-y-2'>
            <Label htmlFor='activity_date' className='text-sm font-medium text-gray-700'>
              Date <span className='text-red-500'>*</span>
            </Label>
            <Input
              id='activity_date'
              type='date'
              {...register('activity_date', { required: true })}
              className='h-10 rounded-lg border-gray-200'
            />
          </div>

          {/* Notes */}
          <div className='space-y-2'>
            <Label htmlFor='notes' className='text-sm font-medium text-gray-700'>
              Notes
            </Label>
            <Textarea
              id='notes'
              placeholder='Add any relevant notes about this activity...'
              {...register('notes')}
              className='min-h-[100px] rounded-lg border-gray-200 resize-none'
            />
          </div>

          <DialogFooter>
            <Button
              type='button'
              variant='outline'
              onClick={() => onOpenChange(false)}
              className='border-gray-200 hover:bg-gray-50'>
              Cancel
            </Button>
            <Button
              type='submit'
              className='bg-brand hover:bg-brand/90 text-white'
              disabled={!isValid}>
              Add Activity
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export default AddActivityModal
