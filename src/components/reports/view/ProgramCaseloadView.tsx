import { ReportBanner, ReportFooter } from './shared/ReportBannerChrome'
import { ResultBadge, ConsentBadge, ServiceStatusTag } from '@/components/caseload/CaseloadBadges'
import { ServiceStatus } from '@/types/database'

interface CaseloadStudent {
  name: string
  grade: string
  result: string
  consent: string
  speech_ea: string
  service_status?: ServiceStatus
}

interface ProgramCaseloadData {
  context: {
    school: string
    student_count: number
    academic_year: string
    qualified: boolean
    sub: boolean
    qualified_students: CaseloadStudent[]
    sub_students: CaseloadStudent[]
  }
}

interface TableBlock {
  heading: string
  variant: 'qualified' | 'sub'
  columns: string[]
  rows: CaseloadStudent[]
}

interface PageSegment {
  heading: string
  variant: 'qualified' | 'sub'
  columns: string[]
  rows: CaseloadStudent[]
}
const ROWS_FIRST_PAGE = 26
const ROWS_PER_PAGE = 32
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
        variant: block.variant,
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

const SegmentTable = ({ segment }: { segment: PageSegment }) => {
  const headingColorClass = segment.variant === 'qualified' ? 'text-[#5b7a8b]' : 'text-[#8a6d4f]'
  const headerRowClass = segment.variant === 'qualified' ? 'bg-[#5b7a8b]' : 'bg-[#e9e2d9]'
  const headerTextClass = segment.variant === 'qualified' ? 'text-white' : 'text-[#4d4b4b]'

  return (
    <>
      {segment.heading && (
        <h2 className={`text-lg font-['Gotu'] text-center mb-2 ${headingColorClass}`}>
          {segment.heading}
        </h2>
      )}
      <table className='w-full border border-black text-[10px] mb-4'>
        <thead>
          <tr className={headerRowClass}>
            {segment.columns.map(col => (
              <th
                key={col}
                className={`font-['Montserrat'] border border-black py-2 px-3 text-center text-xs font-bold ${headerTextClass}`}>
                {col}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {segment.rows.map((student, i) => (
            <tr key={i}>
              <td className='border border-black py-2 px-3 text-left align-top'>
                <div className='flex flex-col gap-1 items-start'>
                  <span className='text-[#4d4b4b]'>{student.name}</span>
                  <ServiceStatusTag status={student.service_status} />
                </div>
              </td>
              <td className='border border-black py-1.5 px-2 text-center text-[#4d4b4b]'>
                {student.grade}
              </td>
              <td className='border border-black py-1.5 px-2 text-center'>
                {student.result && student.result !== 'N/A' ? (
                  <ResultBadge result={student.result} />
                ) : (
                  <span className='text-[10px] text-gray-400 italic'>No Screening Recorded</span>
                )}
              </td>
              <td className='border border-black py-1.5 px-2 text-center'>
                <ConsentBadge hasConsent={student.consent === 'Yes'} />
              </td>
              <td className='border border-black py-1.5 px-2 text-center text-[#4d4b4b]'>
                {student.speech_ea === '-' ? (
                  <span className='text-[10px] text-gray-400 italic'>No Speech EA assigned</span>
                ) : (
                  student.speech_ea
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  )
}

const ProgramCaseloadView = ({ data }: { data: ProgramCaseloadData }) => {
  const { context } = data

  const blocks: TableBlock[] = []
  if (context.qualified && context.qualified_students?.length > 0) {
    blocks.push({
      heading: 'Qualified - Primary Caseload',
      variant: 'qualified',
      columns: ['STUDENT NAME', 'GRADE', 'RESULT', 'CONSENT', 'SPEECH EA'],
      rows: context.qualified_students,
    })
  }

  if (context.sub && context.sub_students?.length > 0) {
    blocks.push({
      heading: 'Subs',
      variant: 'sub',
      columns: ['STUDENT NAME', 'GRADE', 'RESULT', 'CONSENT', 'SPEECH EA'],
      rows: context.sub_students,
    })
  }

  const pages = paginateBlocks(blocks, ROWS_FIRST_PAGE)
  const totalPages = pages.length || 1

  const InfoRow = () => (
    <div className='flex justify-between mb-3'>
      <p>
        <span className='font-bold text-gray-900'>School: </span>
        {context.school}
      </p>
      <p>
        <span className='font-bold text-gray-900'>Student Count: </span>
        {context.student_count}
      </p>
    </div>
  )

  return (
    <div className="space-y-6 print:space-y-0 font-['Nunito']">
      <link
        rel='stylesheet'
        href='https://fonts.googleapis.com/css2?family=Gotu&family=Montserrat:ital,wght@0,400;0,700;1,400&family=Nunito:wght@400;700&display=swap'
      />

      {pages.length === 0 ? (
        <section className='bg-white shadow-sm w-full aspect-[8.5/11] flex flex-col overflow-hidden print:shadow-none'>
          <ReportBanner title='Program Caseload' />
          <div className='flex-1 px-10 pt-5'>
            <h2 className="text-xl text-gray-600 text-center font-['Gotu'] mb-4">
              Qualified & Sub Students
            </h2>
            <InfoRow />
            <p className='text-sm text-gray-500 mt-4'>No qualified or sub students this year.</p>
          </div>
          <ReportFooter brand='NORTHERN VOICES SPEECH SERVICES' page={1} of={1} />
        </section>
      ) : (
        pages.map((segments, i) => {
          const isLastPage = i === totalPages - 1
          return (
            <section
              key={i}
              className='bg-white shadow-sm w-full aspect-[8.5/11] flex flex-col overflow-hidden break-after-page print:shadow-none'>
              <ReportBanner title='Program Caseload' />
              <div className='flex-1 px-10 pt-5'>
                {i === 0 && (
                  <>
                    <h2 className="text-xl text-gray-600 text-center font-['Gotu'] mb-4">
                      Qualified & Sub Students
                    </h2>
                    <InfoRow />
                  </>
                )}
                {segments.map((segment, j) => (
                  <SegmentTable key={j} segment={segment} />
                ))}
              </div>
              {isLastPage && (
                <ReportFooter
                  brand='NORTHERN VOICES SPEECH SERVICES'
                  page={i + 1}
                  of={totalPages}
                />
              )}
            </section>
          )
        })
      )}
    </div>
  )
}

export default ProgramCaseloadView
