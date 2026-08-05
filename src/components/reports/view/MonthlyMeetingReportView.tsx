import ProgressCheckinMeetingView from './ProgressCheckinMeetingView'
import CoachingCallSchoolSummaryView from './CoachingCallSchoolSummaryView'

interface MonthlyMeetingReportData {
  template?: { name?: string }
  context: Record<string, unknown>
}

const MonthlyMeetingReportView = ({ data }: { data: MonthlyMeetingReportData }) => {
  switch (data.template?.name) {
    case 'Coaching Call School Summary':
      return <CoachingCallSchoolSummaryView data={data as never} />
    default:
      return <ProgressCheckinMeetingView data={data as never} />
  }
}

export default MonthlyMeetingReportView
