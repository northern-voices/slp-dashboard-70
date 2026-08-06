import { Document, Page, Text } from '@react-pdf/renderer'
import StudentSpeechReportPdf from './StudentSpeechReportPdf'
import HearingScreenReportPdf from './HearingScreenReportPdf'
import SpeechGoalSheetPdf from './SpeechGoalSheetPdf'
import SpeechProgressReportPdf from './SpeechProgressReportPdf'
import SchoolSpeechSummaryPdf from './SchoolSpeechSummaryPdf'
import SchoolHearingSummaryPdf from './SchoolHearingSummaryPdf'
import ProgramCaseloadPdf from './ProgramCaseloadPdf'

interface BulkDocument {
  metadata?: { file_name?: string; directory?: string }
  template?: { name?: string; version?: number }
  context: Record<string, unknown>
}

// Placeholder for any template name the dispatcher doesn't recognize yet.
const UnknownTemplatePdf = ({ templateName }: { templateName: string }) => (
  <Document>
    <Page size='LETTER' style={{ padding: 48, fontSize: 12 }}>
      <Text>No PDF template built yet for: {templateName || 'Unknown template'}</Text>
    </Page>
  </Document>
)

const BulkDocumentPdf = ({ data }: { data: BulkDocument }) => {
  const templateName = data.template?.name ?? ''

  if (templateName.startsWith('hearing-screen/')) {
    return <HearingScreenReportPdf data={data as never} />
  }

  switch (templateName) {
    case 'No Errors':
    case 'Non Compliant':
    case 'Absent':
    case 'Mild Profound No Qualified Sub':
    case 'Mild Profound Qualified Sub':
    case 'Complex Needs':
    case 'Non Registered No Consent':
    case 'Passed Age Appropriate':
      return <StudentSpeechReportPdf data={data as never} />

    case 'Goal Sheet Primary Secondary':
    case 'Goal Sheet Primary Only v2':
      return <SpeechGoalSheetPdf data={data as never} />

    case 'Student Progress Report':
      return <SpeechProgressReportPdf data={data as never} />

    case 'Schools Summary Report With Referrals':
    case 'Schools Summary Report No Referrals':
      return <SchoolSpeechSummaryPdf data={data as never} />

    case 'School Summary Hearing Report':
      return <SchoolHearingSummaryPdf data={data as never} />

    case 'Program Caseload':
      return <ProgramCaseloadPdf data={data as never} />

    default:
      return <UnknownTemplatePdf templateName={templateName} />
  }
}

export default BulkDocumentPdf
