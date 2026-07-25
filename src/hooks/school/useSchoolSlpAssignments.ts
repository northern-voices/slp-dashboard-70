import { useQuery, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { useToast } from '@/hooks/use-toast'

export interface AssignedSlp {
  assignmentId: string
  id: string
  name: string
  email: string
}

export const useSchoolSlpAssignments = (schoolId: string | undefined) => {
  return useQuery({
    queryKey: ['school-slp-assignments', schoolId],
    queryFn: async (): Promise<AssignedSlp[]> => {
      if (!schoolId) throw new Error('No school ID provided')

      const { data, error } = await supabase
        .from('user_school_assignments')
        .select('id, users(id, first_name, last_name, email)')
        .eq('school_id', schoolId)

      if (error) throw error

      return (data || []).map(row => {
        const user = row.users as unknown as {
          id: string
          first_name: string
          last_name: string
          email: string
        }

        return {
          assignmentId: row.id,
          id: user.id,
          name: `${user.first_name} ${user.last_name}`,
          email: user.email,
        }
      })
    },
    enabled: !!schoolId,
  })
}

export const useSlpAssignmentActions = (schoolId: string | undefined) => {
  const queryClient = useQueryClient()
  const { toast } = useToast()

  const assignSlpToSchool = async (userId: string) => {
    if (!schoolId) return

    const { error } = await supabase
      .from('user_school_assignments')
      .insert({ user_id: userId, school_id: schoolId })

    if (error) {
      toast({ title: 'Failed to assign SLP', description: error.message, variant: 'destructive' })
      return
    }

    queryClient.invalidateQueries({ queryKey: ['school-slp-assignments', schoolId] })
  }

  const unassignSlpFromSchool = async (assignmentId: string) => {
    const { error } = await supabase.from('user_school_assignments').delete().eq('id', assignmentId)

    if (error) {
      toast({ title: 'Failed to remove SLP', description: error.message, variant: 'destructive' })
      return
    }

    queryClient.invalidateQueries({ queryKey: ['school-slp-assignments', schoolId] })
  }

  return { assignSlpToSchool, unassignSlpFromSchool }
}
