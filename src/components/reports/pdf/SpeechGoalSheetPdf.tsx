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

interface TableError {
  sound: string
  pattern: string
  example: string
}

interface GoalError {
  sound: string
  pattern: string
  example: string
  targetSound: string
  stimulability_option: string
}

interface SpeechGoalSheetData {
  template?: { name?: string }
  context: {
    student_name: string
    date_of_screening: string
    school: string
    grade: string
    vocabulary_support: boolean
    primary_errors: GoalError[]
    secondary_errors: GoalError[]
    primary_table_errors: TableError[]
    secondary_table_errors: TableError[]
  }
}

const BANNER_BG = '#5b7a8b'
const TAN_BG = '#e9e2d9'

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
    paddingVertical: 26,
    paddingHorizontal: 48,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  bannerTitle: { fontFamily: 'Gotu', fontSize: 30, color: '#ffffff', letterSpacing: 0.5 },
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
  body: { paddingHorizontal: 48, paddingTop: 22 },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
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

  table: { marginBottom: 10 },
  tableRow: { flexDirection: 'row' },
  tableHeaderCell: {
    flex: 1,
    borderWidth: 0.75,
    borderColor: '#000000',
    backgroundColor: '#f2f2f2',
    padding: 6,
    fontSize: 8,
    fontFamily: 'Montserrat',
    fontWeight: 700,
    textAlign: 'center',
  },
  tableCell: {
    flex: 1,
    borderWidth: 0.75,
    borderColor: '#000000',
    padding: 6,
    fontSize: 9,
    textAlign: 'center',
    color: '#4d4b4b',
  },

  vocabNote: {
    fontSize: 11,
    fontFamily: 'Montserrat',
    fontStyle: 'italic',
    color: '#4b5563',
    marginTop: 2,
  },

  studentLine: {
    fontSize: 12,
    fontFamily: 'Nunito',
    fontWeight: 700,
    color: '#111827',
    marginBottom: 8,
  },

  soundStrategyRow: {
    flexDirection: 'row',
    borderWidth: 0.75,
    borderColor: '#b7b7b7',
    backgroundColor: '#eff3f6',
    marginBottom: 12,
    padding: 10,
  },
  soundBox: {
    width: '35%',
    paddingRight: 10,
    borderRightWidth: 0.75,
    borderRightColor: '#d1d5db',
  },
  strategyBox: { width: '65%', paddingLeft: 10 },
  soundLabel: {
    fontSize: 9,
    fontFamily: 'Nunito',
    fontWeight: 700,
    color: '#111827',
    marginBottom: 2,
  },
  soundValue: {
    fontSize: 15,
    fontFamily: 'Nunito',
    fontWeight: 700,
    color: '#111827',
    marginBottom: 4,
  },
  soundHint: { fontSize: 7, fontFamily: 'Montserrat', fontStyle: 'italic', color: '#6b7280' },
  strategyLabel: {
    fontSize: 9,
    fontFamily: 'Nunito',
    fontWeight: 700,
    color: '#111827',
    marginBottom: 5,
  },
  checkboxRow: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 3 },
  checkboxBox: {
    width: 8,
    height: 8,
    borderWidth: 1,
    borderColor: '#374151',
    marginRight: 5,
    marginTop: 1,
  },
  checkboxLabel: { fontSize: 8, flex: 1 },

  sessionCard: { borderWidth: 0.75, borderColor: '#b7b7b7', marginBottom: 10 },
  sessionHeader: { paddingVertical: 6, paddingHorizontal: 10 },
  sessionHeaderDark: { backgroundColor: BANNER_BG },
  sessionHeaderTan: { backgroundColor: TAN_BG },
  sessionHeaderTextLight: {
    fontSize: 9,
    fontFamily: 'Montserrat',
    fontWeight: 700,
    letterSpacing: 1,
    textAlign: 'center',
    color: '#ffffff',
  },
  sessionHeaderTextDark: {
    fontSize: 9,
    fontFamily: 'Montserrat',
    fontWeight: 700,
    letterSpacing: 1,
    textAlign: 'center',
    color: '#4d4b4b',
  },
  sessionBody: { flexDirection: 'row', padding: 10 },
  sessionBodyLight: { backgroundColor: '#eff3f6' },
  sessionBodyCream: { backgroundColor: '#f9f7f4' },
  sessionLeft: {
    width: '38%',
    paddingRight: 10,
    borderRightWidth: 0.75,
    borderRightColor: '#d1d5db',
  },
  sessionRight: { width: '62%', paddingLeft: 10 },
  sessionQuestion: {
    fontSize: 9,
    fontFamily: 'Nunito',
    fontWeight: 700,
    color: '#111827',
    marginBottom: 2,
  },
  sessionSubQuestion: {
    fontSize: 8,
    fontFamily: 'Montserrat',
    fontStyle: 'italic',
    color: '#6b7280',
    marginBottom: 5,
  },

  sessionGoal: { fontSize: 9, marginBottom: 5, lineHeight: 1.3 },
  italicBold: { fontFamily: 'Montserrat', fontStyle: 'italic', fontWeight: 700 },
  bold: { fontFamily: 'Nunito', fontWeight: 700 },
  dateLine: { fontSize: 9, marginBottom: 8 },
  fieldLabel: {
    fontSize: 8,
    fontFamily: 'Nunito',
    fontWeight: 700,
    color: '#111827',
    marginTop: 5,
    marginBottom: 3,
  },
  fieldHint: { fontFamily: 'Montserrat', fontWeight: 400, fontStyle: 'italic', color: '#6b7280' },
  blankLine: {
    borderBottomWidth: 0.5,
    borderBottomColor: '#9ca3af',
    height: 14,
    marginBottom: 2,
  },

  masteredRow: { flexDirection: 'row', marginTop: 4 },
  masteredPill: {
    flex: 1,
    backgroundColor: TAN_BG,
    borderWidth: 0.75,
    borderColor: '#b7b7b7',
    paddingVertical: 7,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  masteredPillLeft: { marginRight: 1 },
  radioCircle: {
    width: 8,
    height: 8,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#374151',
    marginRight: 5,
  },
  masteredPillText: {
    fontSize: 9,
    fontFamily: 'Montserrat',
    fontWeight: 700,
    letterSpacing: 0.5,
    color: '#374151',
  },
  footerNote: { fontFamily: 'Montserrat', fontStyle: 'italic', fontSize: 9, color: '#4b5563' },
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

const ReportBanner = ({ title }: { title: string }) => (
  <View style={styles.banner} fixed>
    <Text style={styles.bannerTitle}>{title}</Text>
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

const Checkbox = ({ label }: { label: string }) => (
  <View style={styles.checkboxRow}>
    <View style={styles.checkboxBox} />
    <Text style={styles.checkboxLabel}>{label}</Text>
  </View>
)

const STRATEGY_ITEMS = ['Pointing to mouth', 'Clapping (syllables)', 'Straw (lateral lisp)']

const HOW_DID_THEY_DO_ITEMS = [
  'Could not say the sound at all',
  'Can say the sound (but not in words)',
  'Can say the sound in most words (with adult cues)',
  'Can say the sound in most words (no adult help)',
]

const ErrorTable = ({ title, errors }: { title: string; errors: TableError[] }) => (
  <>
    <Text style={styles.sectionTitle}>{title}</Text>
    <View style={styles.table}>
      <View style={styles.tableRow} wrap={false}>
        <Text style={styles.tableHeaderCell}>ERROR SOUND</Text>
        <Text style={styles.tableHeaderCell}>ERROR PATTERN EXHIBITED</Text>
        <Text style={styles.tableHeaderCell}>EXAMPLE</Text>
      </View>
      {errors.map((error, i) => (
        <View style={styles.tableRow} key={i} wrap={false}>
          <Text style={styles.tableCell}>{error.sound}</Text>
          <Text style={styles.tableCell}>{error.pattern}</Text>
          <Text style={styles.tableCell}>{error.example}</Text>
        </View>
      ))}
    </View>
  </>
)

const GoalWorksheetPage = ({ studentName, error }: { studentName: string; error: GoalError }) => (
  <Page size='LETTER' style={styles.page}>
    <ReportBanner title='Goal Sheets' />

    <View style={styles.body}>
      <Text style={styles.studentLine}>STUDENT: {studentName}</Text>

      <View style={styles.soundStrategyRow} wrap={false}>
        <View style={styles.soundBox}>
          <Text style={styles.soundLabel}>SOUND:</Text>
          <Text style={styles.soundValue}>{error.sound}</Text>
          <Text style={styles.soundHint}>(write the word the student made the error on)</Text>
        </View>
        <View style={styles.strategyBox}>
          <Text style={styles.strategyLabel}>STRATEGIES TO USE:</Text>
          {STRATEGY_ITEMS.map(item => (
            <Checkbox key={item} label={item} />
          ))}
        </View>
      </View>
      {[0, 1, 2].map(i => (
        <View key={i} style={styles.sessionCard} wrap={false}>
          <View
            style={[
              styles.sessionHeader,
              i === 1 ? styles.sessionHeaderTan : styles.sessionHeaderDark,
            ]}>
            <Text style={i === 1 ? styles.sessionHeaderTextDark : styles.sessionHeaderTextLight}>
              SESSION {i + 1}
            </Text>
          </View>
          <View
            style={[
              styles.sessionBody,
              i === 1 ? styles.sessionBodyCream : styles.sessionBodyLight,
            ]}>
            <View style={styles.sessionLeft}>
              <Text style={styles.sessionQuestion}>How did the student do?</Text>
              <Text style={styles.sessionSubQuestion}>Were they able to say the sound?</Text>
              {HOW_DID_THEY_DO_ITEMS.map(item => (
                <Checkbox key={item} label={item} />
              ))}
            </View>
            <View style={styles.sessionRight}>
              <Text style={styles.sessionGoal}>
                <Text style={styles.italicBold}>Goal: </Text>
                Student will say the <Text style={styles.bold}>{error.sound}</Text> at the{' '}
                <Text style={styles.bold}>{error.stimulability_option}</Text> level with 90%
                accuracy.
              </Text>
              <Text style={styles.dateLine}>Date: ______________________</Text>

              <Text style={styles.fieldLabel}>Activities / Games</Text>
              <View style={styles.blankLine} />

              <Text style={styles.fieldLabel}>
                Progress / Improvement{' '}
                <Text style={styles.fieldHint}>
                  (Speech, confidence, social skills, language, vocabulary, etc.)
                </Text>
              </Text>
              <View style={styles.blankLine} />

              <Text style={styles.fieldLabel}>Additional comments, questions, or concerns</Text>
              <View style={styles.blankLine} />
            </View>
          </View>
        </View>
      ))}
      <View style={styles.masteredRow} wrap={false}>
        <View style={[styles.masteredPill, styles.masteredPillLeft]}>
          <View style={styles.radioCircle} />
          <Text style={styles.masteredPillText}>MASTERED</Text>
        </View>
        <View style={styles.masteredPill}>
          <View style={styles.radioCircle} />
          <Text style={styles.masteredPillText}>NEEDS MORE PRACTICE</Text>
        </View>
      </View>
    </View>

    <ReportFooter />
  </Page>
)

const SpeechGoalSheetPdf = ({ data }: { data: SpeechGoalSheetData }) => {
  const { context } = data
  const worksheetErrors = [...(context.primary_errors ?? []), ...(context.secondary_errors ?? [])]

  return (
    <Document>
      <Page size='LETTER' style={styles.page}>
        <ReportBanner title='Goal Sheet' />

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
          <View style={styles.infoRow}>
            <Text style={styles.infoItem}>
              <Text style={styles.infoLabel}>School: </Text>
              {context.school}
            </Text>
            <Text style={styles.infoItem}>
              <Text style={styles.infoLabel}>Screening Date: </Text>
              {context.date_of_screening}
            </Text>
          </View>

          {context.primary_table_errors?.length > 0 && (
            <ErrorTable title='SOUND ERRORS' errors={context.primary_table_errors} />
          )}

          {context.secondary_table_errors?.length > 0 && (
            <ErrorTable title='SECONDARY SOUND ERRORS' errors={context.secondary_table_errors} />
          )}

          {context.vocabulary_support && (
            <Text style={styles.vocabNote}>Vocabulary support recommended</Text>
          )}
        </View>

        <ReportFooter />
      </Page>

      {worksheetErrors.map((error, i) => (
        <GoalWorksheetPage key={i} studentName={context.student_name} error={error} />
      ))}
    </Document>
  )
}

export default SpeechGoalSheetPdf
