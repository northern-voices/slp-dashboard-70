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
import { UserPlus } from 'lucide-react'

interface TeamMember {
  name: string
  role: string
  email: string
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
  const [formData, setFormData] = useState<TeamMember>({
    name: '',
    role: '',
    email: '',
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.name || !formData.role || !formData.email) {
      return
    }

    onAddMember(formData)

    setFormData({
      name: '',
      role: '',
      email: '',
    })

    onOpenChange(false)
  }

  const handleChange = (field: keyof TeamMember, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
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
              <Label htmlFor='role' className='text-sm font-medium text-gray-700'>
                Role <span className='text-red-500'>*</span>
              </Label>
              <Input
                id='role'
                placeholder='e.g., Speech Therapist'
                value={formData.role}
                onChange={e => handleChange('role', e.target.value)}
                className='h-10 rounded-lg border-gray-200 focus:border-brand focus:ring-brand'
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
                placeholder='e.g., emily.carter@nvschools.edu'
                value={formData.email}
                onChange={e => handleChange('email', e.target.value)}
                className='h-10 rounded-lg border-gray-200 focus:border-brand focus:ring-brand'
                required
              />
            </div>
          </div>

          <DialogFooter className='mt-6'>
            <Button
              type='button'
              variant='outline'
              onClick={() => onOpenChange(false)}
              className='rounded-lg border-gray-200 hover:bg-gray-50'>
              Cancel
            </Button>
            <Button type='submit' className='bg-brand hover:bg-brand/90 text-white rounded-lg'>
              Add Member
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export default AddTeamMemberModal
