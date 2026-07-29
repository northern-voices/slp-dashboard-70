interface ProcessedError {
  sound: string
  pattern: string
  example: string
  targetSound: string
  week?: number
}

interface StudentSpeechReportData {
  metadata?: { file_name?: string }
  template?: { name?: string }
  context: {
    student_name: string
    date_of_screening: string
    grade: string
    errors: ProcessedError[]
    code?: string
  }
}
