import { Document, Page, View, Text, Image, StyleSheet, Font } from '@react-pdf/renderer'
import { DEVELOPMENTAL_CHART } from '@/constants/developmentalSpeechChart'
import { ReportHeader, ReportFooter } from './shared/reportSimpleChrome'

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

Font.register({
  family: 'Alex Brush',
  src: 'https://fonts.gstatic.com/s/alexbrush/v23/SZc83FzrJKuqFbwMKk6EtUI.ttf',
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
  label: {
    fontFamily: 'Nunito',
    fontWeight: 700,
    color: '#111827',
    marginBottom: 3,
    fontSize: 11,
  },
  introParagraph: { lineHeight: 1, letterSpacing: -0.5, marginBottom: 6, color: '#374151' },
  paragraph: { lineHeight: 1.2, marginBottom: 10, color: '#374151' },
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
  consentPage: {
    fontSize: 11,
    fontFamily: 'Nunito',
    color: '#374151',
    paddingBottom: 72,
  },
  consentBanner: {
    backgroundColor: '#55707C',
    paddingTop: 22,
    paddingBottom: 18,
    paddingLeft: 48,
    paddingRight: 48,
    marginBottom: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  consentBannerTitle: {
    fontSize: 22,
    fontFamily: 'Gotu',
    color: '#ffffff',
    lineHeight: 1.3,
  },
  consentBannerBrandRow: { flexDirection: 'row', alignItems: 'center' },
  consentBannerLogo: { width: 28, height: 28, marginRight: 8 },
  consentBannerBrand: { alignItems: 'flex-end' },
  consentBannerBrandText: {
    fontSize: 10,
    fontFamily: 'Nunito',
    fontWeight: 700,
    letterSpacing: 1,
    color: '#ffffff',
  },
  consentBannerBrandSub: {
    fontSize: 6,
    fontFamily: 'Montserrat',
    letterSpacing: 2,
    color: '#e5e7eb',
    marginTop: 2,
  },
  consentBody: { paddingLeft: 48, paddingRight: 48 },
  sectionBar: {
    backgroundColor: '#EFE6DB',
    borderRadius: 6,
    paddingTop: 6,
    paddingBottom: 6,
    paddingLeft: 10,
    paddingRight: 10,
    marginTop: 10,
    marginBottom: 8,
  },
  sectionBarText: {
    fontFamily: 'Nunito',
    fontWeight: 700,
    fontSize: 12,
    letterSpacing: 0.5,
    color: '#111827',
  },
  noteText: {
    fontFamily: 'Montserrat',
    fontStyle: 'italic',
    fontSize: 9,
    color: '#374151',
    marginBottom: 10,
    lineHeight: 1.3,
  },
  listItem: { flexDirection: 'row', marginBottom: 6 },
  bullet: { width: 12, fontSize: 11 },
  listText: { flex: 1, lineHeight: 1.3 },
  signature: {
    fontFamily: 'Alex Brush',
    fontSize: 26,
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

        <ReportFooter brand='NORTHERN VOICES SPEECH SERVICES' offset={1} />
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
          Remember, every child is unique in their development. The above chart serves as a general
          guide.
        </Text>

        <ReportFooter brand='NORTHERN VOICES SPEECH SERVICES' offset={1} />
      </Page>

      <Page size='LETTER' style={styles.page}>
        <ReportHeader />

        <Text style={styles.title}>SCHOOL SPEECH PROGRAM</Text>

        <Text style={[styles.paragraph, styles.bold]}>
          Your child is welcome to participate in the{' '}
          <Text style={styles.italic}>Northern Voices</Text> school speech program to support them
          with their speech development.
        </Text>

        <Text style={styles.paragraph}>
          Strong communication skills play a big role in confidence, relationships, classroom
          participation, literacy and learning. Providing early speech support gives children the
          opportunity to strengthen these skills in a supportive and encouraging environment. Our
          goal is to help your child improve their speech and strengthen their communication skills.
          We are excited to work with your child to support their progress!
        </Text>

        <Text style={styles.paragraph}>
          Students participating in the school speech program will take part in one-on-one speech
          practice sessions with a trained adult. Each child will follow an individualized speech
          plan developed and overseen by a Speech-Language Pathologist, with activities tailored to
          their specific speech needs. This gives your child opportunities to practise their speech
          skills and build confidence in their communication.
        </Text>

        <Text style={styles.paragraph}>
          The frequency of speech practice sessions may vary throughout the school year based on
          your child's individual needs, the size of the school's speech caseload, and staff
          availability. Some students may participate in regular weekly sessions, while others may
          receive periodic speech practice or support throughout the year. We encourage you to
          connect with your school team and/or the Speech-Language Pathologist at any time if you
          would like to learn more about your child's speech plan, session frequency, or progress.
        </Text>

        <Text style={[styles.paragraph, styles.bold]}>
          We look forward to supporting your child and celebrating their progress throughout the
          school year!
        </Text>

        <Text style={styles.signature}>L. Brillinger</Text>
        <Text style={styles.signatureLine}>Lisa Brillinger, M.Sc., SLP | Registered SK, ON</Text>
        <Text style={styles.signatureLine}>lbrillinger@northern-voices.ca</Text>
        <Text style={styles.signatureLine}>(306) 930-0009</Text>

        <ReportFooter brand='NORTHERN VOICES SPEECH SERVICES' offset={1} />
      </Page>

      <Page size='LETTER' style={styles.consentPage}>
        <View style={styles.consentBanner}>
          <Text style={styles.consentBannerTitle}>
            CONSENT TO PARTICIPATE IN{'\n'}THE SCHOOL SPEECH PROGRAM
          </Text>
          <View style={styles.consentBannerBrandRow}>
            <Image src='/icon.png' style={styles.consentBannerLogo} />
            <View style={styles.consentBannerBrand}>
              <Text style={styles.consentBannerBrandText}>NORTHERN VOICES</Text>
              <Text style={styles.consentBannerBrandSub}>SPEECH SERVICES</Text>
            </View>
          </View>
        </View>

        <View style={styles.consentBody}>
          <View style={styles.formHeaderRow}>
            <View style={styles.formHeaderField}>
              <Text>Child's Name:</Text>
              <View style={styles.formUnderline} />
            </View>
            <View style={styles.formHeaderField}>
              <Text>School:</Text>
              <View style={styles.formUnderline} />
            </View>
          </View>

          <Text style={styles.label}>Dear Parent / Caregiver,</Text>
          <Text style={styles.paragraph}>
            Your child is invited to receive additional speech support through the{' '}
            <Text style={styles.italic}>Northern Voices</Text> School Speech Program. Please
            review the information below before providing consent for your child to
            participate.
          </Text>

          <View style={styles.sectionBar}>
            <Text style={styles.sectionBarText}>SPEECH SCREEN RESULTS</Text>
          </View>
          <Text style={styles.paragraph}>
            A recent speech screen completed at your child's school identified speech sounds
            that may benefit from additional practice. Please refer to your child's speech
            screen report for more information about their individual results.
          </Text>
          <Text style={styles.noteText}>
            <Text style={[styles.bold, { fontStyle: 'normal' }]}>PLEASE NOTE: </Text>
            A speech screen is not a comprehensive speech-language assessment or diagnosis. If
            additional assessment or other services are recommended for your child, this will
            be discussed with you.
          </Text>

          <View style={styles.sectionBar}>
            <Text style={styles.sectionBarText}>SCHOOL SPEECH PROGRAM</Text>
          </View>
          <Text style={styles.paragraph}>
            Students participating in the <Text style={styles.italic}>Northern Voices</Text>{' '}
            School Speech Program take part in one-on-one speech practice sessions with a
            trained school staff member. Each child follows an individualized speech plan
            developed and overseen by a Speech-Language Pathologist, with activities tailored
            to their specific speech needs. Sessions follow a play-based model to help make
            learning fun!
          </Text>
          <Text style={styles.paragraph}>
            The frequency of speech practice sessions may vary throughout the school year based
            on your child's needs, the size of the school's speech caseload, and staff
            availability. Some students may participate in regular weekly sessions, while
            others may receive periodic speech practice throughout the year. Session frequency
            may change as your child's needs or the school's caseload changes.
          </Text>
          <Text style={styles.paragraph}>
            Your child's speech may also be re-screened or reviewed throughout the school year
            to monitor progress and help guide their speech plan.
          </Text>
          <Text style={styles.paragraph}>
            Every child progresses differently, and participation in the program does not
            guarantee a specific rate of improvement. Your child's willingness to participate
            will also be respected.
          </Text>
        </View>

        <ReportFooter brand='NORTHERN VOICES SPEECH SERVICES' offset={1} />
      </Page>

      <Page size='LETTER' style={styles.consentPage}>
        <View style={styles.consentBanner}>
          <Text style={styles.consentBannerTitle}>
            CONSENT TO PARTICIPATE IN{'\n'}THE SCHOOL SPEECH PROGRAM
          </Text>
          <View style={styles.consentBannerBrandRow}>
            <Image src='/icon.png' style={styles.consentBannerLogo} />
            <View style={styles.consentBannerBrand}>
              <Text style={styles.consentBannerBrandText}>NORTHERN VOICES</Text>
              <Text style={styles.consentBannerBrandSub}>SPEECH SERVICES</Text>
            </View>
          </View>
        </View>

        <View style={styles.consentBody}>
          <View style={styles.sectionBar}>
            <Text style={styles.sectionBarText}>SCHOOL SPEECH PROGRAM</Text>
          </View>
          <Text style={styles.paragraph}>
            If there is a significant change to the nature of the speech services being
            provided to your child, you will be informed and additional consent will be
            obtained where appropriate.
          </Text>
          <Text style={styles.paragraph}>
            We encourage you to connect with your school team and/or the Speech-Language
            Pathologist at any time if you have questions or would like to learn more about
            your child's speech plan, session frequency, or progress.
          </Text>

          <View style={styles.sectionBar}>
            <Text style={styles.sectionBarText}>PRIVACY & SHARING OF INFORMATION</Text>
          </View>
          <Text style={styles.paragraph}>
            To effectively provide and coordinate your child's speech program,{' '}
            <Text style={styles.italic}>Northern Voices</Text> may collect, use and retain
            information related to your child's speech development, screening results, speech
            plan, participation and progress.
          </Text>
          <Text style={styles.paragraph}>
            Relevant information will only be shared between{' '}
            <Text style={styles.italic}>Northern Voices</Text> team members and school staff
            directly involved in your child's speech program for the purposes of planning,
            providing, monitoring and coordinating speech support. Information will be handled
            in accordance with applicable privacy requirements and professional standards.
          </Text>
          <Text style={styles.paragraph}>
            You may contact the school or <Text style={styles.italic}>Northern Voices</Text> if
            you have questions about how your child's information is collected, used, stored or
            shared.
          </Text>

          <View style={styles.sectionBar}>
            <Text style={styles.sectionBarText}>VOLUNTARY PARTICIPATION</Text>
          </View>
          <Text style={styles.paragraph}>
            Participation in the <Text style={styles.italic}>Northern Voices</Text> School
            Speech Program is voluntary. You may choose not to have your child participate, and
            consent may be withdrawn at any time by contacting your child's school or the
            Speech-Language Pathologist.
          </Text>
          <Text style={styles.paragraph}>
            You are welcome to ask questions about the program before providing consent or at
            any time afterward.
          </Text>
        </View>

        <ReportFooter brand='NORTHERN VOICES SPEECH SERVICES' offset={1} />
      </Page>

      <Page size='LETTER' style={styles.consentPage}>
        <View style={styles.consentBanner}>
          <Text style={styles.consentBannerTitle}>
            CONSENT TO PARTICIPATE IN{'\n'}THE SCHOOL SPEECH PROGRAM
          </Text>
          <View style={styles.consentBannerBrandRow}>
            <Image src='/icon.png' style={styles.consentBannerLogo} />
            <View style={styles.consentBannerBrand}>
              <Text style={styles.consentBannerBrandText}>NORTHERN VOICES</Text>
              <Text style={styles.consentBannerBrandSub}>SPEECH SERVICES</Text>
            </View>
          </View>
        </View>

        <View style={styles.consentBody}>
          <View style={styles.sectionBar}>
            <Text style={styles.sectionBarText}>CONSENT</Text>
          </View>
          <Text style={styles.paragraph}>
            By signing below, I confirm that I have reviewed the information above and have had
            the opportunity to ask questions.
          </Text>
          <Text style={styles.paragraph}>
            I consent to my child participating in the{' '}
            <Text style={styles.italic}>Northern Voices</Text> School Speech Program, including:
          </Text>

          <View style={styles.listItem}>
            <Text style={styles.bullet}>•</Text>
            <Text style={styles.listText}>
              one-on-one speech practice with a trained school staff member using a speech plan
              developed and overseen by a Speech-Language Pathologist;
            </Text>
          </View>
          <View style={styles.listItem}>
            <Text style={styles.bullet}>•</Text>
            <Text style={styles.listText}>
              progress monitoring and re-screening as part of the program; and
            </Text>
          </View>
          <View style={styles.listItem}>
            <Text style={styles.bullet}>•</Text>
            <Text style={styles.listText}>
              the collection, use and sharing of information between{' '}
              <Text style={styles.italic}>Northern Voices</Text> and relevant school personnel
              as described above for the purpose of providing and coordinating my child's
              speech support.
            </Text>
          </View>

          <Text style={[styles.paragraph, { marginTop: 10 }]}>
            I understand that the frequency of services may vary, that specific outcomes cannot
            be guaranteed, and that I may withdraw consent at any time.
          </Text>

          <View style={styles.formHeaderField}>
            <Text>Parent/Caregiver or Authorized Decision-Maker:</Text>
            <View style={styles.formUnderline} />
          </View>

          <View style={[styles.formHeaderField, { marginTop: 20 }]}>
            <Text>Relationship to the Child:</Text>
            <View style={styles.formUnderline} />
          </View>

          <View style={[styles.formHeaderRow, { marginTop: 20 }]}>
            <View style={styles.formHeaderField}>
              <Text>Signature:</Text>
              <View style={styles.formUnderline} />
            </View>
            <View style={styles.formHeaderField}>
              <Text>Date:</Text>
              <View style={styles.formUnderline} />
            </View>
          </View>
        </View>

        <ReportFooter brand='NORTHERN VOICES SPEECH SERVICES' offset={1} />
      </Page>
    </Document>
  )
}

export default MildProfoundQualifiedSubReportPdf
