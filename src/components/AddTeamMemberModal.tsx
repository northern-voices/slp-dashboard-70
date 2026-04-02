import React, { useState } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { TEAM_MEMBER_ROLES, getTeamRoleLabel } from '@/constants/teamRoles'
import { unformatPhoneNumber } from '@/utils/formatters'
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
import { Checkbox } from '@/components/ui/checkbox'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { UserPlus, ChevronDown, X } from 'lucide-react'

interface TeamMember {
  name: string
  roles: string[]
  email: string
  phone: string
}

interface AddTeamMemberModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onAddMember: (member: TeamMember) => void
}

const AddTeamMemberModal: React.FC<AddTeamMemberModalProps> = ({
  open,
  onOpenChange,
  onAddMember,
}) => {
  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<TeamMember>({
    defaultValues: {
      name: '',
      roles: [],
      email: '',
      phone: '',
    },
  })

  const [isPopoverOpen, setIsPopoverOpen] = useState(false)

  const onSubmit = (data: TeamMember) => {
    onAddMember({
      ...data,
      phone: data.phone ? unformatPhoneNumber(data.phone) : '',
    })
    reset()
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-[500px]'>
        <DialogHeader>
          <div className='flex items-center mb-2 space-x-3'>
            <div className='flex items-center justify-center w-10 h-10 bg-purple-50 rounded-xl'>
              <UserPlus className='w-5 h-5 text-purple-600' />
            </div>
            <DialogTitle>Add Team Member</DialogTitle>
          </div>
          <DialogDescription>
            Add a new member to the school team. Fill in all the required information below.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)}>
          <div className='py-4 space-y-5'>
            {/* Name Field */}
            <div className='space-y-2'>
              <Label htmlFor='name' className='text-sm font-medium text-gray-700'>
                Full Name <span className='text-red-500'>*</span>
              </Label>
              <Input
                id='name'
                placeholder='e.g., Emily Carter'
                {...register('name', { required: true })}
                className='h-10 border-gray-200 rounded-lg focus:border-brand focus:ring-brand'
              />
            </div>

            {/* Role Field */}
            <div className='space-y-2'>
              <Label className='text-sm font-medium text-gray-700'>
                Roles <span className='text-red-500'>*</span>
              </Label>
              <Controller
                name='roles'
                control={control}
                rules={{ validate: v => v.length > 0 }}
                render={({ field }) => (
                  <>
                    <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
                      <PopoverTrigger asChild>
                        <Button
                          type='button'
                          variant='outline'
                          role='combobox'
                          className='w-full justify-between h-auto min-h-[40px] rounded-lg border-gray-200 hover:bg-gray-50 text-left font-normal'>
                          <div className='flex flex-wrap gap-1.5'>
                            {field.value.length === 0 ? (
                              <span className='text-sm text-gray-500'>Select roles...</span>
                            ) : (
                              field.value.map(roleValue => (
                                <span
                                  key={roleValue}
                                  className='inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-purple-50 text-purple-700 text-xs font-medium'>
                                  {getTeamRoleLabel(roleValue)}
                                  <button
                                    type='button'
                                    onClick={e => {
                                      e.stopPropagation()
                                      field.onChange(field.value.filter(r => r !== roleValue))
                                    }}
                                    className='hover:bg-purple-200 rounded-full p-0.5'>
                                    <X className='w-3 h-3' />
                                  </button>
                                </span>
                              ))
                            )}
                          </div>
                          <ChevronDown className='w-4 h-4 ml-2 opacity-50 shrink-0' />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className='w-[460px] p-0' align='start'>
                        <div
                          className='max-h-[300px] overflow-y-auto p-2'
                          onTouchMove={e => e.stopPropagation()}
                          onWheel={e => e.stopPropagation()}>
                          <div className='space-y-1'>
                            {TEAM_MEMBER_ROLES.map(role => (
                              <div
                                key={role.value}
                                className='flex items-center p-2 space-x-2 rounded-md cursor-pointer hover:bg-gray-50'
                                onClick={() => {
                                  const newRoles = field.value.includes(role.value)
                                    ? field.value.filter(r => r !== role.value)
                                    : [...field.value, role.value]
                                  field.onChange(newRoles)
                                }}>
                                <Checkbox
                                  checked={field.value.includes(role.value)}
                                  onCheckedChange={() => {
                                    const newRoles = field.value.includes(role.value)
                                      ? field.value.filter(r => r !== role.value)
                                      : [...field.value, role.value]
                                    field.onChange(newRoles)
                                  }}
                                />
                                <label className='flex-1 text-sm text-gray-700 cursor-pointer'>
                                  {role.label}
                                </label>
                              </div>
                            ))}
                          </div>
                        </div>
                      </PopoverContent>
                    </Popover>
                    {field.value.length > 0 && (
                      <p className='mt-1 text-xs text-gray-500'>
                        {field.value.length} role{field.value.length !== 1 ? 's' : ''} selected
                      </p>
                    )}
                  </>
                )}
              />
            </div>

            {/* Email Field */}
            <div className='space-y-2'>
              <Label htmlFor='email' className='text-sm font-medium text-gray-700'>
                Email Address <span className='text-red-500'>*</span>
              </Label>
              <Input
                id='email'
                type='email'
                placeholder='e.g., emily.carter@nvschools.edu'
                {...register('email', { required: true })}
                className='h-10 border-gray-200 rounded-lg focus:border-brand focus:ring-brand'
                required
              />
            </div>

            {/* Phone field */}
            <div className='space-y-2'>
              <Label htmlFor='phone' className='text-sm font-medium text-gray-700'>
                Phone Number
              </Label>
              <Input
                id='phone'
                type='tel'
                placeholder='e.g., (555) 123-4567'
                {...register('phone')}
                className='h-10 border-gray-200 rounded-lg focus:border-brand focus:ring-brand'
                maxLength={14}
              />
            </div>
          </div>

          <DialogFooter className='mt-6'>
            <Button
              type='button'
              variant='outline'
              onClick={() => onOpenChange(false)}
              className='leading-none border-gray-200 rounded-lg hover:bg-gray-50'>
              Cancel
            </Button>
            <Button
              type='submit'
              className='leading-none text-white rounded-lg bg-brand hover:bg-brand/90'>
              Add Member
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export default AddTeamMemberModal
