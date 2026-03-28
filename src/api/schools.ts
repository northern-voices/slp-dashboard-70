import { supabase } from '@/lib/supabase'
import { School } from '@/types/database'

export interface SpeechScreenings {
  id: string
}

interface RawSchool {
  id: string
  organization_id: string
  name: string
  street_address?: string
  address?: string
  city?: string
  region?: string
  state?: string
  postal_code?: string
  zip?: string
  principal_name?: string
  principal_email?: string
  phone?: string
  created_at: string
  updated_at: string
}

export const schoolsApi = {
  getSchools: async (): Promise<School[]> => {
    const { data, error } = await supabase.from('schools').select('*').order('name')

    console.log(data, 'schools data')

    if (error) {
      throw error
    }

    // Transform the data to match the School interface
    const transformedData: School[] = (data || []).map((school: RawSchool) => ({
      id: school.id,
      organization_id: school.organization_id,
      name: school.name,
      address: school.street_address || school.address || '',
      city: school.city || '',
      state: school.region || school.state || '',
      zip: school.postal_code || school.zip || '',
      principal_name: school.principal_name || '',
      principal_email: school.principal_email || '',
      phone: school.phone || '',
      created_at: school.created_at,
      updated_at: school.updated_at,
    }))

    return transformedData
  },
}
