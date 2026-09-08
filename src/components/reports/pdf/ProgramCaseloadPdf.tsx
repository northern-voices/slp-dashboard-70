import { Document, Page, View, Text, StyleSheet } from '@react-pdf/renderer'
import { ReportBanner, ReportFooter } from './shared/reportBannerChrome'
import { SCREENING_RESULTS, ScreeningResultType } from '@/constants/screeningResults'
import { ServiceStatus } from '@/types/database'

interface CaseloadStudent {
  name: string
  grade: string
  result: string
  consent: string
  speech_ea: string
  service_status?: ServiceStatus
}

interface ProgramCaseloadData {
  context: {
    school: string
    student_count: number
    academic_year: string
    qualified: boolean
    sub: boolean
    graduated: boolean
    qualified_students: CaseloadStudent[]
    sub_students: CaseloadStudent[]
    graduated_students: CaseloadStudent[]
  }
}

interface TableBlock {
  heading: string
  variant: 'qualified' | 'sub' | 'graduated'
  columns: string[]
  rows: CaseloadStudent[]
}

interface PageSegment {
  heading: string
  variant: 'qualified' | 'sub' | 'graduated'
  columns: string[]
  rows: CaseloadStudent[]
}

const ROWS_FIRST_PAGE = 26
const ROWS_PER_PAGE = 32
const HEADING_ROWS = 2

const paginateBlocks = (blocks: TableBlock[], firstPageBudget: number): PageSegment[][] => {
  const pages: PageSegment[][] = []
  let currentPage: PageSegment[] = []
  let remaining = firstPageBudget

  for (const block of blocks) {
    let rows = block.rows
    let isFirstSegment = true

    while (rows.length > 0) {
      const availableForRows = remaining - HEADING_ROWS

      if (availableForRows <= 0) {
        pages.push(currentPage)
        currentPage = []
        remaining = ROWS_PER_PAGE
        continue
      }

      const rowsForThisSegment = rows.slice(0, availableForRows)
      currentPage.push({
        heading: isFirstSegment ? block.heading : `${block.heading} (cont.)`,
        variant: block.variant,
        columns: block.columns,
        rows: rowsForThisSegment,
      })
      remaining -= HEADING_ROWS + rowsForThisSegment.length
      rows = rows.slice(rowsForThisSegment.length)
      isFirstSegment = false

      if (rows.length > 0) {
        pages.push(currentPage)
        currentPage = []
        remaining = ROWS_PER_PAGE
      }
    }
  }

  if (currentPage.length > 0) pages.push(currentPage)
  return pages
}

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

const COLUMN_FLEX = [1.5, 0.6, 1.1, 0.8, 1.2]

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
  blockHeading: { fontFamily: 'Gotu', fontSize: 15, textAlign: 'center', marginBottom: 8 },
  blockHeadingQualified: { color: '#5b7a8b' },
  blockHeadingSub: { color: '#8a6d4f' },
  blockHeadingGraduated: { color: '#3f6d8a' },

  table: { marginBottom: 14 },
  tableRow: { flexDirection: 'row' },
  tableHeaderCell: {
    borderWidth: 0.75,
    borderColor: '#000000',
    padding: 6,
    fontSize: 8,
    fontFamily: 'Montserrat',
    fontWeight: 700,
    textAlign: 'center',
  },
  tableHeaderCellQualified: { backgroundColor: '#5b7a8b', color: '#ffffff' },
  tableHeaderCellSub: { backgroundColor: '#e9e2d9', color: '#4d4b4b' },
  tableHeaderCellGraduated: { backgroundColor: '#7fa5bf', color: '#ffffff' },

  tableCell: {
    borderWidth: 0.75,
    borderColor: '#000000',
    padding: 5,
    minHeight: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tableCellName: { alignItems: 'flex-start' },
  tableCellText: { fontSize: 8.5, color: '#4d4b4b', textAlign: 'center' },
  tableCellTextLeft: { fontSize: 8.5, color: '#4d4b4b', textAlign: 'left' },
  noDataText: { fontSize: 7.5, color: '#9ca3af', fontStyle: 'italic' },

  pill: { borderRadius: 8, paddingVertical: 2, paddingHorizontal: 6, marginTop: 2 },
  pillText: { fontSize: 7.5, fontWeight: 700 },

  pausedPill: { backgroundColor: '#f3e8ff' },
  pausedPillText: { color: '#6b21a8' },

  consentYesPill: { backgroundColor: '#dcfce7' },
  consentYesText: { color: '#166534' },
  consentNoPill: { backgroundColor: '#fee2e2' },
  consentNoText: { color: '#b91c1c' },
})

const NameCell = ({ student }: { student: CaseloadStudent }) => (
  <View style={[styles.tableCell, styles.tableCellName, { flex: COLUMN_FLEX[0] }]}>
    <Text style={styles.tableCellTextLeft}>{student.name}</Text>
    {student.service_status === 'paused' && (
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
      <View style={[styles.tableCell, { flex: COLUMN_FLEX[2] }]}>
        <Text style={styles.noDataText}>No Screening Recorded</Text>
      </View>
    )
  }

  return (
    <View style={[styles.tableCell, { flex: COLUMN_FLEX[2] }]}>
      <View style={[styles.pill, { backgroundColor: colors.bg, marginTop: 0 }]}>
        <Text style={[styles.pillText, { color: colors.text }]}>
          {RESULT_LABEL_OVERRIDES[key] ?? config.label}
        </Text>
      </View>
    </View>
  )
}

