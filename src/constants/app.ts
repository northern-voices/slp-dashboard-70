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

export const GRADE_MAPPING = [
  { display: 'Headstart', value: 'Headstart' },
  { display: 'Nursery', value: 'Nursery' },
  { display: 'Pre-K', value: 'Pre-K' },
  { display: 'K4', value: 'K4' },
  { display: 'K5', value: 'K5' },
  { display: 'Kindergarten', value: 'Kindergarten' },
  { display: 'K/1', value: 'K/1' },
  { display: '1', value: '1' },
  { display: '1/2', value: '1/2' },
  { display: '2', value: '2' },
  { display: '2/3', value: '2/3' },
  { display: '3', value: '3' },
  { display: '3/4', value: '3/4' },
  { display: '4', value: '4' },
  { display: '4/5', value: '4/5' },
  { display: '5', value: '5' },
  { display: '5/6', value: '5/6' },
  { display: '6', value: '6' },
  { display: '6/7', value: '6/7' },
  { display: '7', value: '7' },
  { display: '7/8', value: '7/8' },
  { display: '8', value: '8' },
  { display: '8/9', value: '8/9' },
  { display: '9', value: '9' },
  { display: '9/10', value: '9/10' },
  { display: '10', value: '10' },
  { display: '10/11', value: '10/11' },
  { display: '11', value: '11' },
  { display: '11/12', value: '11/12' },
  { display: '12', value: '12' },
] as const
