import React, { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { useToast } from '@/hooks/use-toast'
import AuthLayout from '@/components/auth/AuthLayout'
import AuthFormField from '@/components/auth/AuthFormField'
import PasswordStrengthIndicator from '@/components/auth/PasswordStrengthIndicator'
import { useAuth } from '@/contexts/AuthContext'

const ResetPassword = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const { toast } = useToast()
  const { updatePassword, user } = useAuth()

  const [isLoading, setIsLoading] = useState(false)
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [token, setToken] = useState<string | null>(null)

  useEffect(() => {
    // Get the token from the URL hash fragment
    const hash = window.location.hash.substring(1) // Remove the # character
    const params = new URLSearchParams(hash)
    const accessToken = params.get('access_token')

    if (accessToken) {
      setToken(accessToken)
    } else {
      toast({
        title: 'Invalid reset link',
        description: 'The password reset link is invalid or has expired. Please request a new one.',
        variant: 'destructive',
      })
      navigate('/auth/forgot-password')
    }
  }, [navigate, toast])

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!password) newErrors.password = 'Password is required'
    if (password.length < 8) newErrors.password = 'Password must be at least 8 characters'
    if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm() || !token) return

    setIsLoading(true)
    try {
      await updatePassword(token, password)
      toast({
        title: 'Password updated successfully',
        description: 'You can now sign in with your new password.',
      })
      navigate('/auth/login')
    } catch (error) {
      console.error('Password reset error:', error)
      let errorMessage = 'The reset link may be expired. Please request a new one.'

      if (error instanceof Error) {
        errorMessage = error.message
      }

      toast({
        title: 'Failed to update password',
        description: errorMessage,
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  if (!token) {
    return (
      <AuthLayout title='Invalid Reset Link' subtitle='Please request a new password reset link'>
        <div className='text-center space-y-4'>
          <Button onClick={() => navigate('/auth/forgot-password')} className='w-full'>
            Request New Reset Link
          </Button>
        </div>
      </AuthLayout>
    )
  }

  return (
    <AuthLayout title='Set New Password' subtitle='Choose a strong password for your account'>
      <form onSubmit={handleSubmit} className='space-y-6'>
        <AuthFormField
          label='New Password'
          type='password'
          placeholder='Enter your new password'
          value={password}
          onChange={setPassword}
          error={errors.password}
          required
        />

        <PasswordStrengthIndicator password={password} />

        <AuthFormField
          label='Confirm New Password'
          type='password'
          placeholder='Confirm your new password'
          value={confirmPassword}
          onChange={setConfirmPassword}
          error={errors.confirmPassword}
          required
        />

        <Button type='submit' className='w-full' disabled={isLoading}>
          {isLoading ? 'Updating Password...' : 'Update Password'}
        </Button>
      </form>
    </AuthLayout>
  )
}

export default ResetPassword
