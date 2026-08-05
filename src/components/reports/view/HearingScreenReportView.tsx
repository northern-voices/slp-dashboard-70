import { Document, Page, Text } from '@react-pdf/renderer'
import AbsentHearingReportPdf from './AbsentHearingReportPdf'
import NonCompliantHearingReportPdf from './NonCompliantHearingReportPdf'
import ComplexNeedsHearingReportPdf from './ComplexNeedsHearingReportPdf'

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
const NotYetAvailablePdf = () => (
  <Document>
    <Page size='LETTER' style={{ padding: 48, fontSize: 12 }}>
      <Text>This hearing report template isn't built yet.</Text>
    </Page>
  </Document>
)

const HearingScreenReportPdf = ({ data }: { data: HearingReportData }) => {
  switch (data.template?.name) {
    case 'hearing-screen/(A) Absent':
      return <AbsentHearingReportPdf data={data as never} />
    case 'hearing-screen/(NC) Non-compliant':
      return <NonCompliantHearingReportPdf data={data as never} />
    case 'hearing-screen/(CN) Complex Needs':
      return <ComplexNeedsHearingReportPdf data={data as never} />
    default:
      return <NotYetAvailablePdf />
  }
}

export default HearingScreenReportPdf
