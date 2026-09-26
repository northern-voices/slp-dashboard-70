import { Document, Page, View, Text, StyleSheet } from '@react-pdf/renderer'
import { ReportBanner, ReportFooter } from './shared/reportBannerChrome'
import { GRADE_MAPPING } from '@/constants/app'

interface SummaryStudent {
  name: string
  grade: string
}

interface ReferralStudent {
  name: string
  grade: string
  recommendations_and_referrals: string
}

const gradeOrderIndex = (grade: string): number => {
  const index = GRADE_MAPPING.findIndex(g => grade.includes(g.value))
  return index === -1 ? Infinity : index
}

const sortByGrade = <T extends { grade: string }>(students: T[]): T[] =>
  [...students].sort((a, b) => gradeOrderIndex(a.grade) - gradeOrderIndex(b.grade))

interface SchoolSpeechSummaryData {
  context: {
    screening_date: string
    slp: string
    qualified: boolean
    qualified_students: SummaryStudent[]
    sub: boolean
    sub_students: SummaryStudent[]
    priority_rescreen: boolean
    students_priority_rescreen: SummaryStudent[]
    students_recommendations_and_referrals: ReferralStudent[]
    returning_absent: boolean
    returning_absent_students: SummaryStudent[]
  }
}

type SegmentColorKey = 'qualified' | 'sub' | 'priority_rescreen' | 'referral' | 'returning_absent'

interface TableBlock {
  heading: string
  columns: string[]
  rows: string[][]
  colorKey?: SegmentColorKey
  intro?: string
}

interface PageSegment {
  heading: string
  columns: string[]
  rows: string[][]
  colorKey?: SegmentColorKey
  intro?: string
}

// Mirrors PROGRAM_PDF_STYLE in ProgramCaseloadPdf.tsx (Qualified/Sub) and the Returning Absent
// badge's yellow, so each category reads the same way across every report.
const SEGMENT_HEADING_COLORS: Record<SegmentColorKey, { bg: string; text: string }> = {
  qualified: { bg: '#fee2e2', text: '#991b1b' },
  sub: { bg: '#ffedd5', text: '#9a3412' },
  priority_rescreen: { bg: '#ccfbf1', text: '#115e59' },
  referral: { bg: '#f3e8ff', text: '#6b21a8' },
  returning_absent: { bg: '#fef9c3', text: '#854d0e' },
}

const ROWS_FIRST_PAGE = 26
const ROWS_PER_PAGE = 32
// Each segment's colored banner + rounded card border + bottom margin costs more than a plain
// table header row did in the old design - reserving only 2 here let the last table on a busy
// page (several segments stacked) actually overflow and get visually clipped.
const HEADING_ROWS = 3
const INTRO_ROWS = 6
// Never leave fewer than this many rows stranded alone on a continuation page - trim the
// earlier page back instead so a split table's "(cont.)" page always has a decent chunk.
const MIN_ORPHAN_ROWS = 4

// Paginates every table block as one continuous stream, so a new category (Sub, Priority
// Rescreens, etc.) starts right where the previous one left off on the same page instead of
// always forcing a fresh page per category.
const paginateBlocks = (blocks: TableBlock[], firstPageBudget: number): PageSegment[][] => {
  const pages: PageSegment[][] = []
  let currentPage: PageSegment[] = []
  let remaining = firstPageBudget

  for (const block of blocks) {
    let rows = block.rows
    let isFirstSegment = true

    while (rows.length > 0) {
      const introRows = isFirstSegment && block.intro ? INTRO_ROWS : 0
      let availableForRows = remaining - HEADING_ROWS - introRows

      if (availableForRows <= 0) {
        pages.push(currentPage)
        currentPage = []
        remaining = ROWS_PER_PAGE
        continue
      }

      if (rows.length > availableForRows) {
        const tailRows = rows.length - availableForRows
        if (tailRows < MIN_ORPHAN_ROWS) {
          availableForRows = Math.max(0, rows.length - MIN_ORPHAN_ROWS)
        }
      }

      if (availableForRows <= 0) {
        pages.push(currentPage)
        currentPage = []
        remaining = ROWS_PER_PAGE
        continue
      }

      const rowsForThisSegment = rows.slice(0, availableForRows)
      currentPage.push({
        heading: isFirstSegment ? block.heading : `${block.heading} (cont.)`,
        columns: block.columns,
        rows: rowsForThisSegment,
        colorKey: block.colorKey,
        intro: isFirstSegment ? block.intro : undefined,
      })
      remaining -= HEADING_ROWS + introRows + rowsForThisSegment.length
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

  infoRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
  infoLabel: { fontFamily: 'Nunito', fontWeight: 700, color: '#111827' },

  sectionLabel: { fontFamily: 'Nunito', fontWeight: 700, color: '#111827', marginBottom: 10 },
  paragraph: { fontSize: 10, color: '#374151', marginBottom: 14, lineHeight: 1.3 },

  blockHeading: { fontFamily: 'Gotu', fontSize: 15, color: '#1f2937', marginBottom: 8 },

  segmentHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 10,
    marginBottom: 8,
    borderRadius: 4,
  },
  segmentAccentBar: { width: 4, height: 11, borderRadius: 2, marginRight: 6 },
  segmentHeaderText: { fontFamily: 'Montserrat', fontWeight: 700, fontSize: 10, letterSpacing: 1 },

  table: { marginBottom: 14 },
  tableRow: { flexDirection: 'row' },
  tableHeaderCell: {
    borderWidth: 0.75,
    borderColor: '#000000',
    backgroundColor: '#5b7a8b',
    padding: 6,
    fontSize: 8,
    fontFamily: 'Montserrat',
    fontWeight: 700,
    textAlign: 'center',
    color: '#ffffff',
  },
  tableCell: {
    borderWidth: 0.75,
    borderColor: '#000000',
    padding: 5,
    fontSize: 8.5,
    textAlign: 'center',
    color: '#4d4b4b',
  },
  tableRowEven: { backgroundColor: '#f9fafb' },
})

