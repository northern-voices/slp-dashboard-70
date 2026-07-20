import { useQuery, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { useToast } from '@/hooks/use-toast'

export interface AssignedSlp {
  assignmentId: string
  id: string
  name: string
  email: string
}
