import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { useToast } from '@/hooks/use-toast'
import AuthLayout from '@/components/auth/AuthLayout'
import AuthFormField from '@/components/auth/AuthFormField'
import { useAuth } from '@/contexts/AuthContext'

const Login = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({})
  const [isLoading, setIsLoading] = useState(false)

  const { login } = useAuth()
  const { toast } = useToast()
  const navigate = useNavigate()

  const validateForm = () => {
    const newErrors: { email?: string; password?: string } = {}

    if (!email) {
      newErrors.email = 'Email is required'
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Please enter a valid email address'
    }

    if (!password) {
      newErrors.password = 'Password is required'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const getErrorMessage = (error: any) => {
    // Check if it's the email not confirmed error
    if (
      error?.message?.includes('Email not confirmed') ||
      error?.toString().includes('Email not confirmed')
    ) {
      return {
        title: 'Email not confirmed',
        description:
          "Please check your email and click the confirmation link before signing in. Check your spam folder if you don't see it.",
      }
    }

    // Check for other common Supabase auth errors
    if (
      error?.message?.includes('Invalid login credentials') ||
      error?.toString().includes('Invalid login credentials')
    ) {
      return {
        title: 'Login failed',
        description: 'Invalid email or password. Please try again.',
      }
    }

    // Default error message
    return {
      title: 'Login failed',
      description: 'Invalid email or password. Please try again.',
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) return

    setIsLoading(true)
    try {
      await login(email, password)
      toast({
        title: 'Login successful',
        description: 'Welcome back!',
      })
      navigate('/')
    } catch (error) {
      console.error('Login error:', error)
      const errorMessage = getErrorMessage(error)

      toast({
        title: errorMessage.title,
        description: errorMessage.description,
        variant: 'default',
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <AuthLayout title='Welcome Back' subtitle='Sign in to your account to continue'>
      <form onSubmit={handleSubmit} className='space-y-6'>
        <AuthFormField
          label='Email Address'
          type='email'
          placeholder='Enter your email'
          value={email}
          onChange={setEmail}
          error={errors.email}
          required
        />

        <AuthFormField
          label='Password'
          type='password'
          placeholder='Enter your password'
          value={password}
          onChange={setPassword}
          error={errors.password}
          required
        />

        <div className='flex items-center justify-between'>
          <Link to='/auth/forgot-password' className='text-sm text-blue-600 hover:text-blue-500'>
            Forgot your password?
          </Link>
        </div>

        <Button type='submit' className='w-full' disabled={isLoading}>
          {isLoading ? 'Signing in...' : 'Sign In'}
        </Button>

        <div className='text-center'>
          <span className='text-sm text-gray-600'>
            Don't have an account?{' '}
            <Link to='/auth/signup' className='text-blue-600 hover:text-blue-500 font-medium'>
              Sign up
            </Link>
          </span>
        </div>
      </form>
    </AuthLayout>
  )
}

export default Login
