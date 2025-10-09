import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useAuth } from '@/contexts/AuthContext'
import { useOrganization } from '@/contexts/OrganizationContext'

import { monthlyMeetingsApi } from '@/api/monthlymeetings'

export const useMonthlyMeetings = () => {
  const { user } = useAuth()
  const { userProfile, currentOrganization } = useOrganization()
}
