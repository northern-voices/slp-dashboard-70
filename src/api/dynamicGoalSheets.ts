import { supabase } from '@/lib/supabase'
import type { DynamicGoalSheetRating, DynamicGoalSheetWithSessions } from '@/types/database'

const DYNAMIC_GOAL_SHEET_SELECT = `
  *,
  student:students (
    id,
    first_name,
    last_name
  ),
  sessions:dynamic_goal_sheet_sessions (
    id,
    goal_sheet_id,
    session_number,
    session_date,
    sound_rating,
    activities,
    progress_notes,
    additional_comments,
    created_at,
    updated_at
  )
`

interface RawDynamicGoalSheet {
  id: string
  school_id: string
  student_id: string
  goal_text: string
  created_by: string | null
  created_at: string
  updated_at: string
  student: { id: string; first_name: string; last_name: string } | null
  sessions: Array<{
    id: string
    goal_sheet_id: string
    session_number: number
    session_date: string | null
    sound_rating: DynamicGoalSheetRating | null
    activities: string | null
    progress_notes: string | null
    additional_comments: string | null
    created_at: string
    updated_at: string
  }>
}
