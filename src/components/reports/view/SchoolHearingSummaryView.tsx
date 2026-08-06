interface SummaryStudent {
  name: string
  grade: string
}

interface SchoolHearingSummaryData {
  context: {
    screening_date: string
    referred: boolean
    referred_students: SummaryStudent[]
    absent?: boolean
    absent_students?: SummaryStudent[]
  }
}

interface TableBlock {
  heading: string
  columns: string[]
  rows: string[][]
}

interface PageSegment {
  heading: string
  columns: string[]
  rows: string[][]
}
