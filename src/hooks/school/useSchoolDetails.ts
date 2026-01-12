import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { School } from '@/types/database'
import { formatPhoneNumber } from '@/utils/formatters'

interface PrimarySLP {
  name: string
  email: string
  phone: string
}

interface SchoolTeamMember {
  id: string
  name: string
  roles: string[]
  email: string
  phone: string
}

interface SchoolDetailsData {
  schoolName: string
  schoolPhone: string
  primarySLP: PrimarySLP
  schoolTeam: SchoolTeamMember[]
}

export const useSchoolDetails = (currentSchool: School | null) => {
  return useQuery({
    queryKey: ['school-details', currentSchool?.id],
    queryFn: async (): Promise<SchoolDetailsData> => {
      if (!currentSchool) {
        throw new Error('No school selected')
      }

      let primarySLPData: PrimarySLP = {
        name: 'Not assigned',
        email: '',
        phone: '',
      }

      if (currentSchool.primary_slp_id) {
        const { data: slpUser, error: slpError } = await supabase
          .from('users')
          .select('first_name, last_name, email')
          .eq('id', currentSchool.primary_slp_id)
          .single()

        if (slpError && slpError.code !== 'PGRST116') {
          console.error('Error fetching primary SLP:', slpError)
        } else if (slpUser) {
          primarySLPData = {
            name: `${slpUser.first_name} ${slpUser.last_name}`,
            email: slpUser.email,
            phone: currentSchool.phone ? formatPhoneNumber(currentSchool.phone) : '',
          }
        }
      }

      const { data: staffMembers, error: staffError } = await supabase
        .from('school_staff')
        .select('*')
        .eq('school_id', currentSchool.id)
        .eq('is_active', true)
        .order('created_at', { ascending: true })

      if (staffError) {
        console.error('Error fetching school staff:', staffError)
        throw staffError
      }

      const transformedStaff: SchoolTeamMember[] = (staffMembers || []).map(staff => ({
        id: staff.id,
        name: `${staff.first_name} ${staff.last_name}`,
        roles: staff.roles,
        email: staff.email || '',
        phone: staff.phone ? formatPhoneNumber(staff.phone) : '',
      }))

      return {
        schoolName: currentSchool.name,
        schoolPhone: currentSchool.phone ? formatPhoneNumber(currentSchool.phone) : '',
        primarySLP: primarySLPData,
        schoolTeam: transformedStaff,
      }
    },
    enabled: !!currentSchool,
    staleTime: 5 * 60 * 1000,
  })
}
