import { Navigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'

interface RoleGuardProps {
  children: React.ReactNode
  allowedRoles: string[]
}

const RoleGuard = ({ children, allowedRoles }: RoleGuardProps) => {
  const { user } = useAuth()

  if (!allowedRoles.includes(user?.role ?? '')) {
    return <Navigate to='/' replace />
  }

  return <>{children}</>
}

export default RoleGuard
