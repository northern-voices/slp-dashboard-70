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
