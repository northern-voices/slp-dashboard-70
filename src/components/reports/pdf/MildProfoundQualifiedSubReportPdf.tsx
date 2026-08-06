import { Document, Page, View, Text, Image, StyleSheet, Font } from '@react-pdf/renderer'
import { DEVELOPMENTAL_CHART } from '@/constants/developmentalSpeechChart'

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

interface ProcessedError {
  sound: string
  pattern: string
  example: string
  targetSound: string
}

interface MildProfoundQualifiedSubReportData {
  context: {
    student_name: string
    date_of_screening: string
    grade: string
    school: string
    errors: ProcessedError[]
  }
}

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
  subtitle: {
    fontSize: 11,
    fontFamily: 'Nunito',
    fontWeight: 700,
    color: '#6b7280',
    textAlign: 'center',
    letterSpacing: 0.5,
    marginBottom: 20,
  },
  label: {
    fontFamily: 'Nunito',
    fontWeight: 700,
    color: '#111827',
    marginBottom: 3,
    fontSize: 11,
  },
  introParagraph: { lineHeight: 1, letterSpacing: -0.5, marginBottom: 6, color: '#374151' },
  paragraph: { lineHeight: 1.2, marginBottom: 14, color: '#374151' },
  bold: { fontFamily: 'Nunito', fontWeight: 700 },
  italic: { fontFamily: 'Montserrat', fontStyle: 'italic' },
  infoBlock: { marginBottom: 14 },
  infoLine: { marginBottom: 1 },
  table: { marginBottom: 8 },
  tableRow: { flexDirection: 'row' },
  tableHeaderCell: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#d1d5db',
    backgroundColor: '#f9fafb',
    padding: 6,
    fontSize: 8,
    fontFamily: 'Montserrat',
    fontWeight: 700,
    textAlign: 'center',
  },
  tableCell: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#d1d5db',
    padding: 6,
    fontSize: 9,
    textAlign: 'center',
  },
  formHeaderRow: { flexDirection: 'row', marginBottom: 16 },
  formHeaderField: { flexDirection: 'row', alignItems: 'flex-end', flex: 1, marginRight: 16 },
  formUnderline: {
    flex: 1,
    borderBottomWidth: 1,
    borderBottomColor: '#000000',
    marginLeft: 4,
    height: 12,
  },
  checkboxRow: { flexDirection: 'row', alignItems: 'center', marginTop: 10, marginBottom: 16 },
  checkboxBox: { width: 9, height: 9, borderWidth: 1, borderColor: '#000000', marginRight: 6 },
  checkboxLabel: { fontSize: 10, color: '#374151' },
  signatureRow: { flexDirection: 'row', marginTop: 20, marginBottom: 3 },
  signatureLine: {
    flex: 1,
    borderBottomWidth: 1,
    borderBottomColor: '#000000',
    height: 16,
    marginRight: 24,
  },
  signatureLabelRow: { flexDirection: 'row', marginBottom: 14 },
  signatureLabel: { flex: 1, fontSize: 9, color: '#374151', marginRight: 24 },
  consentAttainedBlock: { alignItems: 'flex-end', marginTop: 18 },
  consentAttainedLabel: {
    fontSize: 10,
    fontFamily: 'Nunito',
    fontWeight: 700,
    marginBottom: 4,
    color: '#111827',
  },
  consentAttainedRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 3 },
  consentAttainedLine: {
    width: 28,
    borderBottomWidth: 1,
    borderBottomColor: '#000000',
    marginRight: 6,
    height: 10,
  },
  consentAttainedText: { fontSize: 9, color: '#374151' },
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

const ReportHeader = () => (
  <View style={styles.headerRow} fixed>
    <Image src='/icon.png' style={styles.logo} />
    <View>
      <Text style={styles.headerBrand}>NORTHERN VOICES</Text>
      <Text style={styles.headerSub}>SPEECH SERVICES</Text>
    </View>
  </View>
)

const ReportFooter = () => (
  <View style={styles.footer} fixed>
    <Text>NORTHERN VOICES SPEECH SERVICES</Text>
    <View style={styles.footerPage}>
      <Image src='/icon.png' style={styles.footerLogo} />
      <Text render={({ pageNumber, totalPages }) => `${pageNumber} of ${totalPages + 1}`} />
    </View>
  </View>
)

