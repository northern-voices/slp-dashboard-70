import { supabase } from '@/lib/supabase'
import { dateUtils } from '@/utils/dateUtils'
import {
  emptyCommunicationModes,
  type CommunicationModes,
  type CompassActionItem,
  type CompassActionItemUpdate,
  type CompassGoal,
  type CompassGoalUpdate,
  type CompassProfile,
  type CompassProfileCreateInput,
  type CompassProfileSummary,
  type CompassProfileUpdate,
  type CompassProfileWithItems,
} from '@/types/compass'

const PROFILE_SUMMARY_SELECT =
  'id, student_id, date_of_evaluation, report_date, clinician_name, created_by, created_at, updated_at'

const PROFILE_WITH_ITEMS_SELECT = `
    *,
    goals:compass_profile_goals (*),
    action_items:compass_profile_action_items (*)  
  `

const bySortOrder = (a: { sort_order: number }, b: { sort_order: number }) =>
  a.sort_order - b.sort_order

export const nextSortOrder = (items: { sort_order: number }[]): number => {
  let max = -1
  for (const item of items) {
    max = Math.max(max, item.sort_order)
  }
  return max + 1
}

const normalizeModes = (
  value: Partial<CommunicationModes> | null | undefined
): CommunicationModes => ({
  ...emptyCommunicationModes(),
  ...value,
})

const normalizeProfile = <T extends CompassProfile>(raw: T): T => ({
  ...raw,
  communication_modes_private: normalizeModes(raw.communication_modes_private),
  communication_modes_report: normalizeModes(raw.communication_modes_report),
})

const normalizeProfileWithItems = (raw: CompassProfileWithItems): CompassProfileWithItems => ({
  ...normalizeProfile(raw),
  goals: [...raw.goals].sort(bySortOrder),
  action_items: [...raw.action_items].sort(bySortOrder),
})

export const compassProfilesApi = {
  getProfilesByStudent: async (studentId: string): Promise<CompassProfileSummary[]> => {
    const { data, error } = await supabase
      .from('compass_student_communication_profiles')
      .select(PROFILE_SUMMARY_SELECT)
      .eq('student_id', studentId)
      .order('date_of_evaluation', { ascending: false, nullsFirst: false })
      .order('created_at', { ascending: false })

    if (error) throw error

    return data ?? []
  },

  getProfileById: async (id: string): Promise<CompassProfileWithItems> => {
    const { data, error } = await supabase
      .from('compass_student_communication_profiles')
      .select(PROFILE_WITH_ITEMS_SELECT)
      .eq('id', id)
      .single()

    if (error) throw error

    return normalizeProfileWithItems(data)
  },

  createProfile: async (input: CompassProfileCreateInput): Promise<CompassProfileWithItems> => {
    const { data, error } = await supabase
      .from('compass_student_communication_profiles')
      .insert({
        ...input,
        report_date: dateUtils.getCurrentInputDate(),
      })
      .select(PROFILE_WITH_ITEMS_SELECT)
      .single()

    if (error) throw error

    return normalizeProfileWithItems(data)
  },

  updateProfile: async (id: string, patch: CompassProfileUpdate): Promise<CompassProfile> => {
    const { data, error } = await supabase
      .from('compass_student_communication_profiles')
      .update(patch)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error

    return normalizeProfile(data)
  },

  deleteProfile: async (id: string): Promise<void> => {
    const { data, error } = await supabase
      .from('compass_student_communication_profiles')
      .delete()
      .eq('id', id)
      .select('id')

    if (error) throw error

    if (!data || data.length === 0) {
      throw new Error(
        "This profile couldn't be deleted. Only the person who created it, or an admin, can delete a COMPASS profile."
      )
    }
  },

  // ── Goals (D · My communication goals) ──────────────────

  addGoal: async (profileId: string, sortOrder: number): Promise<CompassGoal> => {
    const { data, error } = await supabase
      .from('compass_profile_goals')
      .insert({ profile_id: profileId, objective: '', sort_order: sortOrder })
      .select()
      .single()

    if (error) throw error

    return data
  },

  updateGoal: async (id: string, patch: CompassGoalUpdate): Promise<CompassGoal> => {
    const { data, error } = await supabase
      .from('compass_profile_goals')
      .update(patch)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error

    return data
  },

  deleteGoal: async (id: string): Promise<void> => {
    const { error } = await supabase.from('compass_profile_goals').delete().eq('id', id)

    if (error) throw error
  },

  // ── Action items (D · Action items & next steps) ────────
  addActionItem: async (profileId: string, sortOrder: number): Promise<CompassActionItem> => {
    const { data, error } = await supabase
      .from('compass_profile_action_items')
      .insert({ profile_id: profileId, description: '', sort_order: sortOrder })
      .select()
      .single()

    if (error) throw error

    return data
  },

  updateActionItem: async (
    id: string,
    patch: CompassActionItemUpdate
  ): Promise<CompassActionItem> => {
    const { data, error } = await supabase
      .from('compass_profile_action_items')
      .update(patch)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error

    return data
  },

  deleteActionItem: async (id: string): Promise<void> => {
    const { error } = await supabase.from('compass_profile_action_items').delete().eq('id', id)

    if (error) throw error
  },
}