const ConsentCell = ({ consent }: { consent: string }) => {
  const isYes = consent === 'Yes'
  return (
    <View style={[styles.tableCell, { flex: COLUMN_FLEX[3] }]}>
      <View
        style={[
          styles.pill,
          isYes ? styles.consentYesPill : styles.consentNoPill,
          { marginTop: 0 },
        ]}>
        <Text style={[styles.pillText, isYes ? styles.consentYesText : styles.consentNoText]}>
          {consent}
        </Text>
      </View>
    </View>
  )
}

const SpeechEaCell = ({ speechEa }: { speechEa: string }) => (
  <View style={[styles.tableCell, { flex: COLUMN_FLEX[4] }]}>
    {speechEa === '-' ? (
      <Text style={styles.noDataText}>No Speech EA assigned</Text>
    ) : (
      <Text style={styles.tableCellText}>{speechEa}</Text>
    )}
  </View>
)

const HEADING_VARIANT_STYLE = {
  qualified: styles.blockHeadingQualified,
  sub: styles.blockHeadingSub,
  graduated: styles.blockHeadingGraduated,
}

const HEADER_CELL_VARIANT_STYLE = {
  qualified: styles.tableHeaderCellQualified,
  sub: styles.tableHeaderCellSub,
  graduated: styles.tableHeaderCellGraduated,
}

const SegmentTable = ({ segment }: { segment: PageSegment }) => {
  const headingStyle = [styles.blockHeading, HEADING_VARIANT_STYLE[segment.variant]]
  const headerCellStyle = [styles.tableHeaderCell, HEADER_CELL_VARIANT_STYLE[segment.variant]]

  return (
    <>
      {segment.heading && <Text style={headingStyle}>{segment.heading}</Text>}
      <View style={styles.table}>
        <View style={styles.tableRow} wrap={false}>
          {segment.columns.map((col, idx) => (
            <Text key={col} style={[...headerCellStyle, { flex: COLUMN_FLEX[idx] }]}>
              {col}
            </Text>
          ))}
        </View>
        {segment.rows.map((student, i) => (
          <View style={styles.tableRow} key={i} wrap={false}>
            <NameCell student={student} />
            <View style={[styles.tableCell, { flex: COLUMN_FLEX[1] }]}>
              <Text style={styles.tableCellText}>{student.grade}</Text>
            </View>
            <ResultCell result={student.result} />
            <ConsentCell consent={student.consent} />
            <SpeechEaCell speechEa={student.speech_ea} />
          </View>
        ))}
      </View>
    </>
  )
}

const ProgramCaseloadPdf = ({ data }: { data: ProgramCaseloadData }) => {
  const { context } = data

  const blocks: TableBlock[] = []
  if (context.qualified && context.qualified_students?.length > 0) {
    blocks.push({
      heading: 'Qualified - Primary Caseload',
      variant: 'qualified',
      columns: ['STUDENT NAME', 'GRADE', 'RESULT', 'CONSENT', 'SPEECH EA'],
      rows: context.qualified_students,
    })
  }

  if (context.sub && context.sub_students?.length > 0) {
    blocks.push({
      heading: 'Subs',
      variant: 'sub',
      columns: ['STUDENT NAME', 'GRADE', 'RESULT', 'CONSENT', 'SPEECH EA'],
      rows: context.sub_students,
    })
  }

  if (context.graduated && context.graduated_students?.length > 0) {
    blocks.push({
      heading: 'Graduated',
      variant: 'graduated',
      columns: ['STUDENT NAME', 'GRADE', 'RESULT', 'CONSENT', 'SPEECH EA'],
      rows: context.graduated_students,
    })
  }

  const pages = paginateBlocks(blocks, ROWS_FIRST_PAGE)

  return (
    <Document>
      {pages.length === 0 ? (
        <Page size='LETTER' style={styles.page}>
          <ReportBanner title='Program Caseload' />
          <View style={styles.body}>
            <View style={styles.infoRow}>
              <Text>
                <Text style={styles.infoLabel}>School: </Text>
                {context.school}
              </Text>
              <Text>
                <Text style={styles.infoLabel}>Student Count: </Text>
                {context.student_count}
              </Text>
            </View>
            <Text style={styles.sectionText}>No qualified or sub students this year.</Text>
          </View>
          <ReportFooter page={1} of={1} brand='NORTHERN VOICES SPEECH SERVICES' />
        </Page>
      ) : (
        pages.map((segments, i) => {
          const isLastPage = i === pages.length - 1
          return (
            <Page key={i} size='LETTER' style={styles.page}>
              <ReportBanner title='Program Caseload' />
              <View style={styles.body}>
                {i === 0 && (
                  <>
                    <View style={styles.infoRow}>
                      <Text>
                        <Text style={styles.infoLabel}>School: </Text>
                        {context.school}
                      </Text>
                      <Text>
                        <Text style={styles.infoLabel}>Student Count: </Text>
                        {context.student_count}
                      </Text>
                    </View>
                  </>
                )}
                {segments.map((segment, j) => (
                  <SegmentTable key={j} segment={segment} />
                ))}
              </View>
              {isLastPage && (
                <ReportFooter
                  page={i + 1}
                  of={pages.length}
                  brand='NORTHERN VOICES SPEECH SERVICES'
                />
              )}
            </Page>
          )
        })
      )}
    </Document>
  )
}

export default ProgramCaseloadPdf
