import { Document, Page, View, Text, Image, StyleSheet, Font } from '@react-pdf/renderer'

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

interface SummaryStudent {
  name: string
  grade: string
}

interface ReferralStudent {
  name: string
  grade: string
  recommendations_and_referrals: string
}

interface SchoolSpeechSummaryData {
  context: {
    screening_date: string
    slp: string
    qualified: boolean
    qualified_students: SummaryStudent[]
    sub: boolean
    sub_students: SummaryStudent[]
    students_recommendations_and_referrals: ReferralStudent[]
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

const ROWS_FIRST_PAGE = 22
const ROWS_PER_PAGE = 28
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

  infoRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
  infoLabel: { fontFamily: 'Nunito', fontWeight: 700, color: '#111827' },

  sectionLabel: { fontFamily: 'Nunito', fontWeight: 700, color: '#111827', marginBottom: 10 },
  paragraph: { fontSize: 10, color: '#374151', marginBottom: 14, lineHeight: 1.3 },

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

const ReportBanner = () => (
  <View style={styles.banner}>
    <Text style={styles.bannerTitle}>School Summary Report</Text>
    <View style={styles.bannerBrand}>
      <Image src='/icon.png' style={styles.bannerLogo} />
      <View>
        <Text style={styles.bannerBrandText}>NORTHERN VOICES</Text>
        <Text style={styles.bannerBrandSub}>SPEECH SERVICES</Text>
      </View>
    </View>
  </View>
)

const ReportFooter = ({ page, of }: { page: number; of: number }) => (
  <View style={styles.footer}>
    <Text>NORTHERN VOICE SPEECH SERVICES</Text>
    <View style={styles.footerPage}>
      <Image src='/icon.png' style={styles.footerLogo} />
      <Text>{`${page} of ${of}`}</Text>
    </View>
  </View>
)

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

const SchoolSpeechSummaryPdf = ({ data }: { data: SchoolSpeechSummaryData }) => {
  const { context } = data

  const sectionABlocks: TableBlock[] = []
  if (context.qualified && context.qualified_students?.length > 0) {
    sectionABlocks.push({
      heading: 'Qualified - Primary Caseload',
      columns: ['STUDENT', 'GRADE'],
      rows: context.qualified_students.map(s => [s.name, s.grade]),
    })
  }
  if (context.sub && context.sub_students?.length > 0) {
    sectionABlocks.push({
      heading: 'Subs',
      columns: ['STUDENT', 'GRADE'],
      rows: context.sub_students.map(s => [s.name, s.grade]),
    })
  }

  const sectionAPages = paginateBlocks(sectionABlocks, ROWS_FIRST_PAGE)

  const hasReferrals = (context.students_recommendations_and_referrals?.length ?? 0) > 0
  const sectionBPages = hasReferrals
    ? paginateBlocks(
        [
          {
            heading: '',
            columns: ['STUDENT', 'GRADE', 'Notes'],
            rows: context.students_recommendations_and_referrals.map(s => [
              s.name,
              s.grade,
              s.recommendations_and_referrals,
            ]),
          },
        ],
        ROWS_FIRST_PAGE
      )
    : []

  const totalPages = sectionAPages.length + sectionBPages.length

  return (
    <Document>
      {sectionAPages.map((segments, i) => {
        const isLastPage = i === totalPages - 1
        return (
          <Page key={`a-${i}`} size='LETTER' style={styles.page}>
            <ReportBanner />
            <View style={styles.body}>
              {i === 0 && (
                <>
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
                  <Text style={styles.sectionLabel}>
                    A. STUDENTS ELIGIBLE TO PARTICIPATE IN SPEECH PROGRAM:
                  </Text>
                </>
              )}
              {segments.map((segment, j) => (
                <SegmentTable key={j} segment={segment} />
              ))}
            </View>
            {isLastPage && <ReportFooter page={i + 1} of={totalPages} />}
          </Page>
        )
      })}

      {sectionBPages.map((segments, i) => {
        const pageIndex = sectionAPages.length + i
        const isLastPage = pageIndex === totalPages - 1
        return (
          <Page key={`b-${i}`} size='LETTER' style={styles.page}>
            <ReportBanner />
            <View style={styles.body}>
              {i === 0 && (
                <>
                  <Text style={styles.sectionLabel}>B. STUDENT RECOMMENDATIONS AND REFERRALS:</Text>
                  <Text style={styles.paragraph}>
                    Our Speech Therapists have an opportunity to briefly observe students during
                    class-wide speech screens. If the Speech Therapist noted any "red flags" or
                    "developmental concerns" this does not necessarily mean anything is wrong!
                    Recommendations listed below simply serve as proactive steps and suggestions to
                    ensure student success. Please contact your Speech Therapist if you have any
                    questions.
                  </Text>
                </>
              )}
              {segments.map((segment, j) => (
                <SegmentTable key={j} segment={segment} />
              ))}
            </View>
            {isLastPage && <ReportFooter page={pageIndex + 1} of={totalPages} />}
          </Page>
        )
      })}
    </Document>
  )
}

export default SchoolSpeechSummaryPdf
