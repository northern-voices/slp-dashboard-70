import { Document, Page, View, Text, Image, StyleSheet, Font } from '@react-pdf/renderer'
import { DEVELOPMENTAL_CHART } from '@/constants/developmentalSpeechChart'
import { ReportHeader, ReportFooter } from './shared/reportSimpleChrome'

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

interface NoErrorsReportData {
  context: {
    student_name: string
    date_of_screening: string
    grade: string
  }
}

const styles = StyleSheet.create({
  page: {
    paddingTop: 28,
    paddingRight: 48,
    paddingBottom: 72,
    paddingLeft: 48,
    fontSize: 11,
    fontFamily: 'Nunito',
    color: '#374151',
  },
  headerRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 14 },
  logo: { width: 28, height: 28, marginRight: 10 },
  headerBrand: {
    fontSize: 10,
    fontFamily: 'Nunito',
    fontWeight: 700,
    letterSpacing: 1,
    color: '#111827',
  },
  headerSub: {
    fontSize: 6,
    fontFamily: 'Montserrat',
    letterSpacing: 2,
    color: '#6b7280',
    marginTop: 2,
  },
  title: {
    fontSize: 30,
    fontFamily: 'Gotu',
    color: '#6b7280',
    marginBottom: 12,
    letterSpacing: 1,
    textAlign: 'center',
  },
  label: {
    fontFamily: 'Nunito',
    fontWeight: 700,
    color: '#111827',
    marginBottom: 3,
    fontSize: 11,
  },
  introParagraph: { lineHeight: 1, letterSpacing: -0.5, marginBottom: 6, color: '#374151' },
  paragraph: { lineHeight: 1.2, marginBottom: 18, color: '#374151' },
  bold: { fontFamily: 'Nunito', fontWeight: 700 },
  infoBlock: { marginBottom: 14 },
  infoLine: { marginBottom: 1 },
  table: { marginBottom: 8 },
  tableRow: { flexDirection: 'row' },
  tableHeaderCell: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#d1d5db',
    backgroundColor: '#f9fafb',
    padding: 6,
    fontSize: 8,
    fontFamily: 'Montserrat',
    fontWeight: 700,
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

const NoErrorsSpeechReportPdf = ({ data }: { data: NoErrorsReportData }) => {
  const { context } = data

  return (
    <Document>
      <Page size='LETTER' style={styles.page}>
        <ReportHeader />

        <Text style={styles.title}>SPEECH SCREEN REPORT</Text>

        <View style={styles.infoBlock}>
          <Text style={styles.infoLine}>Student's Name: {context.student_name}</Text>
          <Text style={styles.infoLine}>Grade: {context.grade}</Text>
          <Text style={styles.infoLine}>Date of Screening: {context.date_of_screening}</Text>
        </View>

        <Text style={styles.label}>DEAR PARENT(S)/GUARDIAN(S):</Text>
        <Text style={styles.introParagraph}>
          A speech and language pathologist (SLP) recently conducted speech screens at your child's
          school.{' '}
          <Text style={styles.bold}>
            We are happy to share that your child did not exhibit any speech sound errors!
          </Text>
        </Text>

        <Text style={styles.label}>DEVELOPMENTAL SPEECH SOUND CHART:</Text>
        <Text style={styles.paragraph}>
          This chart provides a general guideline for when children typically develop and master
          specific speech sounds. It's important to start practicing these sounds before the age of
          expected mastery to proactively address any potential speech difficulties.
        </Text>

        <View style={styles.table}>
          <View style={styles.tableRow} wrap={false}>
            <Text style={styles.tableHeaderCell}>AGE RANGE</Text>
            <Text style={styles.tableHeaderCell}>DEVELOPING SOUNDS</Text>
            <Text style={styles.tableHeaderCell}>EXPECTED MASTERY</Text>
          </View>
          {DEVELOPMENTAL_CHART.map(row => (
            <View style={styles.tableRow} key={row.ageRange} wrap={false}>
              <Text style={styles.tableCell}>{row.ageRange}</Text>
              <Text style={styles.tableCell}>{row.sounds}</Text>
              <Text style={styles.tableCell}>{row.mastery}</Text>
            </View>
          ))}
        </View>

        <Text style={styles.paragraph}>
          <Text style={styles.bold}>Please note: </Text>
          Children are unique and develop speech at their own pace. This chart is meant to serve as
          a guide, not a strict timeline.
        </Text>

        <ReportFooter brand='NORTHERN VOICES SPEECH SERVICES' offset={1} />
      </Page>
    </Document>
  )
}

export default NoErrorsSpeechReportPdf
