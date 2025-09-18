export const APP_NAME = 'Speech Screening System'
export const APP_VERSION = '1.0.0'

export const ROUTES = {
  HOME: '/',
  STUDENTS: '/students',
  STUDENT_DETAIL: '/students/:studentId',
  REPORTS: '/speech-screening-reports',
  MANAGEMENT: '/management',
} as const

export const USER_ROLES = {
  SLP: 'slp',
  ADMIN: 'admin',
  SUPERVISOR: 'supervisor',
} as const

export const SCREENING_TYPES = {
  INITIAL: 'initial',
  PROGRESS: 'progress',
} as const

export const SCREENING_STATUS = {
  SCHEDULED: 'scheduled',
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
} as const

export const REPORT_STATUS = {
  DRAFT: 'draft',
  FINAL: 'final',
  REVIEWED: 'reviewed',
} as const

export const FORM_TYPES = {
  SPEECH: 'speech',
  HEARING: 'hearing',
  PROGRESS: 'progress',
} as const

export const GENDERS = {
  MALE: 'male',
  FEMALE: 'female',
  OTHER: 'other',
  PREFER_NOT_TO_SAY: 'prefer_not_to_say',
} as const

export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 10,
  PAGE_SIZE_OPTIONS: [5, 10, 20, 50],
} as const

export const DATE_FORMATS = {
  DISPLAY: 'MMMM dd, yyyy',
  INPUT: 'yyyy-MM-dd',
  FULL: 'MMMM dd, yyyy hh:mm a',
} as const

export const VALIDATION_MESSAGES = {
  REQUIRED: 'This field is required',
  INVALID_EMAIL: 'Please enter a valid email address',
  INVALID_PHONE: 'Please enter a valid phone number',
  INVALID_DATE: 'Please enter a valid date',
  MIN_LENGTH: (min: number) => `Must be at least ${min} characters`,
  MAX_LENGTH: (max: number) => `Must be no more than ${max} characters`,
} as const
