import ProgressCheckinMeetingPdf from './ProgressCheckinMeetingPdf'
import CoachingCallSchoolSummaryPdf from './CoachingCallSchoolSummaryPdf'

interface MonthlyMeetingReportData {
  template?: { name?: string }
  context: Record<string, unknown>
}

const MonthlyMeetingReportPdf = ({ data }: { data: MonthlyMeetingReportData }) => {
  switch (data.template?.name) {
    case 'Coaching Call School Summary':
      return <CoachingCallSchoolSummaryPdf data={data as never} />
    default:
      return <ProgressCheckinMeetingPdf data={data as never} />
  }
}

export default MonthlyMeetingReportPdf
