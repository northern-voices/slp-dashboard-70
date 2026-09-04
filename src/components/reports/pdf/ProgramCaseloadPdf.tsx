import { Document, Page, View, Text, StyleSheet } from '@react-pdf/renderer'
import { ReportBanner, ReportFooter } from './shared/reportBannerChrome'

interface CaseloadStudent {
  name: string
  result: string
}

interface ProgramCaseloadData {
  context: {
    school: string
    student_count: number
    academic_year: string
    qualified: boolean
    sub: boolean
    qualified_students: CaseloadStudent[]
    sub_students: CaseloadStudent[]
  }
}

interface TableBlock {
  heading: string
  variant: 'qualified' | 'sub'
  columns: string[]
  rows: string[][]
}

interface PageSegment {
  heading: string
  variant: 'qualified' | 'sub'
  columns: string[]
  rows: string[][]
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

const BANNER_BG = '#5b7a8b'

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

  tableCell: {
    borderWidth: 0.75,
    borderColor: '#000000',
    padding: 5,
    fontSize: 8.5,
    textAlign: 'center',
    color: '#4d4b4b',
  },
})

const SegmentTable = ({ segment }: { segment: PageSegment }) => {
  const headingStyle = [
    styles.blockHeading,
    segment.variant === 'qualified' ? styles.blockHeadingQualified : styles.blockHeadingSub,
  ]
  const headerCellStyle = [
    styles.tableHeaderCell,
    segment.variant === 'qualified' ? styles.tableHeaderCellQualified : styles.tableHeaderCellSub,
  ]

  return (
    <>
      {segment.heading && <Text style={headingStyle}>{segment.heading}</Text>}
      <View style={styles.table}>
        <View style={styles.tableRow} wrap={false}>
          {segment.columns.map(col => (
            <Text key={col} style={[...headerCellStyle, { flex: 1 }]}>
              {col}
            </Text>
          ))}
        </View>
        {segment.rows.map((row, i) => (
          <View style={styles.tableRow} key={i} wrap={false}>
            {row.map((cell, j) => (
              <Text key={j} style={[styles.tableCell, { flex: 1 }]}>
                {cell}
              </Text>
            ))}
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
      columns: ['STUDENT NAME', 'ACADEMIC YEAR', 'RESULT'],
      rows: context.qualified_students.map(s => [s.name, context.academic_year, s.result]),
    })
  }

  if (context.sub && context.sub_students?.length > 0) {
    blocks.push({
      heading: 'Subs',
      variant: 'sub',
      columns: ['STUDENT NAME', 'ACADEMIC YEAR', 'RESULT'],
      rows: context.sub_students.map(s => [s.name, context.academic_year, s.result]),
    })
  }

  const pages = paginateBlocks(blocks, ROWS_FIRST_PAGE)

  return (
    <Document>
      {pages.length === 0 ? (
        <Page size='LETTER' style={styles.page}>
          <ReportBanner title='Program Caseload' />
          <View style={styles.body}>
            <Text style={styles.pageSubtitle}>Qualified & Sub Students</Text>
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
                    <Text style={styles.pageSubtitle}>Qualified & Sub Students</Text>
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
