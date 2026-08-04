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

interface StudentUpdate {
  student_name: string
  sessions_attended: number
  meeting_notes: string
  is_sub: boolean
}

interface MonthlyMeetingReportData {
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
  body: { paddingHorizontal: 48, paddingTop: 20 },

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
    <Text style={styles.bannerTitle}>Meeting Notes</Text>
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

const MonthlyMeetingReportPdf = ({ data }: { data: MonthlyMeetingReportData }) => {
  const { context } = data
  const attendeesText = (context.attendees ?? []).join(', ')

  return (
    <Document>
      <Page>
        <ReportBanner />

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

        <ReportFooter />
      </Page>
    </Document>
  )
}

export default MonthlyMeetingReportPdf
