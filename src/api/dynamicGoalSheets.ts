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

const transformDynamicGoalSheet = (raw: RawDynamicGoalSheet): DynamicGoalSheetWithSessions => ({
  id: raw.id,
  school_id: raw.school_id,
  student_id: raw.student_id,
  goal_text: raw.goal_text,
  created_by: raw.created_by,
  created_at: raw.created_at,
  updated_at: raw.updated_at,
  student: raw.student ?? undefined,
  sessions: [...raw.sessions].sort((a, b) => a.session_number - b.session_number),
})

export const dynamicGoalSheetsApi = {
  createGoalSheet: async ({
    studentId,
    schoolId,
    goalText,
  }: {
    studentId: string
    schoolId: string
    goalText: string
  }): Promise<DynamicGoalSheetWithSessions> => {
    try {
      const { data: newSheet, error: sheetError } = await supabase
        .from('dynamic_goal_sheets')
        .insert({ student_id: studentId, school_id: schoolId, goal_text: goalText })
        .select()
        .single()

      if (sheetError) throw sheetError

      const { error: sessionError } = await supabase
        .from('dynamic_goal_sheet_sessions')
        .insert({ goal_sheet_id: newSheet.id, session_number: 1 })

      if (sessionError) throw sessionError

      const { data: completeSheet, error: fetchError } = await supabase
        .from('dynamic_goal_sheets')
        .select(DYNAMIC_GOAL_SHEET_SELECT)
        .eq('id', newSheet.id)
        .single()

      if (fetchError) throw fetchError

      return transformDynamicGoalSheet(completeSheet)
    } catch (error) {
      console.error('Error creating dynamic goal sheet:', error)
      throw error
    }
  },
}
