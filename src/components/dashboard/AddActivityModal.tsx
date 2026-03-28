import React, { useState } from 'react'
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
  const [formData, setFormData] = useState<Activity>({
    activity_type: '',
    activity_date: new Date().toISOString().split('T')[0], // Today's date
    notes: '',
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.activity_type || !formData.activity_date) {
      return
    }

    onAddActivity(formData)
    onOpenChange(false)

    // Reset form
    setFormData({
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

        <form onSubmit={handleSubmit} className='space-y-4 py-4'>
          {/* Activity Type */}
          <div className='space-y-2'>
            <Label htmlFor='activity_type' className='text-sm font-medium text-gray-700'>
              Activity Type <span className='text-red-500'>*</span>
            </Label>
            <Select
              value={formData.activity_type}
              onValueChange={value => setFormData(prev => ({ ...prev, activity_type: value }))}>
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
          </div>

          {/* Date */}
          <div className='space-y-2'>
            <Label htmlFor='activity_date' className='text-sm font-medium text-gray-700'>
              Date <span className='text-red-500'>*</span>
            </Label>
            <Input
              id='activity_date'
              type='date'
              value={formData.activity_date}
              onChange={e => setFormData(prev => ({ ...prev, activity_date: e.target.value }))}
              className='h-10 rounded-lg border-gray-200'
              required
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
              value={formData.notes}
              onChange={e => setFormData(prev => ({ ...prev, notes: e.target.value }))}
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
              disabled={!formData.activity_type || !formData.activity_date}>
              Add Activity
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export default AddActivityModal
