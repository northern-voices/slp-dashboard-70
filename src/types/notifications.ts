
export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  timestamp: string;
  isRead: boolean;
  priority: NotificationPriority;
  actionUrl?: string;
  metadata?: {
    studentName?: string;
    schoolName?: string;
    ticketId?: string;
    screeningType?: string;
  };
}

export type NotificationType = 
  | 'school_support'
  | 'screening_alert'
  | 'student_update'
  | 'system_reminder'
  | 'urgent';

export type NotificationPriority = 'low' | 'medium' | 'high' | 'urgent';

export const NOTIFICATION_TYPE_CONFIG = {
  school_support: {
    label: 'School Support',
    icon: 'HandHeart',
    color: 'text-blue-600',
    bgColor: 'bg-blue-50'
  },
  screening_alert: {
    label: 'Screening Alert',
    icon: 'AlertTriangle',
    color: 'text-orange-600',
    bgColor: 'bg-orange-50'
  },
  student_update: {
    label: 'Student Update',
    icon: 'User',
    color: 'text-green-600',
    bgColor: 'bg-green-50'
  },
  system_reminder: {
    label: 'Reminder',
    icon: 'Clock',
    color: 'text-purple-600',
    bgColor: 'bg-purple-50'
  },
  urgent: {
    label: 'Urgent',
    icon: 'AlertCircle',
    color: 'text-red-600',
    bgColor: 'bg-red-50'
  }
};
