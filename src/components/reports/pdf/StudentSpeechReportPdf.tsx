import GenericSpeechScreeningReportPdf from './GenericSpeechScreeningReportPdf'
import NoErrorsSpeechReportPdf from './NoErrorsSpeechReportPdf'
import NonCompliantSpeechReportPdf from './NonCompliantSpeechReportPdf'
import AbsentSpeechReportPdf from './AbsentSpeechReportPdf'
import MildProfoundNoQualifiedSubReportPdf from './MildProfoundNoQualifiedSubReportPdf'
import MildProfoundQualifiedSubReportPdf from './MildProfoundQualifiedSubReportPdf'

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
    case 'Non Compliant':
      return <NonCompliantSpeechReportPdf data={data as never} />
    case 'Absent':
      return <AbsentSpeechReportPdf data={data as never} />
    case 'Mild Profound No Qualified Sub':
      return <MildProfoundNoQualifiedSubReportPdf data={data as never} />
    case 'Mild Profound Qualified Sub':
      return <MildProfoundQualifiedSubReportPdf data={data as never} />
    default:
      return <GenericSpeechScreeningReportPdf data={data as never} />
  }
}

export default StudentSpeechReportPdf
