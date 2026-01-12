import React, { useState, useEffect } from 'react'
import { formatPhoneNumber, unformatPhoneNumber } from '@/utils/formatters'
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

interface TeamMember {
  id: string
  name: string
  roles: string[]
  email: string
  phone: string
}

interface EditTeamMemberModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onUpdateMember: (member: TeamMember) => void
  member: TeamMember | null
}

const ROLE_OPTIONS = [
  { value: 'superintendent', label: 'Superintendent' },
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
  { value: 'resource_teacher', label: 'Resource Teacher' },
]

const EditTeamMemberModal: React.FC<EditTeamMemberModalProps> = ({
  open,
  onOpenChange,
  onUpdateMember,
  member,
}) => {
  const [formData, setFormData] = useState<TeamMember>({
    id: '',
    name: '',
    roles: [],
    email: '',
    phone: '',
  })

  useEffect(() => {
    if (member) {
      setFormData(member)
    }
  }, [member])

  const handleChange = (field: keyof TeamMember, value: string | string[]) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleRoleToggle = (roleValue: string, checked: boolean | 'indeterminate') => {
    setFormData(prev => ({
      ...prev,
      roles:
        checked && checked !== 'indeterminate'
          ? prev.roles.includes(roleValue)
            ? prev.roles
            : [...prev.roles, roleValue]
          : prev.roles.filter(r => r !== roleValue),
    }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.name || formData.roles.length === 0 || !formData.email || !formData.phone) {
      return
    }

    onUpdateMember({
      ...formData,
      phone: unformatPhoneNumber(formData.phone),
    })
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-[600px] max-h-[90vh] overflow-y-auto'>
        <DialogHeader>
          <DialogTitle className='text-xl font-semibold text-gray-900'>
            Edit Team Member
          </DialogTitle>
          <DialogDescription className='text-sm text-gray-500'>
            Update the team member's information below.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className='py-4 space-y-6'>
          {/* Name Field */}
          <div className='space-y-2'>
            <Label htmlFor='name' className='text-sm font-medium text-gray-700'>
              Full Name <span className='text-red-500'>*</span>
            </Label>
            <Input
              id='name'
              placeholder='e.g., John Smith'
              value={formData.name}
              onChange={e => handleChange('name', e.target.value)}
              className='h-10 border-gray-200 rounded-lg focus:border-brand focus:ring-brand'
              required
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
              placeholder='e.g., john.smith@school.com'
              value={formData.email}
              onChange={e => handleChange('email', e.target.value)}
              className='h-10 border-gray-200 rounded-lg focus:border-brand focus:ring-brand'
              required
            />
          </div>

          {/* Phone Field */}
          <div className='space-y-2'>
            <Label htmlFor='phone' className='text-sm font-medium text-gray-700'>
              Phone Number <span className='text-red-500'>*</span>
            </Label>
            <Input
              id='phone'
              type='tel'
              placeholder='e.g., (555) 123-4567'
              value={formData.phone}
              onChange={e => handleChange('phone', formatPhoneNumber(e.target.value))}
              className='h-10 border-gray-200 rounded-lg focus:border-brand focus:ring-brand'
              maxLength={14}
              required
            />
          </div>

          {/* Roles Field */}
          <div className='space-y-3'>
            <Label className='text-sm font-medium text-gray-700'>
              Role(s) <span className='text-red-500'>*</span>
            </Label>
            <div className='grid grid-cols-1 gap-3 p-4 overflow-y-auto border border-gray-200 rounded-lg sm:grid-cols-2 max-h-60 bg-gray-50'>
              {ROLE_OPTIONS.map(role => (
                <div key={role.value} className='flex items-center space-x-2'>
                  <Checkbox
                    id={`role-${role.value}`}
                    checked={formData.roles.includes(role.value)}
                    onCheckedChange={checked => handleRoleToggle(role.value, checked)}
                    className='border-gray-300'
                  />
                  <Label
                    htmlFor={`role-${role.value}`}
                    className='text-sm font-normal text-gray-700 cursor-pointer'>
                    {role.label}
                  </Label>
                </div>
              ))}
            </div>
            {formData.roles.length === 0 && (
              <p className='text-xs text-red-500'>Please select at least one role</p>
            )}
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
              className='text-white bg-brand hover:bg-brand/90'
              disabled={
                !formData.name || formData.roles.length === 0 || !formData.email || !formData.phone
              }>
              Save Changes
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export default EditTeamMemberModal
