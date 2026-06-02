import React from 'react'
import { useForm } from 'react-hook-form'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { School } from '@/types/database'

export interface SchoolFormData {
  name: string
  address: string
  city: string
  state: string
  zip: string
  principal_name: string
  principal_email: string
  phone: string
}

interface SchoolFormProps {
  isOpen: boolean
  onClose: () => void
  school?: School | null
  onSave: (schoolData: SchoolFormData) => void
}

const SchoolForm = ({ isOpen, onClose, school, onSave }: SchoolFormProps) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SchoolFormData>({
    defaultValues: {
      name: school?.name || '',
      address: school?.address || '',
      city: school?.city || '',
      state: school?.state || '',
      zip: school?.zip || '',
      principal_name: school?.principal_name || '',
      principal_email: school?.principal_email || '',
      phone: school?.phone || '',
    },
  })

  const onSubmit = (data: SchoolFormData) => {
    onSave(data)
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className='max-w-3xl max-h-[90vh] overflow-y-auto'>
        <DialogHeader>
          <DialogTitle>{school ? 'Edit School' : 'Add New School'}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className='space-y-6'>
          <div className='space-y-2'>
            <Label htmlFor='name'>School Name *</Label>
            <Input
              id='name'
              {...register('name', { required: true })}
              placeholder='Enter school name'
            />
            {errors.name && <p className='text-sm text-red-500'>School name is required</p>}
          </div>

          <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
            <div className='space-y-2'>
              <Label htmlFor='principal_name'>Principal Name</Label>
              <Input
                id='principal_name'
                {...register('principal_name')}
                placeholder='Enter principal name'
              />
            </div>
            <div className='space-y-2'>
              <Label htmlFor='principal_email'>Principal Email</Label>
              <Input
                id='principal_email'
                type='email'
                {...register('principal_email')}
                placeholder='Enter principal email'
              />
            </div>
          </div>

          <div className='space-y-2'>
            <Label htmlFor='address'>Street Address</Label>
            <Input id='address' {...register('address')} placeholder='Enter street address' />
          </div>

          <div className='grid grid-cols-1 gap-4 md:grid-cols-3'>
            <div className='space-y-2'>
              <Label htmlFor='city'>City</Label>
              <Input id='city' {...register('city')} placeholder='City' />
            </div>
            <div className='space-y-2'>
              <Label htmlFor='state'>Province / State</Label>
              <Input id='state' {...register('state')} placeholder='Province or state' />
            </div>
            <div className='space-y-2'>
              <Label htmlFor='zip'>Postal Code</Label>
              <Input id='zip' {...register('zip')} placeholder='Postal code' />
            </div>
          </div>

          <div className='space-y-2'>
            <Label htmlFor='phone'>Phone Number</Label>
            <Input id='phone' {...register('phone')} placeholder='Enter phone number' />
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
