import { supabase } from '@/lib/supabase'

export const getSchoolStaffEmails = async (schoolIds: string[]): Promise<string[]> => {
  const { data, error } = await supabase
    .from('school_staff')
    .select('email')
    .in('school_id', schoolIds)
    .eq('is_active', true)
    .not('email', 'is', null)

  if (error) throw error
  return data.map(row => row.email as string)
}
