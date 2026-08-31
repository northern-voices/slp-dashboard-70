import { Document, Page, View, Text, Image, StyleSheet, Font } from '@react-pdf/renderer'
import { ReportBanner, ReportFooter } from './shared/reportBannerChrome'
import { DotsVerticalIcon } from '@radix-ui/react-icons'

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

interface TableError {
  sound: string
  pattern: string
  example: string
}

interface GoalSheetStrategies {
  wordPhrase: string[]
  sound: string[]
  audDiscrim: string[]
}

interface QrVideo {
  category: string
  title: string
  url: string
  dataUri: string
}

interface GoalError {
  sound: string
  pattern: string
  example: string
  targetSound: string
  stimulability_option: string
  strategies: GoalSheetStrategies
  qrVideos: QrVideo[]
}

// Maps the student's recorded stimulability level to which strategy column
// to show. Word and Phrase share a column - see the source document's own
// "default to word unless phrase or aud. discrim is selected" note.
const STIMULABILITY_STRATEGY_COLUMN: Record<string, keyof GoalSheetStrategies> = {
  'non-stimulable': 'audDiscrim',
  sound: 'sound',
  word: 'wordPhrase',
  phrase: 'wordPhrase',
}

const getStrategyItems = (error: GoalError): string[] => {
  const column = STIMULABILITY_STRATEGY_COLUMN[error.stimulability_option] || 'wordPhrase'
  return error.strategies?.[column] ?? []
}

const STRATEGY_COLUMN_MAX = 3

