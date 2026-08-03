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
    {
      src: 'https://fonts.gstatic.com/s/montserrat/v31/JTUFjIg1_i6t8kCHKm459Wx7xQYXK0vOoz6jq6R9WXh0o5C6MLk.ttf',
      fontWeight: 400,
      fontStyle: 'italic',
    },
  ],
})

interface ProgressTableError {
  sound: string
  pattern: string
  example: string
  initial_screen: string
  progress_screen: string
  summary: string
}

interface SpeechProgressReportData {
  context: {
    student_name: string
    grade: string
    school: string
    initial_screen_date: string
    progress_screen_date: string
    primary_table_errors: ProgressTableError[]
    progress_notes: string
  }
}

const BANNER_BG = '#5b7a8b'

const styles = StyleSheet.create({
  page: {
    paddingTop: 0,
    paddingBotton: 60,
    paddingLeft: 0,
    paddingRight: 0,
    fontSize: 10,
    fontFamily: 'Nunito',
    color: '#374151',
  },
  banner: {
    backgroundColor: BANNER_BG,
    paddingVertical: 16,
    paddingHorizontal: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  bannerTitle: { fontFamily: 'Gotu', fontSize: 28, color: '#ffffff', letterSpacing: 0.5 },
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
  body: { paddingHorizontal: 48, paddingTop: 20 },

  infoRow: { flexDirection: 'row', marginBottom: 6 },
  infoLine: { marginBottom: 6, fontSize: 11 },
  infoItem: { flex: 1, fontSize: 11 },
  infoLabel: { fontFamily: 'Nunito', fontWeight: 700, color: '#111827' },

  sectionTitle: {
    fontFamily: 'Gotu',
    fontSize: 20,
    color: '#4b5563',
    textAlign: 'center',
    marginTop: 10,
    marginBottom: 10,
    letterSpacing: 0.5,
  },

  table: { marginBottom: 12 },
  tableRow: { flexDirection: 'row' },
  tableHeaderCell: {
    borderWidth: 0.75,
    borderColor: '#000000',
    backgroundColor: '#f2f2f2',
    padding: 4,
    fontSize: 7,
    fontFamily: 'Montserrat',
    fontWeight: 700,
    textAlign: 'center',
  },
  tableCell: {
    borderWidth: 0.75,
    borderColor: '#000000',
    padding: 4,
    fontSize: 7.5,
    textAlign: 'center',
    color: '#4d4b4b',
  },
  colSound: { flex: 0.6 },
  colPattern: { flex: 1.3 },
  colExample: { flex: 1 },
  colInitial: { flex: 1.1 },
  colProgress: { flex: 1.1 },
  colSummary: { flex: 1.5 },

  noteText: { fontSize: 9, color: '#374151', lineHeight: 1.4, marginBottom: 10 },
  noteLabel: { fontFamily: 'Nunito', fontWeight: 700, color: '#111827' },

  summaryNotesLabel: {
    fontFamily: 'Nunito',
    fontWeight: 700,
    fontSize: 10,
    color: '#111827',
    marginBottom: 3,
  },
  summaryNotesText: { fontSize: 9, color: '#374151', lineHeight: 1.4 },

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
  <View style={styles.banner} fixed>
    <Text style={styles.bannerTitle}>Student Progreses REport</Text>
    <View style={styles.bannerBrand}>
      <Image src='/icon.png' style={styles.bannerLogo} />
      <View>
        <Text style={styles.bannerBrandText}>NORTHERN VOICES</Text>
        <Text style={styles.bannerBrandSub}>SPEECH SERVICES</Text>
      </View>
    </View>
  </View>
)

const ReportFooter = () => (
  <View style={styles.footer} fixed>
    <Text>NORTHERN VOICES SPEECH SERVICES</Text>
    <View style={styles.footerPage}>
      <Image src='/icon.png' style={styles.footerLogo} />
      <Text render={({ pageNumber, totalPages }) => `${pageNumber} of ${totalPages}`} />
    </View>
  </View>
)

const SpeechProgressReportPdf = ({ data }: { data: SpeechProgressReportData }) => {
  const { context } = data

  return (
    <Document>
      <Page size='LETTER' style={styles.page}>
        <ReportBanner />

        <View style={styles.body}>
          <View style={styles.infoRow}>
            <Text style={styles.infoItem}>
              <Text style={styles.infoLabel}>Student: </Text>
              {context.student_name}
            </Text>
            <Text style={styles.infoItem}>
              <Text style={styles.infoLabel}>Grade: </Text>
              {context.grade}
            </Text>
          </View>
          <Text style={styles.infoLine}>
            <Text style={styles.infoLabel}>School: </Text>
            {context.school}
          </Text>
          <Text style={styles.infoLine}>
            <Text style={styles.infoLabel}>Initial Screening Date: </Text>
            {context.initial_screen_date}
          </Text>
          <Text style={styles.infoLine}>
            <Text style={styles.infoLabel}>Progress Screening Date: </Text>
            {context.progress_screen_date}
          </Text>

          {context.primary_table_errors?.length > 0 && (
            <View style={styles.table}>
              <View style={styles.tableRow} wrap={false}>
                <Text style={[styles.tableHeaderCell, styles.colSound]}>SOUND</Text>
                <Text style={[styles.tableHeaderCell, styles.colPattern]}>ERROR PATTERN</Text>
                <Text style={[styles.tableHeaderCell, styles.colExample]}>EXAMPLE</Text>
                <Text style={[styles.tableHeaderCell, styles.colInitial]}>INITIAL SCREEN</Text>
                <Text style={[styles.tableHeaderCell, styles.colProgress]}>PROGRESS SCREEN</Text>
                <Text style={[styles.tableHeaderCell, styles.colSummary]}>SUMMARY</Text>
              </View>
              {context.primary_table_errors.map((error, i) => (
                <View style={styles.tableRow} key={i} wrap={false}>
                  <Text style={[styles.tableCell, styles.colSound]}>{error.sound}</Text>
                  <Text style={[styles.tableCell, styles.colPattern]}>{error.pattern}</Text>
                  <Text style={[styles.tableCell, styles.colExample]}>{error.example}</Text>
                  <Text style={[styles.tableCell, styles.colInitial]}>{error.initial_screen}</Text>
                  <Text style={[styles.tableCell, styles.colProgress]}>
                    {error.progress_screen}
                  </Text>
                  <Text style={[styles.tableCell, styles.colSummary]}>{error.summary}</Text>
                </View>
              ))}
            </View>
          )}

          <Text style={styles.noteText}>
            <Text style={styles.noteLabel}>Please note: </Text>
            Students often show meaningful improvement during practice activities with support, cues
            and adult modelling before these skills are demonstrated during formal testing.
          </Text>

          {context.progress_notes && (
            <View>
              <Text style={styles.summaryNotesLabel}>Summary Notes:</Text>
              <Text style={styles.summaryNotesText}>{context.progress_notes}</Text>
            </View>
          )}
        </View>

        <ReportFooter />
      </Page>
    </Document>
  )
}

export default SpeechProgressReportPdf
