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

const AVAILABLE_ROLES = [
  { value: 'director', label: 'Director' },
  { value: 'sss_coordinator', label: 'SSS Coordinator' },
  { value: 'principal', label: 'Principal' },
  { value: 'vice_principal', label: 'Vice Principal' },
  { value: 'inclusive_supports_teacher', label: 'Inclusive Supports Teacher' },
  { value: 'speech_ea', label: 'Speech EA' },
  { value: 'non_designated_ea', label: 'Non-Designated EA' },
  { value: 'educator', label: 'Educator' },
  { value: 'ot', label: 'OT' },
  { value: 'slp_supplemental', label: 'SLP (supplemental contract)' },
  { value: 'pt', label: 'PT' },
  { value: 'ed_psych', label: 'Ed Psych' },
  { value: 'jp_liaison', label: 'JP Liaison' },
  { value: 'learning_support_teacher', label: 'Learning Support Teacher LST' },
]

const getRoleLabel = (value: string): string => {
  const role = AVAILABLE_ROLES.find(r => r.value === value)
  return role ? role.label : value
}

const AddTeamMemberModal: React.FC<AddTeamMemberModalProps> = ({
  open,
  onOpenChange,
  onAddMember,
}) => {
  const [formData, setFormData] = useState<TeamMember>({
    name: '',
    roles: [],
    email: '',
    phone: '',
  })
  const [isPopoverOpen, setIsPopoverOpen] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.name || formData.roles.length === 0 || !formData.email || !formData.phone) {
      return
    }

    onAddMember(formData)

    setFormData({
      name: '',
      roles: [],
      email: '',
      phone: '',
    })

    onOpenChange(false)
  }

  const handleChange = (field: keyof TeamMember, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleRoleToggle = (roleValue: string) => {
    setFormData(prev => ({
      ...prev,
      roles: prev.roles.includes(roleValue)
        ? prev.roles.filter(r => r !== roleValue)
        : [...prev.roles, roleValue],
    }))
  }

  const handleRemoveRole = (roleToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      roles: prev.roles.filter(r => r !== roleToRemove),
    }))
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-[500px]'>
        <DialogHeader>
          <div className='flex items-center space-x-3 mb-2'>
            <div className='w-10 h-10 bg-purple-50 rounded-xl flex items-center justify-center'>
              <UserPlus className='w-5 h-5 text-purple-600' />
            </div>
            <DialogTitle>Add Team Member</DialogTitle>
          </div>
          <DialogDescription>
            Add a new member to the school team. Fill in all the required information below.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className='space-y-5 py-4'>
            {/* Name Field */}
            <div className='space-y-2'>
              <Label htmlFor='name' className='text-sm font-medium text-gray-700'>
                Full Name <span className='text-red-500'>*</span>
              </Label>
              <Input
                id='name'
                placeholder='e.g., Emily Carter'
                value={formData.name}
                onChange={e => handleChange('name', e.target.value)}
                className='h-10 rounded-lg border-gray-200 focus:border-brand focus:ring-brand'
                required
              />
            </div>

            {/* Role Field */}
            <div className='space-y-2'>
              <Label className='text-sm font-medium text-gray-700'>
                Roles <span className='text-red-500'>*</span>
              </Label>
              <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
                <PopoverTrigger asChild>
                  <Button
                    type='button'
                    variant='outline'
                    role='combobox'
                    className='w-full justify-between h-auto min-h-[40px] rounded-lg border-gray-200 hover:bg-gray-50 text-left font-normal'>
                    <div className='flex flex-wrap gap-1.5'>
                      {formData.roles.length === 0 ? (
                        <span className='text-gray-500 text-sm'>Select roles...</span>
                      ) : (
                        formData.roles.map(roleValue => (
                          <span
                            key={roleValue}
                            className='inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-purple-50 text-purple-700 text-xs font-medium'>
                            {getRoleLabel(roleValue)}
                            <button
                              type='button'
                              onClick={e => {
                                e.stopPropagation()
                                handleRemoveRole(roleValue)
                              }}
                              className='hover:bg-purple-200 rounded-full p-0.5'>
                              <X className='w-3 h-3' />
                            </button>
                          </span>
                        ))
                      )}
                    </div>
                    <ChevronDown className='ml-2 h-4 w-4 shrink-0 opacity-50' />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className='w-[460px] p-0' align='start'>
                  <div className='max-h-[300px] overflow-y-auto p-2'>
                    <div className='space-y-1'>
                      {AVAILABLE_ROLES.map(role => (
                        <div
                          key={role.value}
                          className='flex items-center space-x-2 p-2 rounded-md hover:bg-gray-50 cursor-pointer'
                          onClick={() => handleRoleToggle(role.value)}>
                          <Checkbox
                            checked={formData.roles.includes(role.value)}
                            onCheckedChange={() => handleRoleToggle(role.value)}
                          />
                          <label className='text-sm text-gray-700 cursor-pointer flex-1'>
                            {role.label}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                </PopoverContent>
              </Popover>
              {formData.roles.length > 0 && (
                <p className='text-xs text-gray-500 mt-1'>
                  {formData.roles.length} role{formData.roles.length !== 1 ? 's' : ''} selected
                </p>
              )}
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
                value={formData.email}
                onChange={e => handleChange('email', e.target.value)}
                className='h-10 rounded-lg border-gray-200 focus:border-brand focus:ring-brand'
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
                value={formData.phone}
                onChange={e => handleChange('phone', e.target.value)}
                className='h-10 rounded-lg border-gray-200 focus:border-brand focus:ring-brand'
              />
            </div>
          </div>

          <DialogFooter className='mt-6'>
            <Button
              type='button'
              variant='outline'
              onClick={() => onOpenChange(false)}
              className='rounded-lg border-gray-200 hover:bg-gray-50 leading-none'>
              Cancel
            </Button>
            <Button
              type='submit'
              className='bg-brand hover:bg-brand/90 text-white rounded-lg leading-none'>
              Add Member
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export default AddTeamMemberModal
