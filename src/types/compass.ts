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
