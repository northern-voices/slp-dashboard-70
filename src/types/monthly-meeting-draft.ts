import type { StudentData } from '@/api/monthlymeetings'

export interface MonthlyMeetingDraftFormData {
  meeting_title: string
  facilitator_id: string
  attendees: string[]
  meeting_date: string
  meeting_type: string
  topics?: string
  school_visit_purpose?: string
  additional_notes: string
  action_plan: string
}

export type MonthlyMeetingDraftType = 'create' | 'edit'

export interface MonthlyMeetingDraft {
  id: string
  user_id: string
  school_id: string
  meeting_id: string | null
  draft_type: MonthlyMeetingDraftType
  label: string
  is_label_custom: boolean
  form_data: MonthlyMeetingDraftFormData
  student_data: StudentData
  created_at: string
  updated_at: string
}
