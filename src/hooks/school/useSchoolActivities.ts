import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { School } from '@/types/database'

interface SchoolActivity {
  id: string
  school_id: string
  activity_type: string
  activity_date: string
  notes: string | null
  created_by: string
  created_at: string
  updated_at: string
  creator: {
    first_name: string
    last_name: string
  } | null
}

export const useSchoolActivities = (currentSchool: School | null) => {
  return useQuery({
    queryKey: ['school-activities', currentSchool?.id],
    queryFn: async (): Promise<SchoolActivity[]> => {
      if (!currentSchool) {
        throw new Error('No school selected')
      }

      const { data, error } = await supabase
        .from('school_activities')
        .select('*, creator:users!school_activities_created_by_fkey(first_name, last_name)')
        .eq('school_id', currentSchool.id)

      if (error) {
        console.error('Error fetching school activities:', error)
      }

      return data || []
    },
    enabled: !!currentSchool,
    staleTime: 5 * 60 * 1000,
  })
}
