import StudentSpeechReportView from './StudentSpeechReportView'
import HearingScreenReportView from './HearingScreenReportView'
import SpeechGoalSheetView from './SpeechGoalSheetView'
import SpeechProgressReportView from './SpeechProgressReportView'
import SchoolSpeechSummaryView from './SchoolSpeechSummaryView'
import SchoolHearingSummaryView from './SchoolHearingSummaryView'
import ProgramCaseloadView from './ProgramCaseloadView'
import GenericReportView from './GenericReportView'

interface BulkDocument {
  metadata?: { file_name?: string; directory?: string }
  template?: { name?: string; version?: number }
  context: Record<string, unknown>
}

const BulkDocumentView = ({ data }: { data: BulkDocument }) => {
  const templateName = data.template?.name ?? ''

  if (templateName.startsWith('hearing-screen/')) {
    return <HearingScreenReportView data={data as never} />
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
      return <StudentSpeechReportView data={data as never} />

    case 'Goal Sheet Primary Secondary':
    case 'Goal Sheet Primary Only v2':
      return <SpeechGoalSheetView data={data as never} />

    case 'Student Progress Report':
      return <SpeechProgressReportView data={data as never} />

    case 'Schools Summary Report With Referrals':
    case 'Schools Summary Report No Referrals':
      return <SchoolSpeechSummaryView data={data as never} />

    case 'School Summary Hearing Report':
      return <SchoolHearingSummaryView data={data as never} />

    case 'Program Caseload':
      return <ProgramCaseloadView data={data as never} />

    default:
      return <GenericReportView reportType={templateName || 'Unknown template'} data={data} />
  }
}

export default BulkDocumentView
