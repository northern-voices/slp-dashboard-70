import { Document, Page, View, Text, StyleSheet } from '@react-pdf/renderer'
import { ReportBanner, ReportFooter } from './shared/reportBannerChrome'

interface StudentUpdate {
  student_name: string
  sessions_attended: number
  meeting_notes: string
  is_sub: boolean
}

interface ProgressCheckinMeetingData {
  context: {
    meeting_title: string
    facilitator_name: string
    school: string
    meeting_date: string
    attendees: string[]
    has_student_updates: boolean
    student_updates: StudentUpdate[]
    has_additional_notes: boolean
    additional_notes: string
    has_action_plan: boolean
    action_plan: string
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
  body: { paddingHorizontal: 48 },

  infoLine: { marginBottom: 8, fontSize: 11 },
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
  colStudent: { flex: 1 },
  colSessions: { flex: 0.6 },
  colNotes: { flex: 2 },

  sectionLabel: {
    fontFamily: 'Nunito',
    fontWeight: 700,
    fontSize: 11,
    color: '#111827',
    marginBottom: 3,
    marginTop: 8,
  },
  sectionText: { fontSize: 10, color: '#374151', lineHeight: 1.4, marginBottom: 8 },
})

const ProgressCheckinMeetingPdf = ({ data }: { data: ProgressCheckinMeetingData }) => {
  const { context } = data
  const attendeesText = (context.attendees ?? []).join(', ')

  return (
    <Document>
      <Page size='LETTER' style={styles.page}>
        <ReportBanner title='Meeting Notes' />

        <View style={styles.body}>
          <Text style={styles.infoLine}>
            <Text style={styles.infoLabel}>Meeting Title: </Text>
            {context.meeting_title}
          </Text>
          <Text style={styles.infoLine}>
            <Text style={styles.infoLabel}>Facilitator: </Text>
            {context.facilitator_name}
          </Text>
          <Text style={styles.infoLine}>
            <Text style={styles.infoLabel}>Date: </Text>
            {context.meeting_date}
          </Text>
          <Text style={styles.infoLine}>
            <Text style={styles.infoLabel}>School: </Text>
            {context.school}
          </Text>
          <Text style={styles.infoLine}>
            <Text style={styles.infoLabel}>Attendees: </Text>
            {attendeesText}
          </Text>

          {context.has_student_updates && context.student_updates?.length > 0 && (
            <>
              <Text style={styles.sectionTitle}>Student Notes</Text>
              <View style={styles.table}>
                <View style={styles.tableRow} wrap={false}>
                  <Text style={[styles.tableHeaderCell, styles.colStudent]}>STUDENT</Text>
                  <Text style={[styles.tableHeaderCell, styles.colSessions]}>
                    SESSIONS ATTENDED
                  </Text>
                  <Text style={[styles.tableHeaderCell, styles.colNotes]}>STUDENT NOTES</Text>
                </View>
                {context.student_updates.map((update, i) => (
                  <View style={styles.tableRow} key={i} wrap={false}>
                    <Text style={[styles.tableCell, styles.colStudent]}>
                      {update.student_name}
                      {update.is_sub ? ' (Sub)' : ''}
                    </Text>
                    <Text style={[styles.tableCell, styles.colSessions]}>
                      {update.sessions_attended}
                    </Text>
                    <Text style={[styles.tableCell, styles.colNotes]}>{update.meeting_notes}</Text>
                  </View>
                ))}
              </View>
            </>
          )}

          {context.has_additional_notes && (
            <View>
              <Text style={styles.sectionLabel}>Meeting Notes:</Text>
              <Text style={styles.sectionText}>{context.additional_notes}</Text>
            </View>
          )}

          {context.has_action_plan && (
            <View>
              <Text style={styles.sectionLabel}>Action Plan:</Text>
              <Text style={styles.sectionText}>{context.action_plan}</Text>
            </View>
          )}
        </View>

        <ReportFooter brand='NORTHERN VOICES SPEECH SERVICES' />
      </Page>
    </Document>
  )
}

export default ProgressCheckinMeetingPdf
