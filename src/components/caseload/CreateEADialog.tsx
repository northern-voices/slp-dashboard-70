import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useQueryClient } from '@tanstack/react-query'
import { useOrganization } from '@/contexts/OrganizationContext'
import { useToast } from '@/hooks/use-toast'
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
import { Loader2, UserPlus } from 'lucide-react'

interface CreateEADialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  schoolId?: string
}

const CreateEADialog = ({ open, onOpenChange, schoolId }: CreateEADialogProps) => {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [isCreating, setIsCreating] = useState(false)

  const { currentSchool } = useOrganization()
  const queryClient = useQueryClient()
  const { toast } = useToast()

  const handleClose = (nextOpen: boolean) => {
    onOpenChange(nextOpen)
    if (!nextOpen) {
      setName('')
      setEmail('')
    }
  }

  const handleCreate = async () => {
    if (!name.trim() || !schoolId) return
    setIsCreating(true)

    const [firstName, ...rest] = name.trim().split(' ')
    const lastName = rest.join(' ')

    try {
      const { error } = await supabase.from('school_staff').insert({
        school_id: schoolId,
        first_name: firstName,
        last_name: lastName || '',
        roles: ['speech_ea'],
        email: email.trim() || null,
        is_active: true,
      })

      if (error) throw error

      queryClient.invalidateQueries({ queryKey: ['school-details', currentSchool?.id] })
      toast({ title: 'Speech EA added successfully' })
      handleClose(false)
    } catch {
      toast({ title: 'Error', description: 'Failed to create Speech EA', variant: 'destructive' })
    } finally {
      setIsCreating(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className='sm:max-w-[420px]'>
        <DialogHeader>
          <div className='flex items-center mb-2 space-x-3'>
            <div className='flex items-center justify-center w-10 h-10 bg-purple-50 rounded-xl'>
              <UserPlus className='w-5 h-5 text-purple-600' />
            </div>
            <DialogTitle>Add Speech EA</DialogTitle>
          </div>
          <DialogDescription>
            Create a new Speech Education Assistant for this school. They'll be available to assign
            to students immediately after.
          </DialogDescription>
        </DialogHeader>

        <div className='py-4 space-y-4'>
          <div className='space-y-2'>
            <Label htmlFor='ea-name' className='text-sm font-medium text-gray-700'>
              Full Name <span className='text-red-500'>*</span>
            </Label>
            <Input
              id='ea-name'
              placeholder='e.g., Emily Carter'
              value={name}
              onChange={e => setName(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter' && name.trim()) handleCreate()
              }}
              className='h-10 border-gray-200 rounded-lg'
            />
          </div>

          <div className='space-y-2'>
            <Label htmlFor='ea-email' className='text-sm font-medium text-gray-700'>
              Email Address
            </Label>
            <Input
              id='ea-email'
              type='email'
              placeholder='e.g., emily.carter@school.edu'
              value={email}
              onChange={e => setEmail(e.target.value)}
              className='h-10 border-gray-200 rounded-lg'
            />
          </div>

          <div className='px-3 py-2 rounded-lg bg-purple-50'>
            <p className='text-xs text-purple-700 font-medium'>Role: Speech Education Assistant</p>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant='outline'
            onClick={() => handleClose(false)}
            className='border-gray-200 rounded-lg hover:bg-gray-50'>
            Cancel
          </Button>
          <Button
            onClick={handleCreate}
            disabled={!name.trim() || isCreating}
            className='text-white rounded-lg bg-brand hover:bg-brand/90'>
            {isCreating ? (
              <>
                <Loader2 className='w-4 h-4 mr-2 animate-spin' />
                Creating...
              </>
            ) : (
              'Add EA'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default CreateEADialog
