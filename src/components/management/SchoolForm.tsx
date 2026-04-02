import React from 'react'
import { useForm, Controller } from 'react-hook-form'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
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
import { useToast } from '@/hooks/use-toast'
import GradeManagement from './GradeManagement'

interface SchoolFormData {
  name: string
  address: string
  principal: string
  principalEmail: string
  phone: string
  district: string
  status: string
  notes: string
  grades: string[]
}

interface SchoolFormProps {
  isOpen: boolean
  onClose: () => void
  school?: Partial<SchoolFormData>
  onSave: (schoolData: SchoolFormData) => void
}

const SchoolForm = ({ isOpen, onClose, school, onSave }: SchoolFormProps) => {
  const { toast } = useToast()
  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<SchoolFormData>({
    defaultValues: {
      name: school?.name || '',
      address: school?.address || '',
      principal: school?.principal || '',
      principalEmail: school?.principalEmail || '',
      phone: school?.phone || '',
      district: school?.district || '',
      status: school?.status || 'active',
      notes: school?.notes || '',
      grades: school?.grades || [],
    },
  })

  const onSubmit = (data: SchoolFormData) => {
    onSave(data)
    toast({
      title: 'Success',
      description: school ? 'School updated successfully' : 'School created successfully',
    })
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className='max-w-3xl max-h-[90vh] overflow-y-auto'>
        <DialogHeader>
          <DialogTitle>{school ? 'Edit School' : 'Add New School'}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className='space-y-6'>
          <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
            <div className='space-y-2'>
              <Label htmlFor='name'>School Name *</Label>
              <Input
                id='name'
                {...register('name', { required: true })}
                placeholder='Enter school name'
              />
            </div>

            <div className='space-y-2'>
              <Label htmlFor='district'>District</Label>
              <Input id='district' {...register('district')} placeholder='Enter district name' />
            </div>
          </div>

          <div className='space-y-2'>
            <Label htmlFor='address'>Address</Label>
            <Textarea
              id='address'
              {...register('address')}
              placeholder='Enter full address'
              rows={2}
            />
          </div>

          <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
            <div className='space-y-2'>
              <Label htmlFor='principal'>Principal Name</Label>
              <Input id='principal' {...register('principal')} placeholder='Enter principal name' />
            </div>

            <div className='space-y-2'>
              <Label htmlFor='principalEmail'>Principal Email</Label>
              <Input
                id='principalEmail'
                type='email'
                {...register('principalEmail')}
                placeholder='Enter principal email'
              />
            </div>
          </div>

          <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
            <div className='space-y-2'>
              <Label htmlFor='phone'>Phone Number</Label>
              <Input id='phone' {...register('phone')} placeholder='Enter phone number' />
            </div>

            <div className='space-y-2'>
              <Label htmlFor='status'>Status</Label>
              <Controller
                name='status'
                control={control}
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value='active'>Active</SelectItem>
                      <SelectItem value='inactive'>Inactive</SelectItem>
                      <SelectItem value='pending'>Pending</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
          </div>

          <div className='border rounded-lg p-4 bg-gray-50'>
            <Controller
              name='grades'
              control={control}
              rules={{ validate: v => v.length > 0 }}
              render={({ field }) => (
                <GradeManagement selectedGrades={field.value} onGradesChange={field.onChange} />
              )}
            />
          </div>

          <div className='space-y-2'>
            <Label htmlFor='notes'>Notes</Label>
            <Textarea
              id='notes'
              {...register('notes')}
              placeholder='Additional notes about the school'
              rows={3}
            />
          </div>

          <div className='flex gap-3 pt-4'>
            <Button type='submit' className='flex-1'>
              {school ? 'Update School' : 'Create School'}
            </Button>
            <Button type='button' variant='outline' onClick={onClose} className='flex-1'>
              Cancel
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export default SchoolForm
