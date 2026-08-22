import { Document, Page, View, Text, StyleSheet, Font } from '@react-pdf/renderer'
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

interface NoConsentLetterData {
  context: {
    student_name: string
    grade: string
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
  title: {
    fontSize: 30,
    fontFamily: 'Gotu',
    marginBottom: 12,
    letterSpacing: 1,
    textAlign: 'center',
  },
  label: {
    fontFamily: 'Nunito',
    fontWeight: 700,
    color: '#111827',
    marginBotton: 3,
  },
  paragraph: { lineHeight: 1.2, marginBottom: 18, color: '#374151' },
  bold: { fontFamily: 'Nunito', fontWeight: 700 },
  infoBlock: { marginBottom: 14 },
  infoLine: { marginBottom: 1 },
})

const NoConsentLetterPdf = ({ data }: { data: NoConsentLetterData }) => {
  const { context } = data

  return (
    <Document>
      <Page size='LETTER' style={styles.page}>
        <ReportHeader />

        <Text style={styles.title}>SPEECH SCREEN REPORT</Text>

        <View style={styles.infoBlock}>
          <Text style={styles.infoLine}>Student's Name: {context.student_name}</Text>
          <Text style={styles.infoLine}>Grade: {context.grade}</Text>
        </View>

        <Text style={styles.label}>DEAR PARENT/CAREGIVER:</Text>
        <Text style={styles.paragraph}>
          We recently completed speech screenings at your child's school. As we did not receive
          consent for your child to participate, your child was not screened by the Speech-Language
          Pathologist.
        </Text>

        <Text style={styles.paragraph}>
          Even though your child did not participate in the screening, your family is still welcome
          to access the Northern Voices speech app at no cost through your school. The app includes
          games, activities, videos, and practical tools that families can use to support speech
          development at home.
        </Text>
        <Text style={styles.paragraph}>
          If you change your mind and would like your child to participate in a speech screening in
          the future, please reach out to your school team. We would be happy to connect with you,
          answer any questions, and discuss available screening opportunities. If you change your
          mind and would like your child to participate in a speech screening in the future, please
          reach out to your school team. We would be happy to connect with you, answer any
          questions, and discuss available screening opportunities.
        </Text>
        <Text style={styles.paragraph}>We hope you enjoy exploring the TeachSpeech app!</Text>
        <Text style={styles.bold}>Northern Voices Speech Services</Text>

        <ReportFooter brand='NORTHERN VOICES SPEECH SERVICES' offset={1} />
      </Page>
    </Document>
  )
}

export default NoConsentLetterPdf
