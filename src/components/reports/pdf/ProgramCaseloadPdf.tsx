import { Document, Page, View, Text, Image, StyleSheet, Font } from '@react-pdf/renderer'
import { ReportBanner, ReportFooter } from './shared/reportBannerChrome'

Font.register({
  family: 'Gotu',
  src: 'https://fonts.gstatic.com/s/gotu/v18/o-0FIpksx3QOpHoBjqp56hQ.ttf',
})

Font.register({
  family: 'Nunito',
  fonts: [
    {
      src: 'https://fonts.gstatic.com/s/nunito/v32/XRXI3I6Li01BKofiOc5wtlZ2di8HDLshdTQ3iqzdXWg.ttf',
      fontWeight: 400,
    },
    {
      src: 'https://fonts.gstatic.com/s/nunito/v32/XRXI3I6Li01BKofiOc5wtlZ2di8HDFwmdTQ3iqzdXWg.ttf',
      fontWeight: 700,
    },
  ],
})

Font.register({
  family: 'Montserrat',
  fonts: [
    {
      src: 'https://fonts.gstatic.com/s/montserrat/v31/JTUHjIg1_i6t8kCHKm4532VJOt5-QNFgpCtr6Hw5aX9-obK4.ttf',
      fontWeight: 400,
    },
    {
      src: 'https://fonts.gstatic.com/s/montserrat/v31/JTUHjIg1_i6t8kCHKm4532VJOt5-QNFgpCuM73w5aX9-obK4.ttf',
      fontWeight: 700,
    },
  ],
})

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
  columns: string[]
  rows: string[][]
}

interface PageSegment {
  heading: string
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
  banner: {
    backgroundColor: BANNER_BG,
    paddingVertical: 16,
    paddingHorizontal: 48,
    marginBottom: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  bannerTitle: { fontFamily: 'Gotu', fontSize: 26, color: '#ffffff', letterSpacing: 0.5 },
  bannerBrand: { flexDirection: 'row', alignItems: 'center' },
  bannerLogo: { width: 26, height: 26, borderRadius: 4, marginRight: 8 },
  bannerBrandText: {
    fontSize: 9,
    fontFamily: 'Nunito',
    fontWeight: 700,
    letterSpacing: 1,
    color: '#ffffff',
  },
  bannerBrandSub: {
    fontSize: 6,
    fontFamily: 'Montserrat',
    letterSpacing: 2,
    color: '#e5eaec',
    marginTop: 2,
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

  footer: {
    position: 'absolute',
    bottom: 32,
    left: 48,
    right: 48,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    paddingTop: 8,
    fontSize: 8,
    color: '#6b7280',
  },
  footerLogo: { width: 12, height: 12, marginRight: 4 },
  footerPage: { flexDirection: 'row', alignItems: 'center' },
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

const ProgramCaseloadPdf = ({ data }: { data: ProgramCaseloadData }) => {
  const { context } = data

  const blocks: TableBlock[] = []
  if (context.qualified && context.qualified_students?.length > 0) {
    blocks.push({
      heading: 'Qualified - Primary Caseload',
      columns: ['STUDENT NAME', 'ACADEMIC YEAR', 'RESULT'],
      rows: context.qualified_students.map(s => [s.name, context.academic_year, s.result]),
    })
  }
  if (context.sub && context.sub_students?.length > 0) {
    blocks.push({
      heading: 'Subs',
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
