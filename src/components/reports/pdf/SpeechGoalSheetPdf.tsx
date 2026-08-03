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

interface TableError {
  sound: string
  pattern: string
  example: string
}

interface GoalError {
  sound: string
  pattern: string
  example: string
  targetSound: string
  stimulability_option: string
}

interface SpeechGoalSheetData {
  template?: { name?: string }
  context: {
    student_name: string
    date_of_screening: string
    school: string
    grade: string
    vocabulary_support: boolean
    primary_errors: GoalError[]
    secondary_errors: GoalError[]
    primary_table_errors: TableError[]
    secondary_table_errors: TableError[]
  }
}

const BANNER_BG = '#5b7a8b'
const TAN_BG = '#e9e2d9'

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
    paddingVertical: 26,
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
  body: { paddingHorizontal: 48, paddingTop: 22 },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  infoItem: { flex: 1, fontSize: 11 },
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

  table: { marginBottom: 10 },
  tableRow: { flexDirection: 'row' },
  tableHeaderCell: {
    flex: 1,
    borderWidth: 0.75,
    borderColor: '#000000',
    backgroundColor: '#f2f2f2',
    padding: 6,
    fontSize: 8,
    fontFamily: 'Montserrat',
    fontWeight: 700,
    textAlign: 'center',
  },
  tableCell: {
    flex: 1,
    borderWidth: 0.75,
    borderColor: '#000000',
    padding: 6,
    fontSize: 9,
    textAlign: 'center',
    color: '#4d4b4b',
  },

  vocabNote: {
    fontSize: 11,
    fontFamily: 'Montserrat',
    fontStyle: 'italic',
    color: '#4b5563',
    marginTop: 2,
  },

  studentLine: {
    fontSize: 12,
    fontFamily: 'Nunito',
    fontWeight: 700,
    color: '#111827',
    marginBottom: 8,
  },

  soundStrategyRow: {
    flexDirection: 'row',
    borderWidth: 0.75,
    borderColor: '#b7b7b7',
    backgroundColor: '#eff3f6',
    marginBottom: 12,
    padding: 10,
  },
  soundBox: {
    width: '35%',
    paddingRight: 10,
    borderRightWidth: 0.75,
    borderRightColor: '#d1d5db',
  },
  strategyBox: { width: '65%', paddingLeft: 10 },
  soundLabel: {
    fontSize: 9,
    fontFamily: 'Nunito',
    fontWeight: 700,
    color: '#111827',
    marginBottom: 2,
  },
  soundValue: {
    fontSize: 15,
    fontFamily: 'Nunito',
    fontWeight: 700,
    color: '#111827',
    marginBottom: 4,
  },
  soundHint: { fontSize: 7, fontFamily: 'Montserrat', fontStyle: 'italic', color: '#6b7280' },
  strategyLabel: {
    fontSize: 9,
    fontFamily: 'Nunito',
    fontWeight: 700,
    color: '#111827',
    marginBottom: 5,
  },
  checkboxRow: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 3 },
  checkboxBox: {
    width: 8,
    height: 8,
    borderWidth: 1,
    borderColor: '#374151',
    marginRight: 5,
    marginTop: 1,
  },
  checkboxLabel: { fontSize: 8, flex: 1 },

  sessionCard: { borderWidth: 0.75, borderColor: '#b7b7b7', marginBottom: 10 },
  sessionHeader: { paddingVertical: 6, paddingHorizontal: 10 },
  sessionHeaderDark: { backgroundColor: BANNER_BG },
  sessionHeaderTan: { backgroundColor: TAN_BG },
  sessionHeaderTextLight: {
    fontSize: 9,
    fontFamily: 'Montserrat',
    fontWeight: 700,
    letterSpacing: 1,
    textAlign: 'center',
    color: '#ffffff',
  },
  sessionHeaderTextDark: {
    fontSize: 9,
    fontFamily: 'Montserrat',
    fontWeight: 700,
    letterSpacing: 1,
    textAlign: 'center',
    color: '#4d4b4b',
  },
  sessionBody: { flexDirection: 'row', padding: 10 },
  sessionBodyLight: { backgroundColor: '#eff3f6' },
  sessionBodyCream: { backgroundColor: '#f9f7f4' },
  sessionLeft: {
    width: '38%',
    paddingRight: 10,
    borderRightWidth: 0.75,
    borderRightColor: '#d1d5db',
  },
  sessionRight: { width: '62%', paddingLeft: 10 },
  sessionQuestion: {
    fontSize: 9,
    fontFamily: 'Nunito',
    fontWeight: 700,
    color: '#111827',
    marginBottom: 2,
  },
  sessionSubQuestion: {
    fontSize: 8,
    fontFamily: 'Montserrat',
    fontStyle: 'italic',
    color: '#6b7280',
    marginBottom: 5,
  },

  sessionGoal: { fontSize: 9, marginBottom: 5, lineHeight: 1.3 },
  italicBold: { fontFamily: 'Montserrat', fontStyle: 'italic', fontWeight: 700 },
  bold: { fontFamily: 'Nunito', fontWeight: 700 },
  dateLine: { fontSize: 9, marginBottom: 8 },
  fieldLabel: {
    fontSize: 8,
    fontFamily: 'Nunito',
    fontWeight: 700,
    color: '#111827',
    marginTop: 5,
    marginBottom: 3,
  },
  fieldHint: { fontFamily: 'Montserrat', fontWeight: 400, fontStyle: 'italic', color: '#6b7280' },
  blankLine: {
    borderBottomWidth: 0.5,
    borderBottomColor: '#9ca3af',
    height: 14,
    marginBottom: 2,
  },

  masteredRow: { flexDirection: 'row', marginTop: 4 },
  masteredPill: {
    flex: 1,
    backgroundColor: TAN_BG,
    borderWidth: 0.75,
    borderColor: '#b7b7b7',
    paddingVertical: 7,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  masteredPillLeft: { marginRight: 1 },
  radioCircle: {
    width: 8,
    height: 8,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#374151',
    marginRight: 5,
  },
  masteredPillText: {
    fontSize: 9,
    fontFamily: 'Montserrat',
    fontWeight: 700,
    letterSpacing: 0.5,
    color: '#374151',
  },
  footerNote: { fontFamily: 'Montserrat', fontStyle: 'italic', fontSize: 9, color: '#4b5563' },
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
