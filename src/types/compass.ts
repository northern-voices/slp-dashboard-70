// COMPASS Student Communication Profile types.
// Each option's `value` is the slug stored in the database (jsonb);
// its `label` is what the form and the generated report display.

// B · 02 How I currently communicate
export const COMMUNICATION_MODE_OPTIONS = [
  { value: 'speech', label: 'Speech' },
  { value: 'vocalizations', label: 'Vocalizations' },
  { value: 'gestures', label: 'Gestures' },
  { value: 'pointing_eye_gaze', label: 'Pointing; eye gaze' },
  { value: 'facial_expression', label: 'Facial expression' },
  { value: 'body_movements', label: 'Body movements' },
  { value: 'signs', label: 'Signs' },
  { value: 'pictures', label: 'Pictures' },
  { value: 'writing', label: 'Writing' },
  { value: 'aac', label: 'Augmentative & Alternative Communication' },
  { value: 'other', label: 'Other' },
] as const

export type CommunicationMode = (typeof COMMUNICATION_MODE_OPTIONS)[number]['value']

// B · 02 What I currently communicate
export const COMMUNICATION_FUNCTION_OPTIONS = [
  { value: 'requesting', label: 'Requesting' },
  { value: 'refusing_protesting', label: 'Refusing/protesting' },
  { value: 'choices', label: 'Choices' },
  { value: 'commenting_opinions', label: 'Commenting/opinions' },
  { value: 'asking_for_help', label: 'Asking for help' },
  { value: 'enjoyment_connection', label: 'Enjoyment/connection' },
  { value: 'expressing_discomfort', label: 'Expressing discomfort' },
  { value: 'sharing_information', label: 'Sharing information' },
  { value: 'other', label: 'Other' },
] as const

export type CommunicationFunction = (typeof COMMUNICATION_FUNCTION_OPTIONS)[number]['value']

// C · How you can support me
export const SUPPORT_CATEGORY_OPTIONS = [
  { value: 'understanding_language', label: 'Understanding Language' },
  { value: 'routine_predictability', label: 'Routine & Predictability' },
  { value: 'visual_supports', label: 'Visual Supports & Demonstrations' },
  { value: 'aac_tools', label: 'AAC & Communication Tools' },
  { value: 'processing_time', label: 'Processing Time & Response Supports' },
  { value: 'sensory_regulation', label: 'Sensory & Regulation Supports' },
  { value: 'hearing_vision', label: 'Hearing & Vision Considerations' },
  { value: 'motor_access', label: 'Motor Access & Positioning' },
  { value: 'partner_environment', label: 'Communication Partner & Environmental Strategies' },
] as const

export type SupportCategory = (typeof SUPPORT_CATEGORY_OPTIONS)[number]['value']

// ── jsonb shapes ─────────────────────────────────────────────

// A1 · Parent(s) / guardian(s): one entry per person
export interface Guardian {
  name: string
  phone: string
  email: string
  preferred_contact: string
}

// A3 · Student support team: only name_or_org is required
export interface SupportTeamMember {
  name_or_org: string
  role: string
  contact: string
}

// A4 · What matters most
export interface Priority {
  text: string
  identified_by: string
}

// B · 02 How I currently communicate (stored once for private, once for report)
export interface CommunicationModes {
  selected: CommunicationMode[]
  aac_text: string
  other_text: string
}

// B · 02 What I currently communicate: each function has a checkbox and its own notes
export interface CommunicationFunctionEntry {
  checked: boolean
  notes: string
}

export type CommunicationFunctions = Partial<
  Record<CommunicationFunction, CommunicationFunctionEntry>
> & {
  other_label?: string
}

// C · How you can support me: each category has its own private notes and report content
export interface SupportCategoryEntry {
  selected: boolean
  private_notes: string
  report_content: string
}

export type SupportCategories = Partial<Record<SupportCategory, SupportCategoryEntry>>

// ── Empty values (fresh object every call) ───────────────────

