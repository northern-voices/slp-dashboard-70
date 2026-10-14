import { Document, Page, View, Text, StyleSheet, Font } from '@react-pdf/renderer'
import { format } from 'date-fns'
import { ReportBanner, ReportFooter } from './shared/reportBannerChrome'
import { DYNAMIC_GOAL_SHEET_RATING_OPTIONS } from '@/constants/dynamicGoalSheet'
import type { DynamicGoalSheetSession } from '@/types/database'

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

interface DynamicGoalSheetPdfData {
  studentName: string
  goalText: string
  sessions: DynamicGoalSheetSession[]
}

const BANNER_BG = '#5b7a8b'
const TAN_BG = '#e9e2d9'
const SESSIONS_PER_PAGE = 3

const chunk = <T,>(items: T[], size: number): T[][] => {
  const chunks: T[][] = []
  for (let i = 0; i < items.length; i += size) {
    chunks.push(items.slice(i, i + size))
  }
  return chunks
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
  body: { paddingHorizontal: 48, paddingTop: 14 },
  studentLine: {
    fontSize: 11,
    fontFamily: 'Nunito',
    fontWeight: 700,
    color: '#111827',
    marginBottom: 10,
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
  checkboxBoxChecked: { backgroundColor: '#374151' },
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
  sessionText: { fontSize: 8, marginBottom: 3, lineHeight: 1.2 },
  italicBold: { fontFamily: 'Montserrat', fontStyle: 'italic', fontWeight: 700 },
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
})

const Checkbox = ({ label, checked }: { label: string; checked?: boolean }) => (
  <View style={styles.checkboxRow}>
    <View style={[styles.checkboxBox, checked ? styles.checkboxBoxChecked : undefined]} />
    <Text style={styles.checkboxLabel}>{label}</Text>
  </View>
)

const DynamicGoalSheetPdf = ({ data }: { data: DynamicGoalSheetPdfData }) => {
  const pages = chunk(data.sessions, SESSIONS_PER_PAGE)
  const pagesToRender = pages.length > 0 ? pages : [[]]

  return (
    <Document>
      {pagesToRender.map((pageSessions, pageIndex) => (
        <Page key={pageIndex} size='LETTER' style={styles.page}>
          <ReportBanner title='Goal Sheet' />

          <View style={styles.body}>
            <Text style={styles.studentLine}>STUDENT: {data.studentName}</Text>

            {pageSessions.map((session, i) => (
              <View key={session.id} style={styles.sessionCard} wrap={false}>
                <View
                  style={[
                    styles.sessionHeader,
                    i === 1 ? styles.sessionHeaderTan : styles.sessionHeaderDark,
                  ]}>
                  <Text
                    style={i === 1 ? styles.sessionHeaderTextDark : styles.sessionHeaderTextLight}>
                    SESSION {session.session_number}
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
                    {DYNAMIC_GOAL_SHEET_RATING_OPTIONS.map(option => (
                      <Checkbox
                        key={option.value}
                        label={option.label}
                        checked={session.sound_rating === option.value}
                      />
                    ))}
                  </View>
                  <View style={styles.sessionRight}>
                    <Text style={styles.sessionText}>
                      <Text style={styles.italicBold}>Goal: </Text>
                      {data.goalText}
                    </Text>
                    <Text style={styles.dateLine}>
                      Date:{' '}
                      {session.session_date
                        ? format(new Date(session.session_date), 'MMM d, yyyy')
                        : '______________________'}
                    </Text>

                    <Text style={styles.fieldLabel}>Activities</Text>
                    {session.activities ? (
                      <Text style={styles.sessionText}>{session.activities}</Text>
                    ) : (
                      <View style={styles.blankLine} />
                    )}

                    <Text style={styles.fieldLabel}>
                      Progress / Improvement{' '}
                      <Text style={styles.fieldHint}>
                        (Speech, confidence, social skills, language, vocabulary)
                      </Text>
                    </Text>
                    {session.progress_notes ? (
                      <Text style={styles.sessionText}>{session.progress_notes}</Text>
                    ) : (
                      <View style={styles.blankLine} />
                    )}

                    <Text style={styles.fieldLabel}>
                      Additional comments, questions, or concerns
                    </Text>
                    {session.additional_comments ? (
                      <Text style={styles.sessionText}>{session.additional_comments}</Text>
                    ) : (
                      <View style={styles.blankLine} />
                    )}
                  </View>
                </View>
              </View>
            ))}
          </View>

          <ReportFooter brand='NORTHERN VOICES SPEECH SERVICES' />
        </Page>
      ))}
    </Document>
  )
}

export default DynamicGoalSheetPdf
