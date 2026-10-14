import { supabase } from '@/lib/supabase'
import type {
  DynamicGoalSheetRating,
  DynamicGoalSheetSession,
  DynamicGoalSheetPageWithSessions,
  DynamicGoalSheetWithPages,
} from '@/types/database'

const DYNAMIC_GOAL_SHEET_SELECT = `
    *,
    student:students (
      id,
      first_name,
      last_name
    ),
    pages:dynamic_goal_sheet_pages (
      id,
      goal_sheet_id,
      page_number,
      goal_text,
      created_at,
      updated_at,
      sessions:dynamic_goal_sheet_sessions (
        id,
        page_id,
        session_number,
        session_date,
        sound_rating,
        activities,
        progress_notes,
        additional_comments,
        created_at,
        updated_at
      )
    )
  `

interface RawDynamicGoalSheet {
  id: string
  school_id: string
  student_id: string
  created_by: string | null
  created_at: string
  updated_at: string
  student: { id: string; first_name: string; last_name: string } | null
  pages: Array<{
    id: string
    goal_sheet_id: string
    page_number: number
    goal_text: string
    created_at: string
    updated_at: string
    sessions: Array<{
      id: string
      page_id: string
      session_number: number
      session_date: string | null
      sound_rating: DynamicGoalSheetRating | null
      activities: string | null
      progress_notes: string | null
      additional_comments: string | null
      created_at: string
      updated_at: string
    }>
  }>
}

const transformDynamicGoalSheet = (raw: RawDynamicGoalSheet): DynamicGoalSheetWithPages => ({
  id: raw.id,
  school_id: raw.school_id,
  student_id: raw.student_id,
  created_by: raw.created_by,
  created_at: raw.created_at,
  updated_at: raw.updated_at,
  student: raw.student ?? undefined,
  pages: [...raw.pages]
    .sort((a, b) => a.page_number - b.page_number)
    .map(page => ({
      ...page,
      sessions: [...page.sessions].sort((a, b) => a.session_number - b.session_number),
    })),
})

export const dynamicGoalSheetsApi = {
  createGoalSheet: async ({
    studentId,
    schoolId,
    goalTexts,
  }: {
    studentId: string
    schoolId: string
    goalTexts: string[]
  }): Promise<DynamicGoalSheetWithPages> => {
    try {
      const { data: newSheet, error: sheetError } = await supabase
        .from('dynamic_goal_sheets')
        .insert({ student_id: studentId, school_id: schoolId })
        .select()
        .single()

      if (sheetError) throw sheetError

      const { data: newPages, error: pageError } = await supabase
        .from('dynamic_goal_sheet_pages')
        .insert(
          goalTexts.map((goal_text, i) => ({
            goal_sheet_id: newSheet.id,
            page_number: i + 1,
            goal_text,
          }))
        )
        .select()

      if (pageError) throw pageError

      const { error: sessionError } = await supabase
        .from('dynamic_goal_sheet_sessions')
        .insert(
          newPages.flatMap(page =>
            [1, 2, 3].map(session_number => ({ page_id: page.id, session_number }))
          )
        )

      if (sessionError) throw sessionError

      return dynamicGoalSheetsApi.getGoalSheetById(newSheet.id)
    } catch (error) {
      console.error('Error creating dynamic goal sheet:', error)
      throw error
    }
  },
  getGoalSheetById: async (id: string): Promise<DynamicGoalSheetWithPages> => {
    const { data, error } = await supabase
      .from('dynamic_goal_sheets')
      .select(DYNAMIC_GOAL_SHEET_SELECT)
      .eq('id', id)
      .single()

    if (error) throw error

    return transformDynamicGoalSheet(data)
  },

  getGoalSheetsByStudent: async (studentId: string): Promise<DynamicGoalSheetWithPages[]> => {
    const { data, error } = await supabase
      .from('dynamic_goal_sheets')
      .select(DYNAMIC_GOAL_SHEET_SELECT)
      .eq('student_id', studentId)
      .order('updated_at', { ascending: false })

    if (error) throw error

    return data.map(transformDynamicGoalSheet)
  },

  getGoalSheetsBySchool: async (schoolId: string): Promise<DynamicGoalSheetWithPages[]> => {
    const { data, error } = await supabase
      .from('dynamic_goal_sheets')
      .select(DYNAMIC_GOAL_SHEET_SELECT)
      .eq('school_id', schoolId)
      .order('updated_at', { ascending: false })

    if (error) throw error

    return data.map(transformDynamicGoalSheet)
  },

  updatePageGoalText: async (pageId: string, goalText: string): Promise<void> => {
    const { error } = await supabase
      .from('dynamic_goal_sheet_pages')
      .update({ goal_text: goalText, updated_at: new Date().toISOString() })
      .eq('id', pageId)

    if (error) throw error
  },

  addPage: async (
    goalSheetId: string,
    goalText: string
  ): Promise<DynamicGoalSheetPageWithSessions> => {
    try {
      const { data: existingPages, error: countError } = await supabase
        .from('dynamic_goal_sheet_pages')
        .select('page_number')
        .eq('goal_sheet_id', goalSheetId)
        .order('page_number', { ascending: false })
        .limit(1)

      if (countError) throw countError

      const nextPageNumber = (existingPages[0]?.page_number ?? 0) + 1

      const { data: newPage, error: pageError } = await supabase
        .from('dynamic_goal_sheet_pages')
        .insert({ goal_sheet_id: goalSheetId, page_number: nextPageNumber, goal_text: goalText })
        .select()
        .single()

      if (pageError) throw pageError

      const { data: newSessions, error: sessionError } = await supabase
        .from('dynamic_goal_sheet_sessions')
        .insert([1, 2, 3].map(session_number => ({ page_id: newPage.id, session_number })))
        .select()

      if (sessionError) throw sessionError

      return {
        ...newPage,
        sessions: newSessions.sort((a, b) => a.session_number - b.session_number),
      }
    } catch (error) {
      console.error('Error adding dynamic goal sheet page:', error)
      throw error
    }
  },

  addSession: async (pageId: string): Promise<DynamicGoalSheetSession> => {
    try {
      const { data: existingSessions, error: countError } = await supabase
        .from('dynamic_goal_sheet_sessions')
        .select('session_number')
        .eq('page_id', pageId)
        .order('session_number', { ascending: false })
        .limit(1)

      if (countError) throw countError

      const nextSessionNumber = (existingSessions[0]?.session_number ?? 0) + 1

      const { data: newSession, error: insertError } = await supabase
        .from('dynamic_goal_sheet_sessions')
        .insert({ page_id: pageId, session_number: nextSessionNumber })
        .select()
        .single()

      if (insertError) throw insertError

      return newSession
    } catch (error) {
      console.error('Error adding dynamic goal sheet session:', error)
      throw error
    }
  },

  updateSession: async (
    sessionId: string,
    data: Partial<{
      session_date: string | null
      sound_rating: DynamicGoalSheetRating | null
      activities: string | null
      progress_notes: string | null
      additional_comments: string | null
    }>
  ): Promise<DynamicGoalSheetSession> => {
    const { data: updatedSession, error } = await supabase
      .from('dynamic_goal_sheet_sessions')
      .update({ ...data, updated_at: new Date().toISOString() })
      .eq('id', sessionId)
      .select()
      .single()

    if (error) throw error

    return updatedSession
  },

  deleteGoalSheet: async (id: string): Promise<void> => {
    const { error } = await supabase.from('dynamic_goal_sheets').delete().eq('id', id)

    if (error) throw error
  },
}
