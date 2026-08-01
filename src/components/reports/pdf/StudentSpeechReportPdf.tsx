import { Document, Page, View, Text, Image, StyleSheet } from '@react-pdf/renderer'
import { REPORT_RESULTS_TEXT } from '@/constants/reportResultsText'
import { DEVELOPMENTAL_CHART } from '@/constants/developmentalSpeechChart'

interface ProcessedError {
  sound: string
  pattern: string
  example: string
  targetSound: string
}

interface StudentSpeechReportData {
  template?: { name?: string }
  context: {
    student_name: string
    date_of_screening: string
    grade: string
    errors: ProcessedError[]
  }
}

const styles = StyleSheet.create({
  page: { padding: 48, fontSize: 11, fontFamily: 'Helvetica', color: '#374151' },
  headerRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 32 },
  logo: { width: 28, height: 28, marginRight: 10 },
  headerBrand: { fontSize: 10, fontFamily: 'Helvetica-Bold', letterSpacing: 1, color: '#111827' },
  headerSub: { fontSize: 6, letterSpacing: 2, color: '#6b7280', marginTop: 2 },
  title: {
    fontSize: 30,
    fontFamily: 'Helvetica',
    color: '#6b7280',
    marginBottom: 24,
    letterSpacing: 1,
  },
  label: { fontFamily: 'Helvetica-Bold', color: '#111827', marginBottom: 6, fontSize: 11 },
  paragraph: { lineHeight: 1.5, marginBottom: 18, color: '#374151' },
  infoBlock: { marginBottom: 18 },
  infoLine: { marginBottom: 3 },
  resultsLine: { textAlign: 'center', marginBottom: 18 },
  resultsBold: { fontFamily: 'Helvetica-Bold' },
  table: { borderWidth: 1, borderColor: '#d1d5db', marginBottom: 18 },
  tableRow: { flexDirection: 'row' },
  tableHeaderCell: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#d1d5db',
    backgroundColor: '#f9fafb',
    padding: 6,
    fontSize: 8,
    fontFamily: 'Helvetica-Bold',
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
  footerNote: { fontStyle: 'italic', fontSize: 9, color: '#4b5563' },
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
