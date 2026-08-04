interface StudentUpdate {
  student_name: string
  sessions_attended: number
  meeting_notes: string
  is_sub: boolean
}

interface MonthlyMeetingReportData {
  context: {
    meeting_title: string
    facilitator_name: string
    school: string
    meeting_date: string
    attendees: string[]
    has_student_updates: boolean
    student_updates: StudentUpdate[]
    has_additional_notes: boolean
    additional_notes: string
    has_action_plan: boolean
    action_plan: string
  }
}

// Unverified estimate - recalibrate against a real PDF render with a longer student roster,
// same way ROWS_FIRST_PAGE/ROWS_PER_CONTINUATION_PAGE were tuned for the progress report.
const ROWS_FIRST_PAGE = 12
const ROWS_PER_CONTINUATION_PAGE = 18

const chunkRows = (updates: StudentUpdate[]): StudentUpdate[][] => {
  if (updates.length === 0) return [[]]
  if (updates.length <= ROWS_FIRST_PAGE) return [updates]

  const chunks = [updates.slice(0, ROWS_FIRST_PAGE)]
  for (let i = ROWS_FIRST_PAGE; i < updates.length; i += ROWS_PER_CONTINUATION_PAGE) {
    chunks.push(updates.slice(i, i + ROWS_PER_CONTINUATION_PAGE))
  }
  return chunks
}
