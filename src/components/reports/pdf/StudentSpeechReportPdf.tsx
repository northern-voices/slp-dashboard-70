import GenericSpeechScreeningReportPdf from './GenericSpeechScreeningReportPdf'
import NoErrorsSpeechReportPdf from './NoErrorsSpeechReportPdf'

interface StudentSpeechReportData {
  template?: { name?: string }
  context: {
    student_name: string
    date_of_screening: string
    grade: string
    errors: Array<{ sound: string; pattern: string; example: string; targetSound: string }>
    result?: string
  }
}

const StudentSpeechReportPdf = ({ data }: { data: StudentSpeechReportData }) => {
  switch (data.template?.name) {
    case 'No Errors':
      return <NoErrorsSpeechReportPdf data={data as never} />
    default:
      return <GenericSpeechScreeningReportPdf data={data as never} />
  }
}

export default StudentSpeechReportPdf
