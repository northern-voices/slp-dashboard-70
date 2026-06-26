import { useState, useEffect } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import LoadingSpinner from '@/components/common/LoadingSpinner'
import { supabase } from '@/lib/supabase'

interface ProtectedRouteProps {
  children: React.ReactNode
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { user, isLoading } = useAuth()
  const location = useLocation()
  const [mfaChecked, setMfaChecked] = useState(false)
  const [mfaRedirect, setMfaRedirect] = useState<
    'none' | 'enroll' | 'totp-challenge' | 'email-challenge'
  >('none')

  useEffect(() => {
    setMfaChecked(false)
    setMfaRedirect('none')

    if (!user) {
      setMfaChecked(true)
      return
    }

    Promise.all([
      supabase.auth.mfa.getAuthenticatorAssuranceLevel(),
      supabase.auth.mfa.listFactors(),
    ])
      .then(async ([{ data: aal }, { data: factors }]) => {
        const {
          data: { user },
        } = await supabase.auth.getUser()
        const preference = user?.user_metadata?.preferred_mfa ?? 'email'
        const hasFactors = (factors?.totp?.length ?? 0) > 0

        if (preference === 'totp' && hasFactors) {
          if (aal?.nextLevel === 'aal2' && aal?.currentLevel !== 'aal2') {
            setMfaRedirect('totp-challenge')
          }
        } else {
          const emailVerified = sessionStorage.getItem(`email_mfa_${user.id}`) === 'true'
          if (!emailVerified) setMfaRedirect('email-challenge')
        }
      })
      .catch(() => {})
      .finally(() => setMfaChecked(true))
  }, [user?.id])

  if (isLoading) {
    return (
      <div className='flex items-center justify-center min-h-screen'>
        <LoadingSpinner size='lg' />
      </div>
    )
  }

  if (!user) {
    return <Navigate to='/auth/login' state={{ from: location }} replace />
  }

  if (!mfaChecked) {
    return (
      <div className='flex items-center justify-center min-h-screen'>
        <LoadingSpinner size='lg' />
      </div>
    )
  }

  if (mfaRedirect === 'enroll') {
    return <Navigate to='/auth/mfa/enroll' replace />
  }

  if (mfaRedirect === 'totp-challenge') {
    return <Navigate to='/auth/mfa' state={{ from: location }} replace />
  }

  if (mfaRedirect === 'email-challenge') {
    return <Navigate to='/auth/email-otp' state={{ from: location }} replace />
  }

  return <>{children}</>
}

export default ProtectedRoute
