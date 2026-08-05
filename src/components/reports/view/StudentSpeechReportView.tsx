import GenericSpeechScreeningReportView from './GenericSpeechScreeningReportView'
import NoErrorsSpeechReportView from './NoErrorsSpeechReportView'
import NonCompliantSpeechReportView from './NonCompliantSpeechReportView'
import AbsentSpeechReportView from './AbsentSpeechReportView'
import MildProfoundNoQualifiedSubReportView from './MildProfoundNoQualifiedSubReportView'
import MildProfoundQualifiedSubReportView from './MildProfoundQualifiedSubReportView'
import PosterOnlySpeechReportView from './PosterOnlySpeechReportView'

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
    case 'Non Compliant':
      return <NonCompliantSpeechReportView data={data as never} />
    case 'Absent':
      return <AbsentSpeechReportView data={data as never} />
    case 'Mild Profound No Qualified Sub':
      return <MildProfoundNoQualifiedSubReportView data={data as never} />
    case 'Mild Profound Qualified Sub':
      return <MildProfoundQualifiedSubReportView data={data as never} />
    case 'Complex Needs':
    case 'Non Registered No Consent':
      return <PosterOnlySpeechReportView />
    default:
      return <GenericSpeechScreeningReportView data={data as never} />
  }
}

export default StudentSpeechReportView