const MildProfoundQualifiedSubReportPdf = ({
  data,
}: {
  data: MildProfoundQualifiedSubReportData
}) => {
  const { context } = data

  return (
    <Document>
      <Page size='LETTER' style={styles.page}>
        <ReportHeader />

        <Text style={styles.title}>SPEECH SCREEN REPORT</Text>

        <Text style={styles.label}>DEAR PARENT(S)/GUARDIAN(S):</Text>
        <Text style={styles.introParagraph}>
          A speech and language pathologist (SLP) recently conducted speech screens at your child's
          school. This report outlines your child's results and provides guidance on steps you can
          take to further support your child's speech development.
        </Text>

        <Text style={styles.label}>SPEECH SCREEN REPORT:</Text>
        <View style={styles.infoBlock}>
          <Text style={styles.infoLine}>Student's Name: {context.student_name}</Text>
          <Text style={styles.infoLine}>Grade: {context.grade}</Text>
          <Text style={styles.infoLine}>Date of Screening: {context.date_of_screening}</Text>
        </View>

        {context.errors.length === 0 ? (
          <Text style={styles.paragraph}>
            No speech sound errors were identified in this screening.
          </Text>
        ) : (
          <View style={styles.table}>
            <View style={styles.tableRow} wrap={false}>
              <Text style={styles.tableHeaderCell}>ERROR SOUND</Text>
              <Text style={styles.tableHeaderCell}>ERROR PATTERN EXHIBITED</Text>
              <Text style={styles.tableHeaderCell}>EXAMPLE</Text>
            </View>
            {context.errors.map((error, i) => (
              <View style={styles.tableRow} key={i} wrap={false}>
                <Text style={styles.tableCell}>{error.targetSound || error.sound}</Text>
                <Text style={styles.tableCell}>{error.pattern}</Text>
                <Text style={styles.tableCell}>{error.example}</Text>
              </View>
            ))}
          </View>
        )}

        <ReportFooter />
      </Page>

      <Page size='LETTER' style={styles.page}>
        <ReportHeader />

        <Text style={styles.label}>DEVELOPMENTAL SPEECH SOUND CHART:</Text>
        <Text style={styles.paragraph}>
          This chart provides a general guideline for when children typically develop and master
          specific speech sounds. It's important to start practicing these sounds before the age of
          expected mastery to proactively address any potential speech difficulties.
        </Text>

        <View style={styles.table}>
          <View style={styles.tableRow} wrap={false}>
            <Text style={styles.tableHeaderCell}>AGE RANGE</Text>
            <Text style={styles.tableHeaderCell}>DEVELOPING SOUNDS</Text>
            <Text style={styles.tableHeaderCell}>EXPECTED MASTERY</Text>
          </View>
          {DEVELOPMENTAL_CHART.map(row => (
            <View style={styles.tableRow} key={row.ageRange} wrap={false}>
              <Text style={styles.tableCell}>{row.ageRange}</Text>
              <Text style={styles.tableCell}>{row.sounds}</Text>
              <Text style={styles.tableCell}>{row.mastery}</Text>
            </View>
          ))}
        </View>

        <Text style={styles.paragraph}>
          Remember, every child is unique in their development. The above chart serves as a
          general guide.
        </Text>

        <ReportFooter />
      </Page>

      <Page size='LETTER' style={styles.page}>
        <ReportHeader />

        <Text style={styles.title}>SCHOOL SPEECH PROGRAM</Text>

        <Text style={styles.paragraph}>
          Your child is welcome to participate in the{' '}
          <Text style={styles.italic}>Northern Voices Speech Services</Text> (NVSS) program at the
          school to assist them with their speech development. This is an important step towards
          enhancing your child's communication abilities. Early intervention is key to improving
          speech outcomes, and our team is dedicated to supporting your child's progress!
        </Text>

        <Text style={styles.paragraph}>
          Many people know that speech sound disorders can affect a child's ability to be
          understood by others, but what they might not realize are the long-term consequences that
          can occur when they are left untreated. Communication difficulties can profoundly impact
          social behaviour, self-esteem, relationships, literacy, learning, and overall academic
          performance. In fact, the ability to communicate effectively is the very foundation of a
          child's overall development and academic achievement, and early intervention is crucial!
          The earlier support can be provided, the better the outcome.
        </Text>

        <Text style={styles.paragraph}>
          Students involved in the NVSS school speech program will participate in one-on-one
          sessions with an Educational Assistant who has received extensive training to help
          children enhance their speech. Sessions will follow an individualized therapy program
          developed by the Speech Language Pathologist.
        </Text>

        <ReportFooter />
      </Page>

      <Page size='LETTER' style={styles.page}>
        <ReportHeader />

        <Text style={styles.title}>INFORMED CONSENT</Text>
        <Text style={styles.subtitle}>PARTICIPATING IN THE SCHOOL SPEECH PROGRAM</Text>

        <View style={styles.formHeaderRow}>
          <View style={styles.formHeaderField}>
            <Text>Student:</Text>
            <View style={styles.formUnderline} />
          </View>
          <View style={styles.formHeaderField}>
            <Text>School:</Text>
            <View style={styles.formUnderline} />
          </View>
        </View>

        <Text style={styles.label}>DEAR PARENT(S) / GUARDIANS(S):</Text>
        <Text style={styles.paragraph}>
          Your child is eligible to receive speech services through the{' '}
          <Text style={styles.bold}>Northern Voices Speech Services</Text> School Program at
          school. If you agree to your child receiving these services, please sign below.
        </Text>

        <Text style={styles.paragraph}>
          <Text style={styles.bold}>SPEECH SCREEN RESULTS | </Text>
          The results of a recent speech screen administered at the school indicated that your
          child demonstrated some difficulties with certain speech sounds and may benefit from
          targeted practice with a trained adult. Please see the attached report for details
          outlining specific speech errors identified.
        </Text>

        <Text style={styles.paragraph}>
          <Text style={styles.bold}>PROGRAM | </Text>
          The speech program is designed to provide opportunities for your child to practice their
          speech sounds to help them strengthen their communication skills. Improvements in speech
          may also support growth in literacy and academic learning, while also encouraging
          confidence and positive social interactions.
        </Text>

        <Text style={styles.paragraph}>
          Students involved in the Northern Voices Speech Program will participate in one-on-one
          speech practice sessions ran by a trained Educational Assistant (working under the
          guidance of the contracted speech-language pathologist). Frequency of sessions will
          depend on severity of speech difficulties. Your child's student plan would be developed
          by the Speech Therapist, and tailored to your child's speech screen results.
        </Text>

        <Text style={styles.paragraph}>
          You may request a copy of your child's speech practice plan or progress updates at any
          time. Any personal information collected is kept confidential and will only be shared
          with those directly involved in your child's educational program, in line with privacy
          legislation and professional standards of practice. Participation in the program is
          voluntary, and you may withdraw your consent at any time by notifying the school.
        </Text>

        <Text style={styles.label}>CONSENT</Text>
        <Text style={styles.paragraph}>
          I have read the information above and understand the purpose and process of the NVSS
          school speech program:
        </Text>

        <View style={styles.checkboxRow}>
          <View style={styles.checkboxBox} />
          <Text style={styles.checkboxLabel}>
            I consent to my child participating in the NVSS school speech program.
          </Text>
        </View>

        <View style={styles.signatureRow}>
          <View style={styles.signatureLine} />
          <View style={styles.signatureLine} />
        </View>
        <View style={styles.signatureLabelRow}>
          <Text style={styles.signatureLabel}>Parent/Caregiver Name</Text>
          <Text style={styles.signatureLabel}>Child's Name</Text>
        </View>

        <View style={styles.signatureRow}>
          <View style={styles.signatureLine} />
          <View style={styles.signatureLine} />
        </View>
        <View style={styles.signatureLabelRow}>
          <Text style={styles.signatureLabel}>Parent/Caregiver Signature</Text>
          <Text style={styles.signatureLabel}>Date</Text>
        </View>

        <View style={styles.consentAttainedBlock}>
          <Text style={styles.consentAttainedLabel}>Consent Attained:</Text>
          <View style={styles.consentAttainedRow}>
            <View style={styles.consentAttainedLine} />
            <Text style={styles.consentAttainedText}>In Person</Text>
          </View>
          <View style={styles.consentAttainedRow}>
            <View style={styles.consentAttainedLine} />
            <Text style={styles.consentAttainedText}>By Phone</Text>
          </View>
          <View style={styles.consentAttainedRow}>
            <View style={styles.consentAttainedLine} />
            <Text style={styles.consentAttainedText}>By Video</Text>
          </View>
        </View>

        <ReportFooter />
      </Page>
    </Document>
  )
}

export default MildProfoundQualifiedSubReportPdf
