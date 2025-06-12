import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { useToast } from '@/hooks/use-toast'
import AuthLayout from '@/components/auth/AuthLayout'
import AuthFormField from '@/components/auth/AuthFormField'
import PasswordStrengthIndicator from '@/components/auth/PasswordStrengthIndicator'
import { useAuth } from '@/contexts/AuthContext'

const Signup = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    organizationName: '',
    firstName: '',
    lastName: '',
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isLoading, setIsLoading] = useState(false)

  const { signup } = useAuth()
  const { toast } = useToast()
  const navigate = useNavigate()

  const updateField = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.firstName) newErrors.firstName = 'First name is required'
    if (!formData.lastName) newErrors.lastName = 'Last name is required'
    if (!formData.email) {
      newErrors.email = 'Email is required'
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address'
    }
    if (!formData.organizationName) newErrors.organizationName = 'Organization name is required'
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

    if (!validateForm()) return

    setIsLoading(true)
    try {
      await signup(
        formData.email,
        formData.password,
        formData.organizationName,
        formData.firstName,
        formData.lastName
      )
      toast({
        title: 'Account created successfully',
        description: 'Please check your email to verify your account.',
      })
      navigate('/auth/verify-email')
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error)
      toast({
        title: errorMessage,
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <AuthLayout
      title='Create Your Account'
      subtitle='Set up your organization and start managing speech screenings'>
      <form onSubmit={handleSubmit} className='space-y-6'>
        <div className='grid grid-cols-2 gap-4'>
          <AuthFormField
            label='First Name'
            placeholder='Enter your first name'
            value={formData.firstName}
            onChange={value => updateField('firstName', value)}
            error={errors.firstName}
            required
          />

          <AuthFormField
            label='Last Name'
            placeholder='Enter your last name'
            value={formData.lastName}
            onChange={value => updateField('lastName', value)}
            error={errors.lastName}
            required
          />
        </div>

        <AuthFormField
          label='Email Address'
          type='email'
          placeholder='Enter your email'
          value={formData.email}
          onChange={value => updateField('email', value)}
          error={errors.email}
          required
        />

        <AuthFormField
          label='Organization Name'
          placeholder='Enter your school district or organization'
          value={formData.organizationName}
          onChange={value => updateField('organizationName', value)}
          error={errors.organizationName}
          required
        />

        <AuthFormField
          label='Password'
          type='password'
          placeholder='Create a strong password'
          value={formData.password}
          onChange={value => updateField('password', value)}
          error={errors.password}
          required
        />

        <PasswordStrengthIndicator password={formData.password} />

        <AuthFormField
          label='Confirm Password'
          type='password'
          placeholder='Confirm your password'
          value={formData.confirmPassword}
          onChange={value => updateField('confirmPassword', value)}
          error={errors.confirmPassword}
          required
        />

        <Button type='submit' className='w-full' disabled={isLoading}>
          {isLoading ? 'Creating Account...' : 'Create Account'}
        </Button>

        <div className='text-center'>
          <span className='text-sm text-gray-600'>
            Already have an account?{' '}
            <Link to='/auth/login' className='text-blue-600 hover:text-blue-500 font-medium'>
              Sign in
            </Link>
          </span>
        </div>
      </form>
    </AuthLayout>
  )
}

export default Signup
