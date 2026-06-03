import { useState, useEffect, useRef } from 'react'
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
  const [mfaStatus, setMfaStatus] = useState<
    'checking' | 'ok' | 'needs-enroll' | 'needs-challenge'
  >('checking')
  const checkedUserId = useRef<string | null>(null)

  useEffect(() => {
    if (!user || isLoading) return
    // Only re-check when the user changes (not on every route navigation)
    if (checkedUserId.current === user.id) return

    checkedUserId.current = user.id

    Promise.all([
      supabase.auth.mfa.getAuthenticatorAssuranceLevel(),
      supabase.auth.mfa.listFactors(),
    ]).then(([{ data: aalData }, { data: factorsData }]) => {
      const hasFactors = (factorsData?.totp?.length ?? 0) > 0
      if (!hasFactors) {
        setMfaStatus('needs-enroll')
      } else if (aalData?.nextLevel === 'aal2' && aalData?.currentLevel !== 'aal2') {
        setMfaStatus('needs-challenge')
      } else {
        setMfaStatus('ok')
      }
    })
  }, [user, isLoading])

  useEffect(() => {
    if (!user) {
      setMfaStatus('checking')
      checkedUserId.current = null
    }
  }, [user])

  if (isLoading || (user && mfaStatus === 'checking')) {
    return (
      <div className='flex items-center justify-center min-h-screen'>
        <LoadingSpinner size='lg' />
      </div>
    )
  }

  if (!user) {
    return <Navigate to='/auth/login' state={{ from: location }} replace />
  }

  if (mfaStatus === 'needs-enroll') {
    return <Navigate to='/auth/mfa/enroll' replace />
  }

  if (mfaStatus === 'needs-challenge') {
    return <Navigate to='/auth/mfa' state={{ from: location }} replace />
  }

  return <>{children}</>
}

export default ProtectedRoute
