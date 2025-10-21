import { supabase } from '@/lib/supabase'

export interface User {
  id: string
  organization_id: string
  email: string
  first_name: string
  last_name: string
  role: 'admin' | 'slp' | 'supervisor'
  is_active: boolean
  email_verified_at: string | null
  created_at: string
  updated_at: string
  is_email_verified: boolean
}

const getUserOrganizationSchools = async (organizationId: string): Promise<string[]> => {
  try {
    const { data: schools, error } = await supabase
      .from('schools')
      .select('id')
      .eq('organization_id', organizationId)

    if (error) throw error

    return schools?.map(school => school.id) || []
  } catch (error) {
    console.error('Error fetching organization schools:', error)

    return []
  }
}

export const usersApi = {
  getUsers: async (
    currentUserId?: string,
    userRole?: 'admin' | 'slp' | 'supervisor',
    organizationId?: string
  ): Promise<User[]> => {
    try {
      let query = supabase
        .from('users')
        .select('*')
        .eq('is_active', true) // Only get active users

      // Filter by organization if provided
      if (organizationId) {
        query = query.eq('organization_id', organizationId)
      }

      const { data, error } = await query.order('first_name', { ascending: true })

      if (error) throw error

      return data || []
    } catch (error) {
      console.error('Error fetching users', error)
      throw error
    }
  },
}
