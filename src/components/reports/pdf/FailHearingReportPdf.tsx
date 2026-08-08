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

const SIGNS_LIST = [
  'Trouble understanding or following instructions',
  'Unclear speech',
  'Not responding to name or environmental sounds',
  'Frequent requests for repetition (e.g., saying, "What?" or "Huh?")',
  'Complaints of ear pain, ringing, or noises in the ear(s)',
  'Turning up the volume on the TV or music devices',
  'Speaking loudly or watching lips closely when listening to others',
  'Challenges with reading or academic progress',
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
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 14 },
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

const FailHearingReportPdf = ({ data }: { data: HearingReportData }) => {
  const { context } = data

  return (
    <Document>
      <Page size='LETTER' style={styles.page}>
        <ReportHeader />

        <Text style={styles.title}>HEARING SCREEN REPORT</Text>

        <View style={styles.infoRow}>
          <Text>Student: {context.student_name}</Text>
          <Text>Date: {context.date_of_screening}</Text>
        </View>

        <Text style={styles.label}>DEAR PARENT(S)/GUARDIAN(S):</Text>
        <Text style={styles.paragraph}>
          Class-wide hearing screenings were recently administered at the school, and the
          tympanometry test showed that your child's results{' '}
          <Text style={styles.bold}>fell outside the expected range</Text>, indicating a need for
          further evaluation. This does not necessarily mean your child has hearing difficulties;
          however, we recommend follow-up with an audiologist and/or family physician to rule out
          potential ear infections or hearing issues. Please provide a copy of the screening results
          to your chosen service provider for their review and consideration during your child's
          evaluation.
        </Text>

        <Text style={styles.paragraph}>
          Please note: hearing screens should not replace regular audiological check-ups. They serve
          to identify children who may require further assessment. If at any point you have concerns
          about your child's hearing, we strongly advise discussing these with your doctor and/or
          requesting a hearing evaluation with an audiologist. It is important to have your child's
          hearing tested regularly— even a slight or temporary hearing loss due to wax build-up or
          an ear infection can significantly impact a child's speech, language, and ability to
          learn.
        </Text>

        <Text style={styles.label}>Signs That May Suggest Hearing Difficulties:</Text>
        {SIGNS_LIST.map((sign, i) => (
          <View style={styles.listItem} key={i}>
            <Text style={styles.bullet}>•</Text>
            <Text style={styles.listText}>{sign}</Text>
          </View>
        ))}

        <Text style={[styles.paragraph, { marginTop: 10 }]}>
          If you have any concerns or would like guidance on what to do next, please do not hesitate
          to reach out to us or your school. Your child's success and well-being are our top
          priorities, and we're here to help!
        </Text>

        <Text style={styles.signature}>L. Brillinger</Text>
        <Text style={styles.signatureLine}>Lisa Brillinger | CEO NVSS</Text>
        <Text style={styles.signatureLine}>Speech Language Pathologist</Text>
        <Text style={styles.signatureLine}>License Number: 1595</Text>
        <Text style={styles.signatureLine}>lbrillinger@northern-voices.ca</Text>
        <Text style={styles.signatureLine}>www.northern-voices.ca</Text>

        <ReportFooter page={1} of={2} brand='NORTHERN VOICES SPEECH SERVICES' />
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

        <ReportFooter page={2} of={2} brand='NORTHERN VOICES SPEECH SERVICES' />
      </Page>
    </Document>
  )
}

export default FailHearingReportPdf
