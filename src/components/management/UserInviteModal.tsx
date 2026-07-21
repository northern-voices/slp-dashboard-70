import React, { useState } from 'react'
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
import { useToast } from '@/hooks/use-toast'
import { Mail, UserPlus, Copy, Check } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useOrganization } from '@/contexts/OrganizationContext'

interface UserInviteModalProps {
  isOpen: boolean
  onClose: () => void
  onInvite: () => void
}

const UserInviteModal = ({ isOpen, onClose, onInvite }: UserInviteModalProps) => {
  const { toast } = useToast()
  const { currentOrganization, userProfile, availableSchools } = useOrganization()

  const [formData, setFormData] = useState({ email: '', role: 'slp', schoolId: '' })
  const [isLoading, setIsLoading] = useState(false)
  const [inviteLink, setInviteLink] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.email.trim()) {
      toast({ title: 'Error', description: 'Email is required.', variant: 'destructive' })
      return
    }

    if (!currentOrganization) {
      toast({ title: 'Error', description: 'No organization found.', variant: 'destructive' })
      return
    }

    setIsLoading(true)
    try {
      const { data: existingUser } = await supabase
        .from('users')
        .select('id')
        .eq('email', formData.email.trim().toLowerCase())
        .eq('organization_id', currentOrganization.id)
        .maybeSingle()

      if (existingUser) {
        toast({
          title: 'User already exists',
          description: 'A user with this email address is already in your organization.',
          variant: 'destructive',
        })

        return
      }

      const { data: existingInvite } = await supabase
        .from('organization_invitations')
        .select('id')
        .eq('email', formData.email.trim().toLowerCase())
        .eq('organization_id', currentOrganization.id)
        .is('accepted_at', null)
        .gt('expires_at', new Date().toISOString())
        .maybeSingle()

      if (existingInvite) {
        toast({
          title: 'Invitation already sent',
          description: 'A pending invitation already exists for this email address.',
          variant: 'destructive',
        })

        return
      }

      const { data, error } = await supabase
        .from('organization_invitations')
        .insert({
          organization_id: currentOrganization.id,
          email: formData.email.trim().toLowerCase(),
          role: formData.role,
          invited_by: userProfile?.id ?? null,
        })
        .select('token')
        .single()

      if (error) throw error

      const link = `${window.location.origin}/invite/${data.token}`

      await supabase.functions.invoke('send-invite-email', {
        body: { email: formData.email.trim().toLowerCase(), inviteLink: link },
      })

      setInviteLink(link)
      onInvite()
    } catch (error) {
      toast({
        title: 'Failed to create invitation',
        description: error instanceof Error ? error.message : 'Please try again.',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleCopy = async () => {
    if (!inviteLink) return
    await navigator.clipboard.writeText(inviteLink)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleClose = () => {
    setFormData({ email: '', role: 'slp', schoolId: '' })
    setInviteLink(null)
    setCopied(false)
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className='max-w-md'>
        <DialogHeader>
          <DialogTitle className='flex items-center gap-2'>
            <UserPlus className='w-5 h-5' />
            Invite New User
          </DialogTitle>
        </DialogHeader>

        {inviteLink ? (
          // Success state — show the generated link
          <div className='space-y-4'>
            <p className='text-sm text-gray-600'>
              Invitation created. Copy the link below and send it to{' '}
              <strong>{formData.email}</strong>.
            </p>
            <div className='flex items-center gap-2 p-3 border border-gray-200 rounded-lg bg-gray-50'>
              <p className='flex-1 text-xs text-gray-700 break-all'>{inviteLink}</p>
              <Button type='button' size='sm' variant='outline' onClick={handleCopy}>
                {copied ? (
                  <Check className='w-4 h-4 text-green-600' />
                ) : (
                  <Copy className='w-4 h-4' />
                )}
              </Button>
            </div>
            <Button className='w-full' onClick={handleClose}>
              Done
            </Button>
          </div>
        ) : (
          // Form state
          <form onSubmit={handleSubmit} className='space-y-5'>
            <div className='space-y-2'>
              <Label htmlFor='email'>Email Address *</Label>
              <div className='relative'>
                <Mail className='absolute w-4 h-4 text-gray-400 -translate-y-1/2 left-3 top-1/2' />
                <Input
                  id='email'
                  type='email'
                  value={formData.email}
                  onChange={e => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  placeholder='Enter email address'
                  className='pl-10'
                  required
                />
              </div>
            </div>

            <div className='space-y-2'>
              <Label htmlFor='role'>Role</Label>
              <Select
                value={formData.role}
                onValueChange={value =>
                  setFormData(prev => ({
                    ...prev,
                    role: value,
                    schoolId: value === 'admin' ? '' : prev.schoolId,
                  }))
                }>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='slp'>Speech-Language Pathologist</SelectItem>
                  <SelectItem value='hearing_technician'>Hearing Technician</SelectItem>
                  <SelectItem value='admin'>Administrator</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {formData.role !== 'admin' && (
              <div className='space-y-2'>
                <Label htmlFor='school'>School (optional)</Label>
                <Select
                  value={formData.schoolId}
                  onValueChange={value => setFormData(prev => ({ ...prev, schoolId: value }))}>
                  <SelectTrigger id='school'>
                    <SelectValue placeholder='Assign a school now (optional)' />
                  </SelectTrigger>
                  <SelectContent>
                    {availableSchools.map(school => (
                      <SelectItem key={school.id} value={school.id}>
                        {school.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className='flex gap-3 pt-2'>
              <Button type='submit' className='flex-1' disabled={isLoading}>
                <Mail className='w-4 h-4 mr-2' />
                {isLoading ? 'Creating...' : 'Create Invite Link'}
              </Button>
              <Button type='button' variant='outline' onClick={handleClose} className='flex-1'>
                Cancel
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  )
}

export default UserInviteModal
