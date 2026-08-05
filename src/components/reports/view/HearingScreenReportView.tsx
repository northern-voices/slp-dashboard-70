import AbsentHearingReportView from './AbsentHearingReportView'
import NonCompliantHearingReportView from './NonCompliantHearingReportView'
import ComplexNeedsHearingReportView from './ComplexNeedsHearingReportView'

interface HearingReportData {
  template?: { name?: string }
  context: {
    student_name: string
    date_of_screening: string
    grade: string
    code?: string
    right_ear_volume_ml?: string
    right_ear_compliance_ml?: string
    right_ear_press_dapa?: string
    right_ear_volume_result?: string
    right_ear_compliance_result?: string
    right_ear_press_result?: string
    left_ear_volume_ml?: string
    left_ear_compliance_ml?: string
    left_ear_press_dapa?: string
    left_ear_volume_result?: string
    left_ear_compliance_result?: string
    left_ear_press_result?: string
    right_ear_result?: string
    left_ear_result?: string
    referral_notes?: string
    note?: string
  }
}

// Placeholder until Pass, Pass - Staff, Fail, and Fail - Staff are built
const NotYetAvailableView = () => (
  <div className='bg-white rounded-lg shadow p-8'>
    This hearing report template isn't built yet.
  </div>
)

const HearingScreenReportView = ({ data }: { data: HearingReportData }) => {
  switch (data.template?.name) {
    case 'hearing-screen/(A) Absent':
      return <AbsentHearingReportView data={data as never} />
    case 'hearing-screen/(NC) Non-compliant':
      return <NonCompliantHearingReportView data={data as never} />
    case 'hearing-screen/(CN) Complex Needs':
      return <ComplexNeedsHearingReportView data={data as never} />
    default:
      return <NotYetAvailableView />
  }
}

export default HearingScreenReportView