// Wraps a strategy list into side-by-side sub-columns of at most
// STRATEGY_COLUMN_MAX items each, instead of letting one long list run tall.
const chunkStrategyItems = (items: string[]): string[][] => {
  const chunks: string[][] = []
  for (let i = 0; i < items.length; i += STRATEGY_COLUMN_MAX) {
    chunks.push(items.slice(i, i + STRATEGY_COLUMN_MAX))
  }
  return chunks
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
    level?: 1 | 2
    level_1_table_errors?: TableError[]
    level_2_table_errors?: TableError[]
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
  body: { paddingHorizontal: 48, paddingTop: 14 },
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
  sectionTitleLevel1: { color: '#5b7a8b' },
  sectionTitleLevel2: { color: '#8a6d4f' },

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
  tableHeaderCellLevel1: { backgroundColor: '#5b7a8b', color: '#ffffff' },
  tableHeaderCellLevel2: { backgroundColor: '#e9e2d9', color: '#4d4b4b' },
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
    fontSize: 11,
    fontFamily: 'Nunito',
    fontWeight: 700,
    color: '#111827',
    marginBottom: 5,
  },

  soundStrategyRow: {
    flexDirection: 'row',
    borderWidth: 0.75,
    borderColor: '#b7b7b7',
    backgroundColor: '#eff3f6',
    marginBottom: 8,
    padding: 8,
  },
  soundBox: {
    width: '13%',
    paddingRight: 4,
    borderRightWidth: 0.75,
    borderRightColor: '#d1d5db',
  },
  strategyBox: { width: '87%', paddingLeft: 12, flexDirection: 'row' },
  strategyChecklistCol: {
    flexGrow: 0,
    flexShrink: 0,
    paddingRight: 16,
    borderRightWidth: 0.75,
    borderRightColor: '#d1d5db',
  },
  strategyChecklistColsRow: { flexDirection: 'row' },
  strategyChecklistSubCol: { flexGrow: 0, flexShrink: 0, paddingRight: 10 },
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
    marginBottom: 3,
  },
  strategyLabel: {
    fontSize: 9,
    fontFamily: 'Nunito',
    fontWeight: 700,
    color: '#111827',
    marginBottom: 3,
  },
  qrColumn: { flexDirection: 'row', alignItems: 'flex-start' },
  qrItem: { alignItems: 'center' },
  qrItemSpacer: { marginLeft: 8 },
  qrImage: { width: 50, height: 50 },
  qrCaption: {
    fontSize: 6,
    fontFamily: 'Montserrat',
    textAlign: 'center',
    color: '#4b5563',
    marginTop: 2,
  },
  checkboxRow: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 2 },
  checkboxBox: {
    width: 7,
    height: 7,
    borderWidth: 1,
    borderColor: '#374151',
    marginRight: 4,
    marginTop: 1,
  },
  checkboxLabel: { fontSize: 7, flex: 1 },

  sessionCard: { borderWidth: 0.75, borderColor: '#b7b7b7', marginBottom: 6 },
  sessionHeader: { paddingVertical: 4, paddingHorizontal: 10 },
  sessionHeaderDark: { backgroundColor: BANNER_BG },
  sessionHeaderTan: { backgroundColor: TAN_BG },
  sessionHeaderTextLight: {
    fontSize: 8,
    fontFamily: 'Montserrat',
    fontWeight: 700,
    letterSpacing: 1,
    textAlign: 'center',
    color: '#ffffff',
  },
  sessionHeaderTextDark: {
    fontSize: 8,
    fontFamily: 'Montserrat',
    fontWeight: 700,
    letterSpacing: 1,
    textAlign: 'center',
    color: '#4d4b4b',
  },
  sessionBody: { flexDirection: 'row', padding: 7 },
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
    fontSize: 8,
    fontFamily: 'Nunito',
    fontWeight: 700,
    color: '#111827',
    marginBottom: 1,
  },
  sessionSubQuestion: {
    fontSize: 7,
    fontFamily: 'Montserrat',
    fontStyle: 'italic',
    color: '#6b7280',
    marginBottom: 3,
  },

  sessionGoal: { fontSize: 8, marginBottom: 3, lineHeight: 1.2 },
  italicBold: { fontFamily: 'Montserrat', fontStyle: 'italic', fontWeight: 700 },
  bold: { fontFamily: 'Nunito', fontWeight: 700 },
  dateLine: { fontSize: 8, marginBottom: 5 },
  fieldLabel: {
    fontSize: 7,
    fontFamily: 'Nunito',
    fontWeight: 700,
    color: '#111827',
    marginTop: 3,
    marginBottom: 2,
  },
  fieldHint: { fontFamily: 'Montserrat', fontWeight: 400, fontStyle: 'italic', color: '#6b7280' },
  blankLine: {
    borderBottomWidth: 0.5,
    borderBottomColor: '#9ca3af',
    height: 9,
    marginBottom: 1,
  },

  masteredRow: { flexDirection: 'row', marginTop: 3 },
  masteredPill: {
    flex: 1,
    backgroundColor: TAN_BG,
    borderWidth: 0.75,
    borderColor: '#b7b7b7',
    paddingVertical: 5,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  masteredPillLeft: { marginRight: 1 },
  radioCircle: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    borderWidth: 1,
    borderColor: '#374151',
    marginRight: 5,
  },
  masteredPillText: {
    fontSize: 8,
    fontFamily: 'Montserrat',
    fontWeight: 700,
    letterSpacing: 0.5,
    color: '#374151',
  },
  videosBox: { paddingLeft: 12 },
  footerNote: { fontFamily: 'Montserrat', fontStyle: 'italic', fontSize: 9, color: '#4b5563' },
})

const Checkbox = ({ label }: { label: string }) => (
  <View style={styles.checkboxRow}>
    <View style={styles.checkboxBox} />
    <Text style={styles.checkboxLabel}>{label}</Text>
  </View>
)

const QrVideoColumn = ({ qrVideos }: { qrVideos: QrVideo[] }) => {
  if (!qrVideos || qrVideos.length === 0) return null

  return (
    <View style={styles.videosBox} wrap={false}>
      <Text style={styles.strategyLabel}>VIDEOS:</Text>
      <View style={styles.qrColumn}>
        {qrVideos.map((video, i) => (
          <View
            key={video.category}
            style={i > 0 ? [styles.qrItem, styles.qrItemSpacer] : styles.qrItem}>
            <Image style={styles.qrImage} src={video.dataUri} />
            <Text style={styles.qrCaption}>{video.title}</Text>
          </View>
        ))}
      </View>
    </View>
  )
}

const HOW_DID_THEY_DO_ITEMS = [
  'Cannot say the sound at all',
  'Can say the sound (but not in words)',
  'Can say the sound in most words (with adult help)',
  'Can say the sound in most words (no adult help)',
]

