import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import LoadingSpinner from '@/components/common/LoadingSpinner'

interface ProtectedRouteProps {
  children: React.ReactNode
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { user, isLoading } = useAuth()
  const location = useLocation()

  if (isLoading) {
    return (
      <div className='min-h-screen flex items-center justify-center'>
        <LoadingSpinner size='lg' />
      </div>
    )
  }

  if (!user) {
    // Redirect to login page but save the attempted url
    return <Navigate to='/auth/login' state={{ from: location }} replace />
  }

  return <>{children}</>
}

export default ProtectedRoute
