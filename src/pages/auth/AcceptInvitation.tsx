import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { useToast } from '@/hooks/use-toast'
import AuthLayout from '@/components/auth/AuthLayout'
import AuthFormField from '@/components/auth/AuthFormField'
import PasswordStrengthIndicator from '@/components/auth/PasswordStrengthIndicator'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabase'

interface InvitationData {
  email: string
  role: string
  organizationName: string
  organizationId: string
}

const AcceptInvitation = () => {
  const { token } = useParams()
  const navigate = useNavigate()
  const { toast } = useToast()
  const { acceptInvitation } = useAuth()

  const [isFetching, setIsFetching] = useState(true)
  const [isLoading, setIsLoading] = useState(false)
  const [invitationData, setInvitationData] = useState<InvitationData | null>(null)
  const [inviteError, setInviteError] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    password: '',
    confirmPassword: '',
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    if (!token) {
      setInviteError('No invitation token found in this link.')
      setIsFetching(false)
      return
    }

    const fetchInvitation = async () => {
      const { data, error } = await supabase.rpc('get_invitation_by_token', { invite_token: token })

      const invite = data?.[0]

      if (error || !invite) {
        setInviteError('This invitation link is invalid or does not exist.')
        setIsFetching(false)
        return
      }

      if (invite.accepted_at) {
        setInviteError('This invitation has already been used.')
        setIsFetching(false)
        return
      }

      if (new Date(invite.expires_at) < new Date()) {
        setInviteError('This invitation link has expired. Please ask for a new one.')
        setIsFetching(false)
        return
      }

      setInvitationData({
        email: invite.email,
        role: invite.role,
        organizationName: invite.organization_name,
        organizationId: invite.organization_id,
      })
      setIsFetching(false)
    }

    fetchInvitation().catch(() => {
      setInviteError('Something went wrong. Please try again.')
      setIsFetching(false)
    })
  }, [token])

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.firstName.trim()) newErrors.firstName = 'First name is required'
    if (!formData.lastName.trim()) newErrors.lastName = 'Last name is required'
    if (!formData.password) {
      newErrors.password = 'Password is required'
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters'
    }
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm() || !token || !invitationData) return

    setIsLoading(true)
    try {
      await acceptInvitation(token, {
        email: invitationData.email,
        password: formData.password,
        organizationId: invitationData.organizationId,
        firstName: formData.firstName,
        lastName: formData.lastName,
        role: invitationData.role,
      })

      toast({
        title: 'Account created successfully',
        description: 'Please check your email to verify your account.',
      })

      navigate(`/auth/verify-email/pending?email=${encodeURIComponent(invitationData.email)}`, {
        replace: true,
      })
    } catch (error) {
      toast({
        title: 'Failed to accept invitation',
        description: error instanceof Error ? error.message : 'Please try again.',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Loading state
  if (isFetching) {
    return (
      <AuthLayout title='Loading...'>
        <div className='text-center'>
          <div className='w-8 h-8 mx-auto mb-4 border-b-2 border-blue-600 rounded-full animate-spin' />
          <p className='text-gray-600'>Validating your invitation...</p>
        </div>
      </AuthLayout>
    )
  }

  // Error state
  if (inviteError) {
    return (
      <AuthLayout title='Invalid Invitation'>
        <div className='p-4 text-center rounded-lg bg-red-50'>
          <p className='font-medium text-red-700'>{inviteError}</p>
          <p className='mt-2 text-sm text-red-500'>
            Contact your administrator if you believe this is a mistake.
          </p>
        </div>
      </AuthLayout>
    )
  }

  return (
    <AuthLayout title='Accept Invitation' subtitle={`Join ${invitationData!.organizationName}`}>
      <div className='p-4 mb-6 rounded-lg bg-blue-50'>
        <h3 className='mb-2 font-medium text-blue-900'>You've been invited to join:</h3>
        <p className='text-blue-800'>{invitationData!.organizationName}</p>
        <p className='mt-1 text-sm text-blue-600'>
          Role:{' '}
          {invitationData!.role === 'slp' ? 'Speech-Language Pathologist' : invitationData!.role}
        </p>
      </div>

      <form onSubmit={handleSubmit} className='space-y-6'>
        <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
          <AuthFormField
            label='First Name'
            placeholder='Enter your first name'
            value={formData.firstName}
            onChange={value => setFormData(prev => ({ ...prev, firstName: value }))}
            error={errors.firstName}
            required
          />
          <AuthFormField
            label='Last Name'
            placeholder='Enter your last name'
            value={formData.lastName}
            onChange={value => setFormData(prev => ({ ...prev, lastName: value }))}
            error={errors.lastName}
            required
          />
        </div>

        <div className='space-y-2'>
          <label className='block text-sm font-medium text-gray-700'>Email Address</label>
          <div className='px-4 py-3 text-gray-600 border border-gray-200 rounded-lg bg-gray-50'>
            {invitationData!.email}
          </div>
        </div>

        <AuthFormField
          label='Password'
          type='password'
          placeholder='Create a secure password'
          value={formData.password}
          onChange={value => setFormData(prev => ({ ...prev, password: value }))}
          error={errors.password}
          required
        />

        <PasswordStrengthIndicator password={formData.password} />

        <AuthFormField
          label='Confirm Password'
          type='password'
          placeholder='Confirm your password'
          value={formData.confirmPassword}
          onChange={value => setFormData(prev => ({ ...prev, confirmPassword: value }))}
          error={errors.confirmPassword}
          required
        />

        <Button type='submit' className='w-full' disabled={isLoading}>
          {isLoading ? 'Creating Account...' : 'Accept Invitation & Create Account'}
        </Button>
      </form>
    </AuthLayout>
  )
}

export default AcceptInvitation
