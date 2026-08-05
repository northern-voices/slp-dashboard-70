interface SummaryStudent {
  name: string
  grade: string
}

interface ReferralStudent {
  name: string
  grade: string
  recommendations_and_referrals: string
}

interface SchoolSpeechSummaryData {
  context: {
    screening_date: string
    slp: string
    qualified: boolean
    qualified_students: SummaryStudent[]
    sub: boolean
    sub_students: SummaryStudent[]
    students_recommendations_and_referrals: ReferralStudent[]
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

const ROWS_FIRST_PAGE = 22
const ROWS_PER_PAGE = 28
const HEADING_ROWS = 2

const paginateBlocks = (blocks: TableBlock[], firstPageBudget: number): PageSegment[][] => {
  const pages: PageSegment[][] = []
  let currentPage: PageSegment[] = []
  let remaining = firstPageBudget

  for (const block of blocks) {
    let rows = block.rows
    let isFirstSegment = true

    while (rows.length > 0) {
      const availableForRows = remaining - HEADING_ROWS

      if (availableForRows <= 0) {
        pages.push(currentPage)
        currentPage = []
        remaining = ROWS_PER_PAGE
        continue
      }

      const rowsForThisSegment = rows.slice(0, availableForRows)
      currentPage.push({
        heading: isFirstSegment ? block.heading : `${block.heading} (cont.)`,
        columns: block.columns,
        rows: rowsForThisSegment,
      })
      remaining -= HEADING_ROWS + rowsForThisSegment.length
      rows = rows.slice(rowsForThisSegment.length)
      isFirstSegment = false

      if (rows.length > 0) {
        pages.push(currentPage)
        currentPage = []
        remaining = ROWS_PER_PAGE
      }
    }
  }

  if (currentPage.length > 0) pages.push(currentPage)
  return pages
}

const ReportBanner = () => (
  <div className='bg-[#5b7a8b] px-10 py-6 flex items-center justify-between'>
    <h1 className="text-3xl text-white font-['Gotu']">School Summary Report</h1>
    <div className='flex items-center'>
      <img src='/icon.png' alt='' className='w-7 h-7 rounded mr-2' />
      <div className='leading-tight'>
        <p className='font-bold text-[9px] tracking-wide text-white'>NORTHERN VOICES</p>
        <p className="font-['Montserrat'] text-[6px] tracking-[0.2em] text-gray-200">
          SPEECH SERVICES
        </p>
      </div>
    </div>
  </div>
)

const ReportFooter = ({ page, of }: { page: number; of: number }) => (
  <div className='flex items-center justify-between border-t border-gray-200 pt-3 text-xs text-gray-500 px-10 pb-6'>
    <span>NORTHERN VOICE SPEECH SERVICES</span>
    <span className='flex items-center gap-2'>
      <img src='/icon.png' alt='' className='w-4 h-4' />
      {page} of {of}
    </span>
  </div>
)
