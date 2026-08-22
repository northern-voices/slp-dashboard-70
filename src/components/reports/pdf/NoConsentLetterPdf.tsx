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
