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

interface ComplexNeedsLetterData {
  context: {
    student_name: string
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
  },
  paragraph: { lineHeight: 1.2, marginBottom: 18, color: '#374151' },
  bold: { fontFamily: 'Nunito', fontWeight: 700 },
  infoBlock: { marginBottom: 14 },
  infoLine: { marginBottom: 1 },
})

const ComplexNeedsLetterPdf = ({ data }: { data: ComplexNeedsLetterData }) => {
  const { context } = data

  return (
    <Document>
      <Page size='LETTER' style={styles.page}>
        <ReportHeader />

        <Text style={styles.title}>TeachSpeech App - Free Family Access!</Text>

        <View style={styles.infoBlock}>
          <Text style={styles.infoLine}>Student: {context.student_name}</Text>
        </View>

        <Text style={styles.label}>DEAR PARENT/CAREGIVER:</Text>
        <Text style={styles.paragraph}>
          As part of the Northern Voices School Speech Program, all students and families at your
          child's school are invited to access the Northern Voices' TeachSpeech app at no cost.
        </Text>
        <Text style={styles.paragraph}>
          The app includes games, activities, educational videos, and practical tools designed to
          support children's speech and communication development. Families are welcome to explore
          and use these resources at home at any time.
        </Text>
        <Text style={styles.paragraph}>
          We hope you enjoy having access to these resources and find them helpful in learning about
          and supporting your child's communication development.
        </Text>
        <Text style={styles.paragraph}>
          If you have any questions about the app or the resources available to your family, please
          feel free to connect with your school team.
        </Text>
        <Text style={styles.bold}>Northern Voices Speech Services</Text>

        <ReportFooter brand='NORTHERN VOICES SPEECH SERVICES' offset={1} />
      </Page>
    </Document>
  )
}

export default ComplexNeedsLetterPdf
