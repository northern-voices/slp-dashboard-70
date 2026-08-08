import { Document, Page, View, Text, Image, StyleSheet } from '@react-pdf/renderer'
import { ReportBanner, ReportFooter } from './shared/reportBannerChrome'

interface SummaryStudent {
  name: string
  grade: string
}

interface SchoolHearingSummaryData {
  context: {
    screening_date: string
    referred: boolean
    referred_students: SummaryStudent[]
    absent?: boolean
    absent_students?: SummaryStudent[]
  }
}

interface TableBlock {
  heading: string
  columns: string[]
  rows: string[][]
}

interface PageSegment {
  heading: string
  columns: string[]
  rows: string[][]
}

const ROWS_FIRST_PAGE = 24
const ROWS_PER_PAGE = 30
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

  infoLine: { marginBottom: 12 },
  infoLabel: { fontFamily: 'Nunito', fontWeight: 700, color: '#111827' },

  sectionText: { fontSize: 10, color: '#374151', marginTop: 16 },
  blockHeading: { fontFamily: 'Gotu', fontSize: 15, color: '#1f2937', marginBottom: 8 },

  table: { marginBottom: 14 },
  tableRow: { flexDirection: 'row' },
  tableHeaderCell: {
    borderWidth: 0.75,
    borderColor: '#000000',
    backgroundColor: '#f2f2f2',
    padding: 5,
    fontSize: 8,
    fontFamily: 'Montserrat',
    fontWeight: 700,
    textAlign: 'center',
  },
  tableCell: {
    borderWidth: 0.75,
    borderColor: '#000000',
    padding: 5,
    fontSize: 8.5,
    textAlign: 'center',
    color: '#4d4b4b',
  },
})

const SegmentTable = ({ segment }: { segment: PageSegment }) => (
  <>
    {segment.heading && <Text style={styles.blockHeading}>{segment.heading}</Text>}
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
            <Text key={j} style={[styles.tableCell, { flex: 1 }]}>
              {cell}
            </Text>
          ))}
        </View>
      ))}
    </View>
  </>
)

const SchoolHearingSummaryPdf = ({ data }: { data: SchoolHearingSummaryData }) => {
  const { context } = data

  const blocks: TableBlock[] = []
  if (context.referred && context.referred_students?.length > 0) {
    blocks.push({
      heading: 'Referred',
      columns: ['STUDENT', 'GRADE'],
      rows: context.referred_students.map(s => [s.name, s.grade]),
    })
  }
  if (context.absent && context.absent_students && context.absent_students.length > 0) {
    blocks.push({
      heading: 'Absent',
      columns: ['STUDENT', 'GRADE'],
      rows: context.absent_students.map(s => [s.name, s.grade]),
    })
  }

  const pages = paginateBlocks(blocks, ROWS_FIRST_PAGE)

  return (
    <Document>
      {pages.length === 0 ? (
        <Page size='LETTER' style={styles.page}>
          <ReportBanner title='Hearing Summary Report' />
          <View style={styles.body}>
            <Text style={styles.infoLine}>
              <Text style={styles.infoLabel}>Screening Date(s): </Text>
              {context.screening_date}
            </Text>
            <Text style={styles.sectionText}>No students referred or absent this year.</Text>
          </View>
          <ReportFooter brand='NORTHERN VOICES SPEECH SERVICES' page={1} of={1} />
        </Page>
      ) : (
        pages.map((segments, i) => {
          const isLastPage = i === pages.length - 1
          return (
            <Page key={i} size='LETTER' style={styles.page}>
              <ReportBanner title='Hearing Summary Report' />
              <View style={styles.body}>
                {i === 0 && (
                  <Text style={styles.infoLine}>
                    <Text style={styles.infoLabel}>Screening Date(s): </Text>
                    {context.screening_date}
                  </Text>
                )}
                {segments.map((segment, j) => (
                  <SegmentTable key={j} segment={segment} />
                ))}
              </View>
              {isLastPage && (
                <ReportFooter
                  brand='NORTHERN VOICES SPEECH SERVICES'
                  page={i + 1}
                  of={pages.length}
                />
              )}
            </Page>
          )
        })
      )}
    </Document>
  )
}

export default SchoolHearingSummaryPdf
