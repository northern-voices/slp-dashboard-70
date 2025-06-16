import React, { useState, useEffect } from 'react'
import { useParams, Link, useNavigate, useLocation } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { useToast } from '@/hooks/use-toast'
import AuthLayout from '@/components/auth/AuthLayout'
import { useAuth } from '@/contexts/AuthContext'
import { CheckCircle, XCircle, Mail } from 'lucide-react'
import { supabase } from '@/lib/supabase'

const VerifyEmail = () => {
  const { token } = useParams()
  const { toast } = useToast()
  const { resendVerificationEmail } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const [isLoading, setIsLoading] = useState(true)
  const [isVerified, setIsVerified] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isResending, setIsResending] = useState(false)
  const [email, setEmail] = useState<string | null>(null)

  useEffect(() => {
    console.log('=== EMAIL VERIFICATION DEBUG ===')
    console.log('Current URL:', window.location.href)
    console.log('Location pathname:', location.pathname)
    console.log('Location search:', location.search)
    console.log('Location hash:', location.hash)
    console.log('Token from params:', token)

    // Get email from URL search params
    const searchParams = new URLSearchParams(location.search)
    const emailParam = searchParams.get('email')
    setEmail(emailParam)

    const handleVerification = async () => {
      // If we're on the pending route, don't try to verify
      if (location.pathname.includes('/pending')) {
        console.log('On pending route, stopping verification')
        setIsLoading(false)
        return
      }

      // Check URL hash for tokens (from email clicks)
      const hash = window.location.hash.substring(1)
      console.log('Hash content:', hash)

      if (hash) {
        const params = new URLSearchParams(hash)
        const accessToken = params.get('access_token')
        const refreshToken = params.get('refresh_token')
        const errorParam = params.get('error')
        const errorDescription = params.get('error_description')

        console.log('Hash params:', {
          hasAccessToken: !!accessToken,
          hasRefreshToken: !!refreshToken,
          error: errorParam,
          errorDescription,
        })

        if (errorParam) {
          setError(errorDescription || errorParam)
          setIsLoading(false)
          return
        }

        if (accessToken && refreshToken) {
          // User is verified and authenticated
          setIsVerified(true)
          toast({
            title: 'Email verified successfully',
            description: 'Your email has been verified and you are now signed in.',
          })

          // Clean up the URL
          window.history.replaceState({}, document.title, window.location.pathname)

          setTimeout(() => {
            navigate('/', { replace: true })
          }, 2000)
          setIsLoading(false)
          return
        }
      }

      // Check if user is already authenticated (they might have clicked the link while already logged in)
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession()
        console.log('Current session:', session)

        if (session?.user) {
          if (session.user.email_confirmed_at) {
            // User is already verified and logged in
            setIsVerified(true)
            toast({
              title: 'Already verified',
              description: 'Your email is already verified.',
            })
            setTimeout(() => {
              navigate('/', { replace: true })
            }, 2000)
          } else {
            // User is logged in but not verified
            setError('Your email is not yet verified. Please check your inbox.')
          }
        } else {
          // No session and no hash params - redirect to pending or login
          if (emailParam) {
            navigate(`/auth/verify-email/pending?email=${encodeURIComponent(emailParam)}`, {
              replace: true,
            })
          } else {
            navigate('/auth/login', { replace: true })
          }
        }
      } catch (error) {
        console.error('Session check error:', error)
        setError('Unable to verify your email. Please try again.')
      }

      setIsLoading(false)
    }

    handleVerification()
  }, [location, navigate, toast])

  const handleResendVerification = async () => {
    if (!email) {
      toast({
        title: 'Error',
        description: 'Email address not found. Please try signing up again.',
        variant: 'destructive',
      })
      return
    }

    setIsResending(true)
    try {
      await resendVerificationEmail(email)
      toast({
        title: 'Verification email sent',
        description: 'Please check your inbox for the verification link.',
      })
    } catch (error) {
      console.error('Resend verification error:', error)
      toast({
        title: 'Failed to send verification email',
        description: 'Please try again later.',
        variant: 'destructive',
      })
    } finally {
      setIsResending(false)
    }
  }

  // Show pending state when on pending route
  if (location.pathname.includes('/pending')) {
    return (
      <AuthLayout title='Check Your Email' subtitle='Please verify your email address'>
        <div className='text-center space-y-6'>
          <div className='w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto'>
            <Mail className='w-8 h-8 text-blue-600' />
          </div>

          <div>
            <h3 className='text-lg font-medium text-gray-900 mb-2'>Verification Email Sent</h3>
            <p className='text-gray-600 mb-4'>
              We've sent a verification email to <strong>{email}</strong>. Please check your inbox
              and click the verification link to continue.
            </p>
            <p className='text-sm text-gray-500'>
              Don't forget to check your spam folder if you don't see the email.
            </p>
          </div>

          <div className='space-y-3'>
            <Button
              variant='outline'
              className='w-full'
              onClick={handleResendVerification}
              disabled={isResending || !email}>
              <Mail className='w-4 h-4 mr-2' />
              {isResending ? 'Sending...' : 'Resend Verification Email'}
            </Button>

            <Link to='/auth/login'>
              <Button variant='ghost' className='w-full'>
                Back to Sign In
              </Button>
            </Link>
          </div>
        </div>
      </AuthLayout>
    )
  }

  if (isLoading) {
    return (
      <AuthLayout title='Verifying Email'>
        <div className='text-center space-y-4'>
          <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4'></div>
          <p className='text-gray-600'>Verifying your email address...</p>
        </div>
      </AuthLayout>
    )
  }

  if (isVerified) {
    return (
      <AuthLayout title='Email Verified' subtitle='Your email has been successfully verified'>
        <div className='text-center space-y-6'>
          <div className='w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto'>
            <CheckCircle className='w-8 h-8 text-green-600' />
          </div>

          <div>
            <h3 className='text-lg font-medium text-gray-900 mb-2'>Email Successfully Verified</h3>
            <p className='text-gray-600'>
              Your email address has been verified and you are now signed in. Redirecting to your
              dashboard...
            </p>
          </div>

          <Link to='/'>
            <Button className='w-full'>Go to Dashboard</Button>
          </Link>
        </div>
      </AuthLayout>
    )
  }

  return (
    <AuthLayout title='Verification Issue' subtitle='There was a problem verifying your email'>
      <div className='text-center space-y-6'>
        <div className='w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto'>
          <XCircle className='w-8 h-8 text-yellow-600' />
        </div>

        <div>
          <h3 className='text-lg font-medium text-gray-900 mb-2'>Verification Issue</h3>
          <p className='text-gray-600 mb-4'>
            {error || 'There was an issue verifying your email. Please try again.'}
          </p>
        </div>

        <div className='space-y-3'>
          <Button
            variant='outline'
            className='w-full'
            onClick={handleResendVerification}
            disabled={isResending || !email}>
            <Mail className='w-4 h-4 mr-2' />
            {isResending ? 'Sending...' : 'Request New Verification Email'}
          </Button>

          <Link to='/auth/signup'>
            <Button variant='ghost' className='w-full'>
              Try Signing Up Again
            </Button>
          </Link>
        </div>
      </div>
    </AuthLayout>
  )
}

export default VerifyEmail
