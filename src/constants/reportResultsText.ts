export interface ReportResultsCopy {
  resultsText: string
  footerNote?: string
}

// Keyed by the `template.name` value send-student-report.ts assigns based on
// the screening result. Add the remaining entries once we have their source PDFs:
// 'No Errors', 'Complex Needs', 'Non Compliant', 'Absent',
// 'Mild Profound Qualified Sub', 'Mild Profound No Qualified Sub'
export const REPORT_RESULTS_TEXT: Record<string, ReportResultsCopy> = {
  'Passed Age Appropriate': {
    resultsText: 'Your child demonstrated age-appropriate speech skills!',
    footerNote:
      "All sound errors detected in the screen are age-appropriate. We will re-screen next year and continue to monitor your child's speech development.",
  },
}
