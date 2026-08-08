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
  ],
})

Font.register({
  family: 'Caveat',
  src: 'https://fonts.gstatic.com/s/caveat/v18/WnznHAc5bAfYB2QRah7pcpNvOx-pjfJ9SIKih_a2wg.ttf',
})

import { ReportHeader, ReportFooter } from './shared/reportSimpleChrome'

interface HearingReportData {
  context: {
    student_name: string
    date_of_screening: string
    grade: string
  }
}

const STAFF_SIGNS_LIST = [
  'Trouble understanding or following conversations',
  'Difficulty hearing in noisy environments',
  'Frequently asking others to repeat themselves',
  'Turning up the volume on devices',
  'Ringing or noises in the ear(s)',
  'Speaking loudly or straining to hear others',
]

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
  dateLine: { marginBottom: 14, fontSize: 11, color: '#374151' },
  greeting: { marginBottom: 10, fontSize: 11, color: '#374151' },
  label: {
    fontFamily: 'Nunito',
    fontWeight: 700,
    color: '#111827',
    marginBottom: 3,
    fontSize: 11,
  },
  paragraph: { lineHeight: 1.2, marginBottom: 10, color: '#374151' },
  bold: { fontFamily: 'Nunito', fontWeight: 700 },
  listItem: { flexDirection: 'row', marginBottom: 3 },
  bullet: { width: 12, fontSize: 11 },
  listText: { flex: 1, lineHeight: 1.2 },
  signature: {
    fontFamily: 'Caveat',
    fontSize: 22,
    color: '#111827',
    marginBottom: 4,
    marginTop: 10,
  },
  signatureLine: { fontSize: 10, color: '#374151', marginBottom: 1 },
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

const PassStaffHearingReportPdf = ({ data }: { data: HearingReportData }) => {
  const { context } = data

  return (
    <Document>
      <Page size='LETTER' style={styles.page}>
        <ReportHeader />

        <Text style={styles.title}>HEARING SCREEN REPORT</Text>

        <Text style={styles.dateLine}>Date: {context.date_of_screening}</Text>

        <Text style={styles.greeting}>Dear {context.student_name},</Text>

        <Text style={styles.paragraph}>
          Your hearing screening results showed that your hearing fell{' '}
          <Text style={styles.bold}>within the expected range</Text>, with no concerns observed.
        </Text>

        <Text style={styles.paragraph}>
          Please note that hearing screens are a general tool to identify potential concerns and are
          not a substitute for comprehensive audiological assessments. We encourage you to continue
          attending regular hearing evaluations with your healthcare provider, especially if you
          notice changes in your hearing.
        </Text>

        <Text style={styles.label}>Signs That May Suggest Hearing Difficulties:</Text>
        {STAFF_SIGNS_LIST.map((sign, i) => (
          <View style={styles.listItem} key={i}>
            <Text style={styles.bullet}>•</Text>
            <Text style={styles.listText}>{sign}</Text>
          </View>
        ))}

        <Text style={[styles.paragraph, { marginTop: 10 }]}>
          If you experience any of these signs or have concerns about your hearing in the future, we
          encourage you to consult an audiologist and/or physician.
        </Text>

        <Text style={styles.paragraph}>
          Thank you for your participation and commitment to your health and well-being!
        </Text>

        <Text style={styles.signature}>L. Brillinger</Text>
        <Text style={styles.signatureLine}>Lisa Brillinger | CEO NVSS</Text>
        <Text style={styles.signatureLine}>Speech Language Pathologist</Text>
        <Text style={styles.signatureLine}>License Number: 1595</Text>
        <Text style={styles.signatureLine}>lbrillinger@northern-voices.ca</Text>
        <Text style={styles.signatureLine}>www.northern-voices.ca</Text>

        <ReportFooter brand='NORTHERN VOICES SPEECH SERVICES' />
      </Page>
    </Document>
  )
}

export default PassStaffHearingReportPdf
