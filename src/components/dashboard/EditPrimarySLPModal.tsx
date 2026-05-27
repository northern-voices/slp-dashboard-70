import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
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
import { UserCircle } from 'lucide-react'

interface EditPrimarySLPFormData {
  firstName: string
  lastName: string
  email: string
}

interface EditPrimarySLPModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSave: (data: EditPrimarySLPFormData) => Promise<void>
  initialData: EditPrimarySLPFormData
  isSaving?: boolean
}

const EditPrimarySLPModal: React.FC<EditPrimarySLPModalProps> = ({
  open,
  onOpenChange,
  onSave,
  initialData,
  isSaving = false,
}) => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<EditPrimarySLPFormData>({ defaultValues: initialData })

  useEffect(() => {
    if (open) {
      reset(initialData)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])

  const onSubmit = async (data: EditPrimarySLPFormData) => {
    await onSave({
      ...data,
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-[500px]'>
        <DialogHeader>
          <div className='flex items-center mb-2 space-x-3'>
            <div className='flex items-center justify-center w-10 h-10 bg-indigo-50 rounded-xl'>
              <UserCircle className='w-5 h-5 text-indigo-600' />
            </div>
            <DialogTitle>Edit Primary SLP</DialogTitle>
          </div>
          <DialogDescription>Update the primary SLP's contact information below.</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)}>
          <div className='py-4 space-y-5'>
            <div className='grid grid-cols-2 gap-4'>
              <div className='space-y-2'>
                <Label htmlFor='firstName' className='text-sm font-medium text-gray-700'>
                  First Name <span className='text-red-500'>*</span>
                </Label>
                <Input
                  id='firstName'
                  placeholder='First name'
                  {...register('firstName', { required: 'First name is required' })}
                  className='h-10 border-gray-200 rounded-lg focus:border-brand focus:ring-brand'
                />
                {errors.firstName && (
                  <p className='text-xs text-red-500'>{errors.firstName.message}</p>
                )}
              </div>

              <div className='space-y-2'>
                <Label htmlFor='lastName' className='text-sm font-medium text-gray-700'>
                  Last Name <span className='text-red-500'>*</span>
                </Label>
                <Input
                  id='lastName'
                  placeholder='Last name'
                  {...register('lastName', { required: 'Last name is required' })}
                  className='h-10 border-gray-200 rounded-lg focus:border-brand focus:ring-brand'
                />
                {errors.lastName && (
                  <p className='text-xs text-red-500'>{errors.lastName.message}</p>
                )}
              </div>
            </div>

            <div className='space-y-2'>
              <Label htmlFor='email' className='text-sm font-medium text-gray-700'>
                Email <span className='text-red-500'>*</span>
              </Label>
              <Input
                id='email'
                type='email'
                placeholder='e.g., slp@school.org'
                {...register('email', {
                  required: 'Email is required',
                  pattern: {
                    value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                    message: 'Please enter a valid email',
                  },
                })}
                className='h-10 border-gray-200 rounded-lg focus:border-brand focus:ring-brand'
              />
              {errors.email && <p className='text-xs text-red-500'>{errors.email.message}</p>}
            </div>
          </div>

          <DialogFooter className='mt-6'>
            <Button
              type='button'
              variant='outline'
              onClick={() => onOpenChange(false)}
              disabled={isSaving}
              className='leading-none border-gray-200 rounded-lg hover:bg-gray-50'>
              Cancel
            </Button>
            <Button
              type='submit'
              disabled={isSaving}
              className='leading-none text-white rounded-lg bg-brand hover:bg-brand/90'>
              {isSaving ? 'Saving...' : 'Save Changes'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export default EditPrimarySLPModal
