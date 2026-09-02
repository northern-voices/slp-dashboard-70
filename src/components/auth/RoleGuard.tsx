import { Navigate } from 'react-router-dom'
import { useOrganization } from '@/contexts/OrganizationContext'

interface RoleGuardProps {
  children: React.ReactNode
  allowedRoles: string[]
}

const RoleGuard = ({ children, allowedRoles }: RoleGuardProps) => {
  const { userProfile } = useOrganization()

  if (!allowedRoles.includes(userProfile?.role ?? '')) {
    return <Navigate to='/' replace />
  }

  return <>{children}</>
}

export default RoleGuard
