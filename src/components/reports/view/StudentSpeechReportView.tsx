import GenericSpeechScreeningReportView from './GenericSpeechScreeningReportView'
import NoErrorsSpeechReportView from './NoErrorsSpeechReportView'

interface StudentSpeechReportData {
  metadata?: { file_name?: string }
  template?: { name?: string }
  context: {
    student_name: string
    date_of_screening: string
    grade: string
    errors: Array<{
      sound: string
      pattern: string
      example: string
      targetSound: string
      week?: number
    }>
    code?: string
    result?: string
  }
}

const StudentSpeechReportView = ({ data }: { data: StudentSpeechReportData }) => {
  switch (data.template?.name) {
    case 'No Errors':
      return <NoErrorsSpeechReportView data={data as never} />
    default:
      return <GenericSpeechScreeningReportView data={data as never} />
  }
}

export default StudentSpeechReportView
