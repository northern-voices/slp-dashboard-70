const SIGNS_LIST = [
  'Trouble understanding or following instructions',
  'Unclear speech',
  'Not responding to name or environmental sounds',
  'Frequent requests for repetition (e.g., saying, "What?" or "Huh?")',
  'Complaints of ear pain, ringing, or noises in the ear(s)',
  'Turning up the volume on the TV or music devices',
  'Speaking loudly or watching lips closely when listening to others',
  'Challenges with reading or academic progress',
]

interface HearingReportData {
  context: {
    student_name: string
    date_of_screening: string
    grade: string
  }
}
