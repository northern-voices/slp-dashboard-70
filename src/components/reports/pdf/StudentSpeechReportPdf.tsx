import { Document, Page, View, Text, Image, StyleSheet } from '@react-pdf/renderer'
import { REPORT_RESULTS_TEXT } from '@/constants/reportResultsText'
import { DEVELOPMENTAL_CHART } from '@/constants/developmentalSpeechChart'

interface ProcessedError {
  sound: string
  pattern: string
  example: string
  targetSound: string
}

interface StudentSpeechReportData {
  template?: { name?: string }
  context: {
    student_name: string
    date_of_screening: string
    grade: string
    errors: ProcessedError[]
  }
}

const styles = StyleSheet.create({
  page: { padding: 48, fontSize: 11, fontFamily: 'Helvetica', color: '#374151' },
  headerRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 32 },
  logo: { width: 28, height: 28, marginRight: 10 },
  headerBrand: { fontSize: 10, fontFamily: 'Helvetica-Bold', letterSpacing: 1, color: '#111827' },
  headerSub: { fontSize: 6, letterSpacing: 2, color: '#6b7280', marginTop: 2 },
  title: {
    fontSize: 30,
    fontFamily: 'Helvetica',
    color: '#6b7280',
    marginBottom: 24,
    letterSpacing: 1,
  },
  label: { fontFamily: 'Helvetica-Bold', color: '#111827', marginBottom: 6, fontSize: 11 },
  paragraph: { lineHeight: 1.5, marginBottom: 18, color: '#374151' },
  infoBlock: { marginBottom: 18 },
  infoLine: { marginBottom: 3 },
  resultsLine: { textAlign: 'center', marginBottom: 18 },
  resultsBold: { fontFamily: 'Helvetica-Bold' },
  table: { borderWidth: 1, borderColor: '#d1d5db', marginBottom: 18 },
  tableRow: { flexDirection: 'row' },
  tableHeaderCell: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#d1d5db',
    backgroundColor: '#f9fafb',
    padding: 6,
    fontSize: 8,
    fontFamily: 'Helvetica-Bold',
    textAlign: 'center',
  },
  tableCell: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#d1d5db',
    padding: 6,
    fontSize: 9,
    textAlign: 'center',
  },
  footerNote: { fontStyle: 'italic', fontSize: 9, color: '#4b5563' },
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

const ReportHeader = () => (
  <View style={styles.headerRow}>
    <Image src='/icon.png' style={styles.logo} />
    <View>
      <Text style={styles.headerBrand}>NORTHER VOICES</Text>
      <Text style={styles.headerSub}>SPEECH SERVICES</Text>
    </View>
  </View>
)

const ReportFooter = ({ page, of }: { page: number; of: number }) => (
  <View style={styles.footer} fixed>
    <Text>NORTHERN VOICES SPEECH SERVICES</Text>
    <View style={styles.footerPage}>
      <Image src='/icon.png' style={styles.logo} />
      <Text>
        {page} of {of}
      </Text>
    </View>
  </View>
)

const StudentSpeechReportPdf = ({ data }: { data: StudentSpeechReportData }) => {
  const { context, template } = data
  const copy = template?.name ? REPORT_RESULTS_TEXT[template.name] : undefined

  return (
    <Document>
      <Page size='LETTER' style={styles.page}>
        <ReportHeader />

        <Text style={styles.title}>SPEECH SCREEN REPORT</Text>

        <Text style={styles.label}>DEAR PARENT(S)/GUARDIAN(S):</Text>
        <Text style={styles.paragraph}>
          A speech and language pathologist (SLP) recently conducted speech screens at your child's
          school. This report outlines your child's results and provides guidance on steps you can
          take to further support your child's speech development.
        </Text>

        <Text style={styles.label}>SPEECH SCREEN REPORT:</Text>
        <View style={styles.infoBlock}>
          <Text style={styles.infoLine}>Student's Name: {context.student_name}</Text>
          <Text style={styles.infoLine}>Grade: {context.grade}</Text>
          <Text style={styles.infoLine}>Date of Screening: {context.date_of_screening}</Text>
        </View>

        <Text style={styles.resultsLine}>
          Results:{' '}
          <Text style={styles.resultsBold}>
            {copy?.resultsText ?? template?.name ?? 'Results pending'}
          </Text>
        </Text>

        {context.errors.length === 0 ? (
          <Text style={styles.paragraph}>
            No speech sound errors were identified in this screening.
          </Text>
        ) : (
          <View style={styles.table}>
            <View style={styles.tableRow}>
              <Text style={styles.tableHeaderCell}>ERROR SOUND</Text>
              <Text style={styles.tableHeaderCell}>ERROR PATTERN EXHIBITED</Text>
              <Text style={styles.tableHeaderCell}>EXAMPLE</Text>
            </View>
            {context.errors.map((error, i) => (
              <View style={styles.tableRow} key={i}>
                <Text style={styles.tableCell}>{error.targetSound || error.sound}</Text>
                <Text style={styles.tableCell}>{error.pattern}</Text>
                <Text style={styles.tableCell}>{error.example}</Text>
              </View>
            ))}
          </View>
        )}

        {copy?.footerNote && <Text style={styles.footerNote}>{copy.footerNote}</Text>}

        <ReportFooter page={1} of={2} />
      </Page>

      <Page size='LETTER' style={styles.page}>
        <ReportHeader />

        <Text style={styles.label}>DEVELOPMENTAL SPEECH SOUND CHART:</Text>
        <Text style={styles.paragraph}>
          This chart provides a general guideline for when children typically develop and master
          specific speech sounds. It's important to start practicing these sounds before the age of
          expected mastery to proactively address any potential speech difficulties.
        </Text>

        <View style={styles.table}>
          <View style={styles.tableRow}>
            <Text style={styles.tableHeaderCell}>AGE RANGE</Text>
            <Text style={styles.tableHeaderCell}>DEVELOPING SOUNDS</Text>
            <Text style={styles.tableHeaderCell}>EXPECTED MASTERY</Text>
          </View>
          {DEVELOPMENTAL_CHART.map(row => (
            <View style={styles.tableRow} key={row.ageRange}>
              <Text style={styles.tableCell}>{row.ageRange}</Text>
              <Text style={styles.tableCell}>{row.sounds}</Text>
              <Text style={styles.tableCell}>{row.mastery}</Text>
            </View>
          ))}
        </View>

        <Text style={styles.paragraph}>
          <Text style={styles.resultsBold}>Please note: </Text>
          Children are unique and develop speech at their own pace. This chart is meant to serve as
          a guide, not a strict timeline.
        </Text>

        <ReportFooter page={2} of={2} />
      </Page>
    </Document>
  )
}

export default StudentSpeechReportPdf