export const emptyGuardian = (): Guardian => ({
  name: '',
  phone: '',
  email: '',
  preferred_contact: '',
})

export const emptySupportTeamMember = (): SupportTeamMember => ({
  name_or_org: '',
  role: '',
  contact: '',
})

export const emptyPriority = (): Priority => ({
  text: '',
  identified_by: '',
})

export const emptyCommunicationModes = (): CommunicationModes => ({
  selected: [],
  aac_text: '',
  other_text: '',
})

// ── Database rows ────────────────────────────────────────────

// Mirrors the compass_action_status enum in Postgres
export const COMPASS_ACTION_STATUS_OPTIONS = [
  { value: 'to_be_completed', label: 'To Be Completed' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'completed', label: 'Completed' },
] as const

export type CompassActionStatus = (typeof COMPASS_ACTION_STATUS_OPTIONS)[number]['value']

// compass_student_communication_profiles
export interface CompassProfile {
  id: string
  student_id: string
  school_id: string
  clinician_id: string | null
  created_by: string | null

  // A1 · Student information (dates are 'YYYY-MM-DD')
  student_name: string | null
  school_name: string | null
  clinician_name: string | null
  date_of_birth: string | null
  date_of_evaluation: string | null
  report_date: string
  guardians: Guardian[]
  languages: string | null

  // A2 · Diagnoses & clinical considerations
  diagnoses_private_notes: string | null
  diagnoses_report: string | null

  // A3 / A4 · Support team, what matters most
  support_team: SupportTeamMember[]
  priorities: Priority[]

  // B · 01 About me
  about_me_private_notes: string | null
  about_me_report: string | null

  // B · 02 How / what I communicate
  communication_modes_private: CommunicationModes
  communication_modes_report: CommunicationModes
  communication_functions_private: CommunicationFunctions
  communication_functions_report: CommunicationFunctions

  // C · How you can support me
  support_categories: SupportCategories

  // D · My communication plan
  plan_private_notes: string | null
  plan_report: string | null

  created_at: string
  updated_at: string
}

// compass_profile_goals
export interface CompassGoal {
  id: string
  profile_id: string
  objective: string
  notes: string | null
  sort_order: number
  created_at: string
  updated_at: string
}

// compass_profile_action_items
export interface CompassActionItem {
  id: string
  profile_id: string
  description: string
  assigned_to: string | null
  status: CompassActionStatus | null
  sort_order: number
  created_at: string
  updated_at: string
}

// A profile with its goals and action items, as the form loads it
export interface CompassProfileWithItems extends CompassProfile {
  goals: CompassGoal[]
  action_items: CompassActionItem[]
}

// The lighter row used for the list on the student page
export type CompassProfileSummary = Pick<
  CompassProfile,
  | 'id'
  | 'student_id'
  | 'date_of_evaluation'
  | 'report_date'
  | 'clinician_name'
  | 'created_by'
  | 'created_at'
  | 'updated_at'
>

// ── What the API accepts ─────────────────────────────────────

// Creating a profile: the links are required, the prefilled snapshots are optional
export type CompassProfileCreateInput = Pick<CompassProfile, 'student_id' | 'school_id'> &
  Partial<
    Pick<
      CompassProfile,
      'clinician_id' | 'student_name' | 'school_name' | 'clinician_name' | 'date_of_birth'
    >
  >

// Fields the form may change. Never the id, the student/school links,
// created_by (pinned by a trigger) or the timestamps (set by the database)
export type CompassProfileUpdate = Partial<
  Omit<
    CompassProfile,
    'id' | 'student_id' | 'school_id' | 'created_by' | 'created_at' | 'updated_at'
  >
>

export type CompassGoalUpdate = Partial<Pick<CompassGoal, 'objective' | 'notes' | 'sort_order'>>

export type CompassActionItemUpdate = Partial<
  Pick<CompassActionItem, 'description' | 'assigned_to' | 'status' | 'sort_order'>
>
