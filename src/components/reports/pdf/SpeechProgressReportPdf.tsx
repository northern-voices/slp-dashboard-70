import { Document, Page, View, Text, StyleSheet, Font } from '@react-pdf/renderer'
import { ReportBanner, ReportFooter } from './shared/reportBannerChrome'

Font.register({
  family: 'Montserrat',
  fonts: [
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
})

const SpeechProgressReportPdf = ({ data }: { data: SpeechProgressReportData }) => {
  const { context } = data

  return (
    <Document>
      <Page size='LETTER' style={styles.page}>
        <ReportBanner title='Student Progress Report' titleFontSize={28} />

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
        <ReportFooter brand='NORTHERN VOICES SPEECH SERVICES' />
      </Page>
    </Document>
  )
}

export default SpeechProgressReportPdf
