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
