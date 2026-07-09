import { supabase } from '@/lib/supabase'
import type { StudentData } from '@/api/monthlymeetings'
import type {
  MonthlyMeetingDraft,
  MonthlyMeetingDraftFormData,
  MonthlyMeetingDraftType,
} from '@/types/monthly-meeting-draft'

const MAX_CREATE_DRAFTS_PER_SCHOOL = 15

const buildAutoLabel = (formData: MonthlyMeetingDraftFormData): string => {
  const title = formData.meeting_title?.trim()

  if (title) return title

  return `Untitled meeting - ${new Date().toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  })}`
}

export const monthlyMeetingDraftsApi = {
  getCreateDrafts: async (schoolId: string): Promise<MonthlyMeetingDraft[]> => {
    const { data, error } = await supabase
      .from('monthly_meeting_drafts')
      .select('*')
      .eq('school_id', schoolId)
      .eq('draft_type', 'create')
      .order('updated_at', { ascending: false })

    if (error) throw error
    return (data || []) as MonthlyMeetingDraft[]
  },

  getEditDraft: async (meetingId: string): Promise<MonthlyMeetingDraft | null> => {
    const { data, error } = await supabase
      .from('monthly_meeting_drafts')
      .select('*')
      .eq('meeting_id', meetingId)
      .eq('draft_type', 'edit')
      .maybeSingle()

    if (error) throw error
    return data as MonthlyMeetingDraft | null
  },

  createDraft: async (params: {
    schoolId: string
    meetingId: string | null
    draftType: MonthlyMeetingDraftType
    formData: MonthlyMeetingDraftFormData
    studentData: StudentData
  }): Promise<MonthlyMeetingDraft> => {
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) throw new Error('User not authenticated')

    if (params.draftType === 'create') {
      const { count, error: countError } = await supabase
        .from('monthly_meeting_drafts')
        .select('id', { count: 'exact', head: true })
        .eq('school_id', params.schoolId)
        .eq('draft_type', 'create')

      if (countError) throw countError

      if ((count ?? 0) >= MAX_CREATE_DRAFTS_PER_SCHOOL) {
        const { data: oldest } = await supabase
          .from('monthly_meeting_drafts')
          .select('id')
          .eq('school_id', params.schoolId)
          .eq('draft_type', 'create')
          .order('updated_at', { ascending: true })
          .limit(1)
          .maybeSingle()

        if (oldest) {
          await supabase.from('monthly_meeting_drafts').delete().eq('id', oldest.id)
        }
      }
    }

    const { data, error } = await supabase
      .from('monthly_meeting_drafts')
      .insert({
        user_id: user.id,
        school_id: params.schoolId,
        meeting_id: params.meetingId,
        draft_type: params.draftType,
        label: buildAutoLabel(params.formData),
        is_label_custom: false,
        form_data: params.formData,
        student_data: params.studentData,
      })
      .select('*')
      .single()

    if (error) throw error
    return data as MonthlyMeetingDraft
  },

  updateDraft: async (
    id: string,
    params: {
      formData: MonthlyMeetingDraftFormData
      studentData: StudentData
      isLabelCustom: boolean
    }
  ): Promise<void> => {
    const update: Record<string, unknown> = {
      form_data: params.formData,
      student_data: params.studentData,
      updated_at: new Date().toISOString(),
    }
    if (!params.isLabelCustom) {
      update.label = buildAutoLabel(params.formData)
    }

    const { error } = await supabase.from('monthly_meeting_drafts').update(update).eq('id', id)
    if (error) throw error
  },

  renameDraft: async (id: string, label: string): Promise<void> => {
    const { error } = await supabase
      .from('monthly_meeting_drafts')
      .update({ label, is_label_custom: true, updated_at: new Date().toISOString() })
      .eq('id', id)
    if (error) throw error
  },

  deleteDraft: async (id: string): Promise<void> => {
    const { error } = await supabase.from('monthly_meeting_drafts').delete().eq('id', id)
    if (error) throw error
  },
}
