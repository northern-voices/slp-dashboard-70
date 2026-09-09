import { Document, Page, View, Text, StyleSheet } from '@react-pdf/renderer'
import { ReportBanner, ReportFooter } from './shared/reportBannerChrome'
import { SCREENING_RESULTS, ScreeningResultType } from '@/constants/screeningResults'
import { ServiceStatus, ProgramStatus } from '@/types/database'

interface ScreeningReportRow {
  name: string
  grade: string
  result: string
  program_status: ProgramStatus
  service_status?: ServiceStatus
  date: string
  screener: string
}

interface ScreeningsTableData {
  context: {
    school: string
    screening_count: number
    academic_year: string
    screenings: ScreeningReportRow[]
  }
}

const COLUMNS = ['STUDENT NAME', 'RESULT', 'PROGRAM', 'GRADE', 'DATE', 'SCREENER']

const RESULT_PDF_COLORS: Record<ScreeningResultType, { bg: string; text: string }> = {
  no_errors: { bg: '#dcfce7', text: '#166534' },
  age_appropriate: { bg: '#dbeafe', text: '#1e40af' },
  monitor: { bg: '#fef9c3', text: '#854d0e' },
  mild: { bg: '#fef3c7', text: '#92400e' },
  moderate: { bg: '#ffedd5', text: '#9a3412' },
  severe: { bg: '#fee2e2', text: '#991b1b' },
  profound: { bg: '#fca5a5', text: '#991b1b' },
  complex_needs: { bg: '#d8b4fe', text: '#6b21a8' },
  unable_to_screen: { bg: '#f3e8ff', text: '#6b21a8' },
  absent: { bg: '#f3f4f6', text: '#1f2937' },
  non_registered_no_consent: { bg: '#f1f5f9', text: '#1e293b' },
}

const RESULT_LABEL_OVERRIDES: Partial<Record<ScreeningResultType, string>> = {
  complex_needs: 'Complex Needs',
  unable_to_screen: 'Refusal / Non-Compliant',
}

// Mirrors ProgramBadge's Tailwind colors (bg-red-100/text-red-800, etc.) as hex,
// since react-pdf can't consume Tailwind classes directly.
const PROGRAM_PDF_STYLE: Record<ProgramStatus, { bg: string; text: string; label: string }> = {
  qualified: { bg: '#fee2e2', text: '#991b1b', label: 'Qualifies' },
  sub: { bg: '#ffedd5', text: '#9a3412', label: 'Sub' },
  graduated: { bg: '#dbeafe', text: '#1e40af', label: 'Graduated' },
  no_consent: { bg: '#fee2e2', text: '#1f2937', label: 'No Consent' },
  not_in_program: { bg: '#dcfce7', text: '#166534', label: 'Not In Program' },
  none: { bg: '#dcfce7', text: '#166534', label: 'Not In Program' },
}

const COLUMN_FLEX = [1.4, 1.0, 0.9, 0.55, 0.9, 1.15]

