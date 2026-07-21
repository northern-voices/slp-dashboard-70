import { useEffect } from 'react'
import { useForm, Controller, useWatch } from 'react-hook-form'
import { X } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { OrgUser } from '@/types/database'
import { useOrganization } from '@/contexts/OrganizationContext'

export interface UserEditFormData {
  first_name: string
  last_name: string
  role: string
}

interface UserEditModalProps {
  isOpen: boolean
  onClose: () => void
  user: OrgUser | null
  onSave: (userId: string, data: UserEditFormData) => void
  onAssignSchool?: (userId: string, schoolId: string) => void
  onUnassignSchool?: (userId: string, schoolId: string) => void
  canManageAssignments?: boolean
}

const UserEditModal = ({
  isOpen,
  onClose,
  user,
  onSave,
  onAssignSchool,
  onUnassignSchool,
  canManageAssignments = false,
}: UserEditModalProps) => {
  const { availableSchools } = useOrganization()

  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors },
  } = useForm<UserEditFormData>({
    defaultValues: {
      first_name: user?.first_name || '',
      last_name: user?.last_name || '',
      role: user?.role || 'slp',
    },
  })

  const role = useWatch({ control, name: 'role' })

  useEffect(() => {
    reset({
      first_name: user?.first_name || '',
      last_name: user?.last_name || '',
      role: user?.role || 'slp',
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id, reset])

  const onSubmit = (data: UserEditFormData) => {
    if (!user) return
    onSave(user.id, data)
    onClose()
  }

  const unassignedSchools = availableSchools.filter(
    school => !user?.schools?.some(s => s.id === school.id)
  )

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className='max-w-md'>
        <DialogHeader>
          <DialogTitle>Edit User</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className='space-y-5'>
          <div className='grid grid-cols-2 gap-4'>
            <div className='space-y-2'>
              <Label htmlFor='first_name'>First Name</Label>
              <Input id='first_name' {...register('first_name', { required: true })} />
              {errors.first_name && <p className='text-sm text-red-500'>Required</p>}
            </div>
            <div className='space-y-2'>
              <Label htmlFor='last_name'>Last Name</Label>
              <Input id='last_name' {...register('last_name', { required: true })} />
              {errors.last_name && <p className='text-sm text-red-500'>Required</p>}
            </div>
          </div>

          <div className='space-y-2'>
            <Label>Email</Label>
            <div className='px-3 py-2 text-sm text-gray-500 border border-gray-200 rounded-md bg-gray-50'>
              {user?.email}
            </div>
          </div>

          <div className='space-y-2'>
            <Label htmlFor='role'>Role</Label>
            <Controller
              name='role'
              control={control}
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='slp'>Speech-Language Pathologist</SelectItem>
                    <SelectItem value='hearing_technician'>Hearing Technician</SelectItem>
                    <SelectItem value='admin'>Administrator</SelectItem>
                  </SelectContent>
                </Select>
              )}
            />
          </div>

          {role !== 'admin' && user && (
            <div className='space-y-2'>
              <Label>Schools</Label>
              <div className='flex flex-wrap items-center gap-1'>
                {user.schools && user.schools.length > 0 ? (
                  user.schools.map(school => (
                    <span
                      key={school.id}
                      className='inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium bg-blue-50 text-blue-700 border border-blue-100'>
                      {school.name}
                      {canManageAssignments && (
                        <button
                          type='button'
                          onClick={() => onUnassignSchool?.(user.id, school.id)}
                          className='hover:text-blue-900'
                          aria-label={`Remove ${school.name}`}>
                          <X className='w-3 h-3' />
                        </button>
                      )}
                    </span>
                  ))
                ) : (
                  <span className='text-sm italic text-gray-400'>No assignments</span>
                )}

                {canManageAssignments && unassignedSchools.length > 0 && (
                  <Select
                    key={user.schools?.length ?? 0}
                    onValueChange={schoolId => onAssignSchool?.(user.id, schoolId)}>
                    <SelectTrigger className='w-32 h-7 text-xs border-dashed'>
                      <SelectValue placeholder='+ Add school' />
                    </SelectTrigger>
                    <SelectContent>
                      {unassignedSchools.map(school => (
                        <SelectItem key={school.id} value={school.id}>
                          {school.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </div>
            </div>
          )}

          <div className='flex gap-3 pt-2'>
            <Button type='submit' className='flex-1'>
              Save Changes
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

export default UserEditModal
