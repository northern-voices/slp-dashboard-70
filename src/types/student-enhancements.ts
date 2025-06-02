export interface SchoolSupportForm {
  id: string;
  student_id: string;
  slp_ids: string[];
  start_date: string;
  end_date: string;
  support_types: SupportType[];
  notes: string;
  follow_up: boolean;
  follow_up_date?: string;
  status: SupportTicketStatus;
  priority: SupportTicketPriority;
  created_at: string;
  updated_at: string;
  // Related data for display
  student_name?: string;
  school_name?: string;
  slp_names?: string[];
}

export type SupportType = 
  | 'school_visit_speech_screen'
  | 'school_visit_follow_up_training'
  | 'school_visit_hearing_screen'
  | 'school_visit_other'
  | 'indirect_phone_video'
  | 'indirect_monthly_meeting'
  | 'indirect_travel';

export type SupportTicketStatus = 'pending' | 'active' | 'completed' | 'cancelled';

export type SupportTicketPriority = 'low' | 'medium' | 'high' | 'urgent';

export const SUPPORT_TYPE_LABELS: Record<SupportType, string> = {
  school_visit_speech_screen: 'School visit: Speech Screen',
  school_visit_follow_up_training: 'School visit: Follow up training',
  school_visit_hearing_screen: 'School visit: Hearing Screen',
  school_visit_other: 'School visit: Other',
  indirect_phone_video: 'Indirect: Phone/Video',
  indirect_monthly_meeting: 'Indirect: Monthly Meeting',
  indirect_travel: 'Indirect: Travel',
};

export const SUPPORT_STATUS_LABELS: Record<SupportTicketStatus, string> = {
  pending: 'Pending',
  active: 'Active',
  completed: 'Completed',
  cancelled: 'Cancelled',
};

export const SUPPORT_PRIORITY_LABELS: Record<SupportTicketPriority, string> = {
  low: 'Low',
  medium: 'Medium',
  high: 'High',
  urgent: 'Urgent',
};

export interface MonthlyProgressCheck {
  id: string;
  student_id: string;
  check_date: string;
  notes: string;
  attendance: 'present' | 'absent';
  absence_reason?: string;
  created_at: string;
  updated_at: string;
}

export interface GoalSheet {
  id: string;
  student_id: string;
  title: string;
  goals: Goal[];
  created_at: string;
  updated_at: string;
  status: 'draft' | 'active' | 'completed';
}

export interface Goal {
  id: string;
  category: GoalCategory;
  description: string;
  target_date: string;
  milestones: string[];
  progress: number; // 0-100
  notes: string;
}

export type GoalCategory = 'speech' | 'language' | 'hearing' | 'social' | 'academic' | 'behavioral';

export const GOAL_CATEGORY_LABELS: Record<GoalCategory, string> = {
  speech: 'Speech',
  language: 'Language',
  hearing: 'Hearing',
  social: 'Social Skills',
  academic: 'Academic',
  behavioral: 'Behavioral',
};
