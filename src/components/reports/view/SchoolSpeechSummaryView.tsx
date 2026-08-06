import { ReportBanner, ReportFooter } from './shared/ReportBannerChrome'

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

const SchoolSpeechSummaryView = ({ data }: { data: SchoolSpeechSummaryData }) => {
  const { context } = data

  const sectionABlocks: TableBlock[] = []
  if (context.qualified && context.qualified_students?.length > 0) {
    sectionABlocks.push({
      heading: 'Qualified - Primary Caseload',
      columns: ['STUDENT', 'GRADE'],
      rows: context.qualified_students.map(s => [s.name, s.grade]),
    })
  }
  if (context.sub && context.sub_students?.length > 0) {
    sectionABlocks.push({
      heading: 'Subs',
      columns: ['STUDENT', 'GRADE'],
      rows: context.sub_students.map(s => [s.name, s.grade]),
    })
  }

  const sectionAPages = paginateBlocks(sectionABlocks, ROWS_FIRST_PAGE)

  const hasReferrals = (context.students_recommendations_and_referrals?.length ?? 0) > 0
  const sectionBPages = hasReferrals
    ? paginateBlocks(
        [
          {
            heading: '',
            columns: ['STUDENT', 'GRADE', 'Notes'],
            rows: context.students_recommendations_and_referrals.map(s => [
              s.name,
              s.grade,
              s.recommendations_and_referrals,
            ]),
          },
        ],
        ROWS_FIRST_PAGE
      )
    : []

  const totalPages = sectionAPages.length + sectionBPages.length

  return (
    <div className="space-y-6 print:space-y-0 font-['Nunito']">
      <link
        rel='stylesheet'
        href='https://fonts.googleapis.com/css2?family=Gotu&family=Montserrat:ital,wght@0,400;0,700;1,400&family=Nunito:wght@400;700&display=swap'
      />

      {sectionAPages.map((segments, i) => {
        const isLastPage = i === totalPages - 1
        return (
          <section
            key={`a-${i}`}
            className='bg-white shadow-sm w-full aspect-[8.5/11] flex flex-col overflow-hidden break-after-page print:shadow-none'>
            <ReportBanner title='School Summary Report' />
            <div className='flex-1 px-10 pt-5'>
              {i === 0 && (
                <>
                  <div className='flex justify-between mb-3'>
                    <p>
                      <span className='font-bold text-gray-900'>Screening Date(s): </span>
                      {context.screening_date}
                    </p>
                    <p>
                      <span className='font-bold text-gray-900'>SLP: </span>
                      {context.slp}
                    </p>
                  </div>
                  <p className='font-bold text-gray-900 mb-3'>
                    A. STUDENTS ELIGIBLE TO PARTICIPATE IN SPEECH PROGRAM:
                  </p>
                </>
              )}
              {segments.map((segment, j) => (
                <SegmentTable key={j} segment={segment} />
              ))}
            </div>
            {isLastPage && (
              <ReportFooter brand='NORTHERN VOICES SPEECH SERVICES' page={i + 1} of={totalPages} />
            )}
          </section>
        )
      })}

      {sectionBPages.map((segments, i) => {
        const pageIndex = sectionAPages.length + i
        const isLastPage = pageIndex === totalPages - 1
        return (
          <section
            key={`b-${i}`}
            className='bg-white shadow-sm w-full aspect-[8.5/11] flex flex-col overflow-hidden break-after-page print:shadow-none'>
            <ReportBanner title='School Summary Report' />
            <div className='flex-1 px-10 pt-5'>
              {i === 0 && (
                <>
                  <p className='font-bold text-gray-900 mb-3'>
                    B. STUDENT RECOMMENDATIONS AND REFERRALS:
                  </p>
                  <p className='text-sm text-gray-700 mb-4'>
                    Our Speech Therapists have an opportunity to briefly observe students during
                    class-wide speech screens. If the Speech Therapist noted any "red flags" or
                    "developmental concerns" this does not necessarily mean anything is wrong!
                    Recommendations listed below simply serve as proactive steps and suggestions to
                    ensure student success. Please contact your Speech Therapist if you have any
                    questions.
                  </p>
                </>
              )}
              {segments.map((segment, j) => (
                <SegmentTable key={j} segment={segment} />
              ))}
            </div>
            {isLastPage && (
              <ReportFooter brand='NORTHERN VOICES SPEECH SERVICES' page={i + 1} of={totalPages} />
            )}
          </section>
        )
      })}
    </div>
  )
}

export default SchoolSpeechSummaryView
