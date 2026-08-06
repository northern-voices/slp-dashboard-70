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

interface HearingReportData {
  context: {
    student_name: string
    date_of_screening: string
    grade: string
    left_ear_volume_ml?: string
    left_ear_compliance_ml?: string
    left_ear_press_dapa?: string
    left_ear_volume_result?: string
    left_ear_compliance_result?: string
    left_ear_press_result?: string
    right_ear_volume_ml?: string
    right_ear_compliance_ml?: string
    right_ear_press_dapa?: string
    right_ear_volume_result?: string
    right_ear_compliance_result?: string
    right_ear_press_result?: string
    left_ear_result?: string
    right_ear_result?: string
    referral_notes?: string
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
  table: { marginBottom: 14 },
  tableRow: { flexDirection: 'row' },
  tableHeaderCell: {
    borderWidth: 0.75,
    borderColor: '#000000',
    backgroundColor: '#f2f2f2',
    padding: 6,
    fontSize: 8,
    fontFamily: 'Nunito',
    fontWeight: 700,
    textAlign: 'center',
  },
  tableCell: {
    borderWidth: 0.75,
    borderColor: '#000000',
    padding: 6,
    fontSize: 9,
    textAlign: 'center',
    color: '#374151',
  },
  notesBox: {
    borderWidth: 1,
    borderColor: '#000000',
    borderRadius: 3,
    padding: 8,
    minHeight: 80,
    marginTop: 4,
  },
})

const ReportHeader = () => (
  <View style={styles.headerRow} fixed>
    <Image src='/icon.png' style={styles.logo} />
    <View>
      <Text style={styles.headerBrand}>NORTHERN VOICES</Text>
      <Text style={styles.headerSub}>SPEECH SERVICES</Text>
    </View>
  </View>
)

const ReportFooter = ({ page, of }: { page: number; of: number }) => (
  <View style={styles.footer} fixed>
    <Text>NORTHERN VOICE SPEECH SERVICES</Text>
    <View style={styles.footerPage}>
      <Image src='/icon.png' style={styles.footerLogo} />
      <Text>
        {page} of {of}
      </Text>
    </View>
  </View>
)

const FailStaffHearingReportPdf = ({ data }: { data: HearingReportData }) => {
  const { context } = data

  return (
    <Document>
      <Page size='LETTER' style={styles.page}>
        <ReportHeader />

        <Text style={styles.title}>HEARING SCREEN REPORT</Text>

        <Text style={styles.dateLine}>Date: {context.date_of_screening}</Text>

        <Text style={styles.greeting}>Dear {context.student_name},</Text>

        <Text style={styles.paragraph}>
          Your hearing screening results{' '}
          <Text style={styles.bold}>fell outside the expected range</Text> indicating that further
          testing may be beneficial. These findings do not necessarily mean there are any hearing
          concerns; however, we strongly advise follow-up with an audiologist and/or family
          physician to rule out any potential ear-related issues. Please bring a copy of your
          screening results to your healthcare provider for review during your evaluation.
        </Text>

        <Text style={styles.paragraph}>
          Please note: screenings are a general tool used to identify potential concerns and should
          not replace full audiological evaluations. Early identification and management of hearing
          issues are important for overall health, communication, and quality of life.
        </Text>

        <Text style={styles.label}>Signs That May Suggest Hearing Difficulties:</Text>
        {STAFF_SIGNS_LIST.map((sign, i) => (
          <View style={styles.listItem} key={i}>
            <Text style={styles.bullet}>•</Text>
            <Text style={styles.listText}>{sign}</Text>
          </View>
        ))}

        <Text style={[styles.paragraph, { marginTop: 10 }]}>
          If you would like further guidance on next steps or have questions about your results,
          please do not hesitate to reach out. Your health and well-being are important to us, and
          we are here to assist you in any way we can.
        </Text>

        <Text style={styles.signature}>L. Brillinger</Text>
        <Text style={styles.signatureLine}>Lisa Brillinger | CEO NVSS</Text>
        <Text style={styles.signatureLine}>Speech Language Pathologist</Text>
        <Text style={styles.signatureLine}>License Number: 1595</Text>
        <Text style={styles.signatureLine}>lbrillinger@northern-voices.ca</Text>
        <Text style={styles.signatureLine}>www.northern-voices.ca</Text>

        <ReportFooter page={1} of={2} />
      </Page>

      <Page size='LETTER' style={styles.page}>
        <ReportHeader />

        <Text style={styles.title}>HEARING SCREENS</Text>

        <View style={styles.table}>
          <View style={styles.tableRow}>
            <Text style={[styles.tableHeaderCell, { flex: 0.8 }]}></Text>
            <Text style={[styles.tableHeaderCell, { flex: 1.2 }]}>
              EAR CANAL VOLUME (.5 – 1.5 cm3)
            </Text>
            <Text style={[styles.tableHeaderCell, { flex: 1 }]}>PEAK (0.3 – 1.5 ml)</Text>
            <Text style={[styles.tableHeaderCell, { flex: 1 }]}>PEAK (+/- 200 daPa)</Text>
          </View>
          <View style={styles.tableRow}>
            <Text style={[styles.tableCell, { flex: 0.8, fontFamily: 'Nunito', fontWeight: 700 }]}>
              LEFT EAR
            </Text>
            <Text style={[styles.tableCell, { flex: 1.2 }]}>
              {context.left_ear_volume_ml} cm3 ({context.left_ear_volume_result})
            </Text>
            <Text style={[styles.tableCell, { flex: 1 }]}>
              {context.left_ear_compliance_ml} ml ({context.left_ear_compliance_result})
            </Text>
            <Text style={[styles.tableCell, { flex: 1 }]}>
              {context.left_ear_press_dapa} daPa ({context.left_ear_press_result})
            </Text>
          </View>
          <View style={styles.tableRow}>
            <Text style={[styles.tableCell, { flex: 0.8, fontFamily: 'Nunito', fontWeight: 700 }]}>
              RIGHT EAR
            </Text>
            <Text style={[styles.tableCell, { flex: 1.2 }]}>
              {context.right_ear_volume_ml} cm3 ({context.right_ear_volume_result})
            </Text>
            <Text style={[styles.tableCell, { flex: 1 }]}>
              {context.right_ear_compliance_ml} ml ({context.right_ear_compliance_result})
            </Text>
            <Text style={[styles.tableCell, { flex: 1 }]}>
              {context.right_ear_press_dapa} daPa ({context.right_ear_press_result})
            </Text>
          </View>
        </View>

        <Text style={styles.paragraph}>
          <Text style={styles.bold}>Left Ear:</Text> {context.left_ear_result}
        </Text>
        <Text style={styles.paragraph}>
          <Text style={styles.bold}>Right Ear:</Text> {context.right_ear_result}
        </Text>

        {context.referral_notes && (
          <>
            <Text style={styles.label}>Notes:</Text>
            <View style={styles.notesBox}>
              <Text>{context.referral_notes}</Text>
            </View>
          </>
        )}

        <ReportFooter page={2} of={2} />
      </Page>
    </Document>
  )
}

export default FailStaffHearingReportPdf