const ErrorTable = ({
  title,
  errors,
  variant,
}: {
  title: string
  errors: TableError[]
  variant?: 'level1' | 'level2'
}) => {
  const titleStyle =
    variant === 'level1'
      ? [styles.sectionTitle, styles.sectionTitleLevel1]
      : variant === 'level2'
        ? [styles.sectionTitle, styles.sectionTitleLevel2]
        : styles.sectionTitle
  const headerCellStyle =
    variant === 'level1'
      ? [styles.tableHeaderCell, styles.tableHeaderCellLevel1]
      : variant === 'level2'
        ? [styles.tableHeaderCell, styles.tableHeaderCellLevel2]
        : styles.tableHeaderCell

  return (
    <>
      <Text style={titleStyle}>{title}</Text>
      <View style={styles.table}>
        <View style={styles.tableRow} wrap={false}>
          <Text style={headerCellStyle}>ERROR SOUND</Text>
          <Text style={headerCellStyle}>ERROR PATTERN EXHIBITED</Text>
          <Text style={headerCellStyle}>EXAMPLE</Text>
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
}

const GoalWorksheetPage = ({ studentName, error }: { studentName: string; error: GoalError }) => (
  <Page size='LETTER' style={styles.page}>
    <ReportBanner title='Goal Sheets' />

    <View style={styles.body}>
      <Text style={styles.studentLine}>STUDENT: {studentName}</Text>

      <View style={styles.soundStrategyRow} wrap={false}>
        <View style={styles.soundBox}>
          <Text style={styles.soundLabel}>SOUND:</Text>
          <Text style={styles.soundValue}>{error.sound}</Text>
        </View>
        <View style={styles.strategyBox}>
          <View style={styles.strategyChecklistCol}>
            <Text style={styles.strategyLabel}>STRATEGIES:</Text>
            <View style={styles.strategyChecklistColsRow}>
              {chunkStrategyItems(getStrategyItems(error)).map((chunk, i) => (
                <View key={i} style={styles.strategyChecklistSubCol}>
                  {chunk.map(item => (
                    <Checkbox key={item} label={item} />
                  ))}
                </View>
              ))}
            </View>
          </View>
          <QrVideoColumn qrVideos={error.qrVideos} />
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

                {error.stimulability_option === 'non-stimulable' ? (
                  <>
                    Student will identify correct <Text style={styles.bold}>{error.sound}</Text>{' '}
                    with 90% accuracy when listening to adult say contrast pairs.
                  </>
                ) : (
                  <>
                    Student will say <Text style={styles.bold}>{error.sound}</Text> at the{' '}
                    <Text style={styles.bold}>{error.stimulability_option}</Text> level with 90%
                    accuracy.
                  </>
                )}
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

    <ReportFooter brand='NORTHERN VOICES SPEECH SERVICES' />
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

          {context.level_1_table_errors || context.level_2_table_errors ? (
            <>
              {(context.level_1_table_errors?.length ?? 0) > 0 && (
                <ErrorTable
                  title={
                    context.level === 2 ? 'SOUNDS COMPLETED IN LEVEL 1' : 'SOUND ERRORS (LEVEL 1)'
                  }
                  errors={context.level_1_table_errors!}
                  variant='level1'
                />
              )}

              {(context.level_2_table_errors?.length ?? 0) > 0 && (
                <ErrorTable
                  title={context.level === 1 ? 'UPON MASTERY OF LEVEL 1' : 'SOUND ERRORS (LEVEL 2)'}
                  errors={context.level_2_table_errors!}
                  variant='level2'
                />
              )}
            </>
          ) : (
            <>
              {context.primary_table_errors?.length > 0 && (
                <ErrorTable
                  title={
                    context.level
                      ? `SOUND ERRORS (LEVEL ${context.level})`
                      : 'SOUND ERRORS (CYCLE 1)'
                  }
                  errors={context.primary_table_errors}
                />
              )}

              {context.secondary_table_errors?.length > 0 && (
                <ErrorTable
                  title='SOUND ERRORS (CYCLE 2)'
                  errors={context.secondary_table_errors}
                />
              )}
            </>
          )}
        </View>

        <ReportFooter brand='NORTHERN VOICES SPEECH SERVICES' />
      </Page>

      {worksheetErrors.map((error, i) => (
        <GoalWorksheetPage key={i} studentName={context.student_name} error={error} />
      ))}
    </Document>
  )
}

export default SpeechGoalSheetPdf
