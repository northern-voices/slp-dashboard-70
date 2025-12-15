import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'

export const useAvailableSLPs = (organizationId: string | undefined) => {
  return useQuery({
    queryKey: ['available-slps', organizationId],
    queryFn: async () => {
      if (!organizationId) {
        throw new Error('No organization ID provided')
      }

      const { data, error } = await supabase
        .from('users')
        .select('id, first_name, last_name, email')
        .eq('organization_id', organizationId)
        .eq('role', 'slp')
        .eq('is_active', true)
        .order('first_name')

      if (error) throw error

      return (data || []).map(user => ({
        id: user.id,
        name: `${user.first_name} ${user.last_name}`,
        email: user.email,
      }))
    },
    enabled: !!organizationId,
    staleTime: 5 * 60 * 1000,
  })
}
