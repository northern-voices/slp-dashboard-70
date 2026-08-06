import AbsentHearingReportView from './AbsentHearingReportView'
import NonCompliantHearingReportView from './NonCompliantHearingReportView'
import ComplexNeedsHearingReportView from './ComplexNeedsHearingReportView'
import PassHearingReportView from './PassHearingReportView'
import PassStaffHearingReportView from './PassStaffHearingReportView'
import FailHearingReportView from './FailHearingReportView'
import FailStaffHearingReportView from './FailStaffHearingReportView'

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

const HearingScreenReportView = ({ data }: { data: HearingReportData }) => {
  switch (data.template?.name) {
    case 'hearing-screen/(A) Absent':
      return <AbsentHearingReportView data={data as never} />
    case 'hearing-screen/(NC) Non-compliant':
      return <NonCompliantHearingReportView data={data as never} />
    case 'hearing-screen/(CN) Complex Needs':
      return <ComplexNeedsHearingReportView data={data as never} />
    case 'hearing-screen/(P) Pass':
      return <PassHearingReportView data={data as never} />
    case 'hearing-screen/(P) Pass - Staff':
      return <PassStaffHearingReportView data={data as never} />
    case 'hearing-screen/(F) Fail':
      return <FailHearingReportView data={data as never} />
    case 'hearing-screen/(F) Fail - Staff':
      return <FailStaffHearingReportView data={data as never} />
    default:
      return (
        <div className='bg-white rounded-lg shadow p-8'>
          This hearing report template isn't built yet.
        </div>
      )
  }
}

export default HearingScreenReportView
