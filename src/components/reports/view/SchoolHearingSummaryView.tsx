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

const ROWS_FIRST_PAGE = 24
const ROWS_PER_PAGE = 30
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
    <h1 className="text-3xl text-white font-['Gotu']">Hearing Summary Report</h1>
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

const SegmentTable = ({ segment }: { segment: PageSegment }) => (
  <>
    {segment.heading && (
      <p className="text-lg font-['Gotu'] text-gray-800 mb-2">{segment.heading}</p>
    )}
    <table className='w-full border border-black text-[10px] mb-4'>
      <thead>
        <tr className='bg-[#f2f2f2]'>
          {segment.columns.map(col => (
            <th
              key={col}
              className="font-['Montserrat'] border border-black py-1.5 px-2 text-center text-[8px] font-bold">
              {col}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {segment.rows.map((row, i) => (
          <tr key={i}>
            {row.map((cell, j) => (
              <td key={j} className='border border-black py-1.5 px-2 text-center text-[#4d4b4b]'>
                {cell}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  </>
)

const SchoolHearingSummaryView = ({ data }: { data: SchoolHearingSummaryData }) => {
  const { context } = data

  const blocks: TableBlock[] = []
  if (context.referred && context.referred_students?.length > 0) {
    blocks.push({
      heading: 'Referred',
      columns: ['STUDENT', 'GRADE'],
      rows: context.referred_students.map(s => [s.name, s.grade]),
    })
  }
  if (context.absent && context.absent_students && context.absent_students.length > 0) {
    blocks.push({
      heading: 'Absent',
      columns: ['STUDENT', 'GRADE'],
      rows: context.absent_students.map(s => [s.name, s.grade]),
    })
  }

  const pages = paginateBlocks(blocks, ROWS_FIRST_PAGE)
  const totalPages = pages.length || 1

  return (
    <div className="space-y-6 print:space-y-0 font-['Nunito']">
      <link
        rel='stylesheet'
        href='https://fonts.googleapis.com/css2?family=Gotu&family=Montserrat:ital,wght@0,400;0,700;1,400&family=Nunito:wght@400;700&display=swap'
      />

      {pages.length === 0 ? (
        <section className='bg-white shadow-sm w-full aspect-[8.5/11] flex flex-col overflow-hidden print:shadow-none'>
          <ReportBanner />
          <div className='flex-1 px-10 pt-5'>
            <p className='mb-3'>
              <span className='font-bold text-gray-900'>Screening Date(s): </span>
              {context.screening_date}
            </p>
            <p className='text-sm text-gray-500 mt-4'>No students referred or absent this year.</p>
          </div>
          <ReportFooter page={1} of={1} />
        </section>
      ) : (
        pages.map((segments, i) => {
          const isLastPage = i === totalPages - 1
          return (
            <section
              key={i}
              className='bg-white shadow-sm w-full aspect-[8.5/11] flex flex-col overflow-hidden break-after-page print:shadow-none'>
              <ReportBanner />
              <div className='flex-1 px-10 pt-5'>
                {i === 0 && (
                  <p className='mb-3'>
                    <span className='font-bold text-gray-900'>Screening Date(s): </span>
                    {context.screening_date}
                  </p>
                )}
                {segments.map((segment, j) => (
                  <SegmentTable key={j} segment={segment} />
                ))}
              </div>
              {isLastPage && <ReportFooter page={i + 1} of={totalPages} />}
            </section>
          )
        })
      )}
    </div>
  )
}

export default SchoolHearingSummaryView