const styles = StyleSheet.create({
  page: {
    paddingTop: 0,
    paddingBottom: 60,
    paddingLeft: 0,
    paddingRight: 0,
    fontSize: 10,
    fontFamily: 'Nunito',
    color: '#374151',
  },
  body: { paddingHorizontal: 48 },

  pageSubtitle: {
    fontFamily: 'Gotu',
    fontSize: 20,
    color: '#4b5563',
    textAlign: 'center',
    marginBottom: 16,
  },

  infoRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
  infoLabel: { fontFamily: 'Nunito', fontWeight: 700, color: '#111827' },

  sectionText: { fontSize: 10, color: '#374151', marginTop: 16 },

  table: { marginBottom: 14 },
  tableRow: { flexDirection: 'row' },
  tableHeaderCell: {
    borderWidth: 0.5,
    borderColor: '#000000',
    padding: 6,
    fontSize: 8,
    fontFamily: 'Montserrat',
    fontWeight: 700,
    textAlign: 'center',
    backgroundColor: '#5b7a8b',
    color: '#ffffff',
  },

  tableCell: {
    borderWidth: 0.5,
    borderColor: '#000000',
    padding: 5,
    minHeight: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tableCellName: { alignItems: 'flex-start' },
  tableCellText: { fontSize: 8.5, color: '#4d4b4b', textAlign: 'center' },
  tableCellTextLeft: { fontSize: 8.5, color: '#4d4b4b', textAlign: 'left' },
  noDataText: { fontSize: 7.5, color: '#9ca3af' },

  pill: { borderRadius: 8, paddingVertical: 2, paddingHorizontal: 6, marginTop: 2 },
  pillText: { fontSize: 7.5, fontWeight: 700, textAlign: 'center' },

  pausedPill: { backgroundColor: '#f3e8ff' },
  pausedPillText: { color: '#6b21a8' },
})

const NameCell = ({ screening }: { screening: ScreeningReportRow }) => (
  <View style={[styles.tableCell, styles.tableCellName, { flex: COLUMN_FLEX[0] }]}>
    <Text style={styles.tableCellTextLeft}>{screening.name}</Text>
    {screening.service_status === 'paused' && (
      <View style={[styles.pill, styles.pausedPill]}>
        <Text style={[styles.pillText, styles.pausedPillText]}>Paused / Away</Text>
      </View>
    )}
  </View>
)

const ResultCell = ({ result }: { result: string }) => {
  const key = result as ScreeningResultType
  const colors = RESULT_PDF_COLORS[key]
  const config = SCREENING_RESULTS[key]

  if (!colors || !config) {
    return (
      <View style={[styles.tableCell, { flex: COLUMN_FLEX[1] }]}>
        <Text style={styles.noDataText}>No Screening Recorded</Text>
      </View>
    )
  }

  return (
    <View style={[styles.tableCell, { flex: COLUMN_FLEX[1] }]}>
      <View style={[styles.pill, { backgroundColor: colors.bg, marginTop: 0 }]}>
        <Text style={[styles.pillText, { color: colors.text }]}>
          {RESULT_LABEL_OVERRIDES[key] ?? config.label}
        </Text>
      </View>
    </View>
  )
}

const ProgramCell = ({ status }: { status: ProgramStatus }) => {
  const style = PROGRAM_PDF_STYLE[status] ?? PROGRAM_PDF_STYLE.none
  return (
    <View style={[styles.tableCell, { flex: COLUMN_FLEX[2] }]}>
      <View style={[styles.pill, { backgroundColor: style.bg, marginTop: 0 }]}>
        <Text style={[styles.pillText, { color: style.text }]}>{style.label}</Text>
      </View>
    </View>
  )
}

const ScreeningsTablePdfTable = ({ screenings }: { screenings: ScreeningReportRow[] }) => (
  <View style={styles.table}>
    <View style={styles.tableRow} wrap={false}>
      {COLUMNS.map((col, idx) => (
        <Text key={col} style={[styles.tableHeaderCell, { flex: COLUMN_FLEX[idx] }]}>
          {col}
        </Text>
      ))}
    </View>
    {screenings.map((screening, i) => (
      <View style={styles.tableRow} key={i} wrap={false}>
        <NameCell screening={screening} />
        <ResultCell result={screening.result} />
        <ProgramCell status={screening.program_status} />
        <View style={[styles.tableCell, { flex: COLUMN_FLEX[3] }]}>
          <Text style={styles.tableCellText}>{screening.grade}</Text>
        </View>
        <View style={[styles.tableCell, { flex: COLUMN_FLEX[4] }]}>
          <Text style={styles.tableCellText}>{screening.date}</Text>
        </View>
        <View style={[styles.tableCell, { flex: COLUMN_FLEX[5] }]}>
          <Text style={styles.tableCellText}>{screening.screener}</Text>
        </View>
      </View>
    ))}
  </View>
)

const ScreeningsTablePdf = ({ data }: { data: ScreeningsTableData }) => {
  const { context } = data
  const screenings = context.screenings

  return (
    <Document>
      <Page size='LETTER' style={styles.page}>
        <ReportBanner title='Speech Screenings' />
        <View style={styles.body}>
          <Text style={styles.pageSubtitle}>Screenings</Text>
          <View style={styles.infoRow}>
            <Text>
              <Text style={styles.infoLabel}>School: </Text>
              {context.school}
            </Text>
            <Text>
              <Text style={styles.infoLabel}>Screening Count: </Text>
              {context.screening_count}
            </Text>
          </View>
          {screenings.length === 0 ? (
            <Text style={styles.sectionText}>No speech screenings match the selected filters.</Text>
          ) : (
            <ScreeningsTablePdfTable screenings={screenings} />
          )}
        </View>
        <ReportFooter brand='NORTHERN VOICES SPEECH SERVICES' />
      </Page>
    </Document>
  )
}

export default ScreeningsTablePdf