const SegmentTable = ({ segment }: { segment: PageSegment }) => {
  const headingColors = segment.colorKey ? SEGMENT_HEADING_COLORS[segment.colorKey] : null

  return (
    <>
      {segment.intro && <Text style={styles.paragraph}>{segment.intro}</Text>}
      {segment.heading &&
        (headingColors ? (
          <View style={[styles.segmentHeaderRow, { backgroundColor: headingColors.bg }]}>
            <View style={[styles.segmentAccentBar, { backgroundColor: headingColors.text }]} />
            <Text style={[styles.segmentHeaderText, { color: headingColors.text }]}>
              {segment.heading.toUpperCase()}
            </Text>
          </View>
        ) : (
          <Text style={styles.blockHeading}>{segment.heading}</Text>
        ))}
      <View style={styles.table}>
        <View style={styles.tableRow} wrap={false}>
          {segment.columns.map(col => (
            <Text key={col} style={[styles.tableHeaderCell, { flex: 1 }]}>
              {col}
            </Text>
          ))}
        </View>
        {segment.rows.map((row, i) => (
          <View style={styles.tableRow} key={i} wrap={false}>
            {row.map((cell, j) => (
              <Text
                key={j}
                style={[styles.tableCell, i % 2 === 1 ? styles.tableRowEven : null, { flex: 1 }]}>
                {cell}
              </Text>
            ))}
          </View>
        ))}
      </View>
    </>
  )
}

const SchoolSpeechSummaryPdf = ({ data }: { data: SchoolSpeechSummaryData }) => {
  const { context } = data

  const blocks: TableBlock[] = []

  const hasQualified = context.qualified && (context.qualified_students?.length ?? 0) > 0
  const hasSub = context.sub && (context.sub_students?.length ?? 0) > 0

  if (hasQualified) {
    blocks.push({
      heading: 'Qualified - Primary Caseload',
      columns: ['STUDENT', 'GRADE'],
      rows: sortByGrade(context.qualified_students).map(s => [s.name, s.grade]),
      colorKey: 'qualified',
    })
  }
  if (hasSub) {
    blocks.push({
      heading: 'Subs',
      columns: ['STUDENT', 'GRADE'],
      rows: sortByGrade(context.sub_students).map(s => [s.name, s.grade]),
      colorKey: 'sub',
    })
  }

  if ((context.students_priority_rescreen?.length ?? 0) > 0) {
    blocks.push({
      heading: 'Priority Rescreens (Absent)',
      columns: ['STUDENT', 'GRADE'],
      rows: sortByGrade(context.students_priority_rescreen).map(s => [s.name, s.grade]),
      colorKey: 'priority_rescreen',
    })
  }

  if ((context.students_recommendations_and_referrals?.length ?? 0) > 0) {
    blocks.push({
      heading: 'Student Recommendations and Referrals',
      columns: ['STUDENT', 'GRADE', 'Notes'],
      rows: sortByGrade(context.students_recommendations_and_referrals).map(s => [
        s.name,
        s.grade,
        s.recommendations_and_referrals,
      ]),
      colorKey: 'referral',
      intro:
        'Our Speech Therapists have an opportunity to briefly observe students during ' +
        'class-wide speech screens. If the Speech Therapist noted any "red flags" or ' +
        '"developmental concerns" this does not necessarily mean anything is wrong! ' +
        'Recommendations listed below simply serve as proactive steps and suggestions to ' +
        'ensure student success. Please contact your Speech Therapist if you have any questions.',
    })
  }

  if ((context.returning_absent_students?.length ?? 0) > 0) {
    blocks.push({
      heading: 'Students on Caseload from Last Year (Requiring Screens)',
      columns: ['STUDENT', 'GRADE'],
      rows: sortByGrade(context.returning_absent_students).map(s => [s.name, s.grade]),
      colorKey: 'returning_absent',
    })
  }

  const pages = paginateBlocks(blocks, ROWS_FIRST_PAGE)
  const totalPages = pages.length

  return (
    <Document>
      {pages.map((segments, i) => {
        const isLastPage = i === totalPages - 1
        return (
          <Page key={i} size='LETTER' style={styles.page}>
            <ReportBanner title='School Summary Report' />
            <View style={styles.body}>
              {i === 0 && (
                <View style={styles.infoRow}>
                  <Text>
                    <Text style={styles.infoLabel}>Screening Date(s): </Text>
                    {context.screening_date}
                  </Text>
                  <Text>
                    <Text style={styles.infoLabel}>SLP: </Text>
                    {context.slp}
                  </Text>
                </View>
              )}
              {i === 0 && (hasQualified || hasSub) && (
                <Text style={styles.sectionLabel}>
                  STUDENTS ELIGIBLE TO PARTICIPATE IN SPEECH PROGRAM:
                </Text>
              )}
              {segments.map((segment, j) => (
                <SegmentTable key={j} segment={segment} />
              ))}
            </View>
            {isLastPage && (
              <ReportFooter page={i + 1} of={totalPages} brand='NORTHERN VOICES SPEECH SERVICES' />
            )}
          </Page>
        )
      })}
    </Document>
  )
}

export default SchoolSpeechSummaryPdf
