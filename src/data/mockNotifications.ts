
import { Notification } from '@/types/notifications';

export const mockNotifications: Notification[] = [
  {
    id: '1',
    type: 'urgent',
    title: 'Urgent School Support Ticket',
    message: 'New urgent ticket assigned for Emma Johnson at Lincoln Elementary - Speech screening required',
    timestamp: '2024-06-03T09:15:00Z',
    isRead: false,
    priority: 'urgent',
    actionUrl: '/school-support',
    metadata: {
      studentName: 'Emma Johnson',
      schoolName: 'Lincoln Elementary',
      ticketId: '1'
    }
  },
  {
    id: '2',
    type: 'screening_alert',
    title: 'Overdue Screening Review',
    message: 'Speech screening for Marcus Rodriguez requires review - 2 days overdue',
    timestamp: '2024-06-02T14:30:00Z',
    isRead: false,
    priority: 'high',
    actionUrl: '/students',
    metadata: {
      studentName: 'Marcus Rodriguez',
      screeningType: 'Speech'
    }
  },
  {
    id: '3',
    type: 'system_reminder',
    title: 'Upcoming School Visit',
    message: 'Hearing screening scheduled for tomorrow at Washington Middle School',
    timestamp: '2024-06-02T16:45:00Z',
    isRead: false,
    priority: 'medium',
    actionUrl: '/school-support',
    metadata: {
      schoolName: 'Washington Middle School',
      screeningType: 'Hearing'
    }
  },
  {
    id: '4',
    type: 'student_update',
    title: 'New Student Referral',
    message: 'Aisha Patel has been referred for speech evaluation at Roosevelt High School',
    timestamp: '2024-06-02T11:20:00Z',
    isRead: true,
    priority: 'medium',
    actionUrl: '/students',
    metadata: {
      studentName: 'Aisha Patel',
      schoolName: 'Roosevelt High School'
    }
  },
  {
    id: '5',
    type: 'screening_alert',
    title: 'Completed Screenings Ready',
    message: '3 completed screenings are ready for your review and approval',
    timestamp: '2024-06-02T08:00:00Z',
    isRead: true,
    priority: 'medium',
    actionUrl: '/students'
  },
  {
    id: '6',
    type: 'system_reminder',
    title: 'Monthly IEP Meeting',
    message: 'IEP meeting reminder for Sophie Chen scheduled on June 15th at 2:00 PM',
    timestamp: '2024-06-01T17:30:00Z',
    isRead: true,
    priority: 'low',
    metadata: {
      studentName: 'Sophie Chen'
    }
  },
  {
    id: '7',
    type: 'school_support',
    title: 'Support Ticket Completed',
    message: 'Assistive technology evaluation for Jacob Thompson has been completed',
    timestamp: '2024-06-01T15:45:00Z',
    isRead: true,
    priority: 'low',
    actionUrl: '/school-support',
    metadata: {
      studentName: 'Jacob Thompson',
      ticketId: '4'
    }
  },
  {
    id: '8',
    type: 'system_reminder',
    title: 'Weekly Report Due',
    message: 'Your weekly activity report is due by end of day Friday',
    timestamp: '2024-06-01T09:00:00Z',
    isRead: true,
    priority: 'low',
    actionUrl: '/reports'
  }
];
