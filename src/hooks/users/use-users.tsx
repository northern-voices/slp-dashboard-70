import { useQuery } from '@tanstack/react-query'
import { useAuth } from '@/contexts/AuthContext'
import { useOrganization } from '@/contexts/OrganizationContext'
import { usersApi, User } from '@/api/users'

export const useGetUsersByOrganization = (organizationId?: string) => {
  const { user } = useAuth()
  const { userProfile } = useOrganization()

  return useQuery<User[], Error>({
    queryKey: ['users', 'by-organization', organizationId, user?.id, userProfile?.role],
    queryFn: () =>
      usersApi.getUsers(user?.id, userProfile?.role as 'admin' | 'slp' | 'supervisor', organizationId),
    enabled: !!user?.id && !!organizationId,
    staleTime: 1000 * 60 * 5, // 5 minutes
  })
}

export const useGetUsers = () => {
  const { user } = useAuth()
  const { userProfile, currentOrganization } = useOrganization()

  return useQuery<User[], Error>({
    queryKey: ['users', user?.id, userProfile?.role, currentOrganization?.id],
    queryFn: () =>
      usersApi.getUsers(
        user?.id,
        userProfile?.role as 'admin' | 'slp' | 'supervisor',
        currentOrganization?.id
      ),
    enabled: !!user?.id,
    staleTime: 1000 * 60 * 5, // 5 minutes
  })
}