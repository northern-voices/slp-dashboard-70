import { Document, Page, View, Text, StyleSheet } from '@react-pdf/renderer'
import { ReportBanner, ReportFooter } from './shared/reportBannerChrome'

interface CoachingCallSchoolSummaryData {
  context: {
    meeting_title: string
    facilitator_name: string
    school: string
    meeting_date: string
    attendees: string[]
    has_topics: boolean
    topics: string
    has_visit_purpose: boolean
    school_visit_purpose: string
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

const CoachingCallSchoolSummaryPdf = ({ data }: { data: CoachingCallSchoolSummaryData }) => {
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

          {context.has_topics && (
            <View>
              <Text style={styles.sectionLabel}>Topics Discussed:</Text>
              <Text style={styles.sectionText}>{context.topics}</Text>
            </View>
          )}

          {context.has_visit_purpose && (
            <View>
              <Text style={styles.sectionLabel}>Visit Purpose:</Text>
              <Text style={styles.sectionText}>{context.school_visit_purpose}</Text>
            </View>
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

export default CoachingCallSchoolSummaryPdf
