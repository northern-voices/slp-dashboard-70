import { ReportBanner, ReportFooter } from './shared/ReportBannerChrome'
import { GRADE_MAPPING } from '@/constants/app'

interface SummaryStudent {
  name: string
  grade: string
}

interface ReferralStudent {
  name: string
  grade: string
  recommendations_and_referrals: string
}

const gradeOrderIndex = (grade: string): number => {
  const index = GRADE_MAPPING.findIndex(g => grade.includes(g.value))
  return index === -1 ? Infinity : index
}

const sortByGrade = <T extends { grade: string }>(students: T[]): T[] =>
  [...students].sort((a, b) => gradeOrderIndex(a.grade) - gradeOrderIndex(b.grade))

interface SchoolSpeechSummaryData {
  context: {
    screening_date: string
    slp: string
    qualified: boolean
    qualified_students: SummaryStudent[]
    sub: boolean
    sub_students: SummaryStudent[]
    priority_rescreen: boolean
    students_priority_rescreen: SummaryStudent[]
    students_recommendations_and_referrals: ReferralStudent[]
    returning_absent: boolean
    returning_absent_students: SummaryStudent[]
  }
}

type SegmentColorKey = 'qualified' | 'sub' | 'priority_rescreen' | 'referral' | 'returning_absent'

interface TableBlock {
  heading: string
  columns: string[]
  rows: string[][]
  colorKey?: SegmentColorKey
  intro?: string
}

interface PageSegment {
  heading: string
  columns: string[]
  rows: string[][]
  colorKey?: SegmentColorKey
  intro?: string
}

// Mirrors ProgramBadge's colors (Qualified/Sub) and ReturningAbsentBadge's yellow, so each
// category reads the same way across every report.
const SEGMENT_HEADING_STYLES: Record<SegmentColorKey, { bg: string; text: string }> = {
  qualified: { bg: 'bg-red-100', text: 'text-red-800' },
  sub: { bg: 'bg-orange-100', text: 'text-orange-800' },
  priority_rescreen: { bg: 'bg-teal-100', text: 'text-teal-800' },
  referral: { bg: 'bg-purple-100', text: 'text-purple-800' },
  returning_absent: { bg: 'bg-yellow-100', text: 'text-yellow-800' },
}

const ROWS_FIRST_PAGE = 26
const ROWS_PER_PAGE = 32
// Each segment's colored banner + rounded card border + bottom margin costs more than a plain
// table header row did in the old design - reserving only 2 here let the last table on a busy
// page (several segments stacked) actually overflow and get visually clipped.
const HEADING_ROWS = 3
const INTRO_ROWS = 6
// Never leave fewer than this many rows stranded alone on a continuation page - trim the
// earlier page back instead so a split table's "(cont.)" page always has a decent chunk.
const MIN_ORPHAN_ROWS = 4

// Paginates every table block as one continuous stream, so a new category (Sub, Priority
// Rescreens, etc.) starts right where the previous one left off on the same page instead of
// always forcing a fresh page per category.
const paginateBlocks = (blocks: TableBlock[], firstPageBudget: number): PageSegment[][] => {
  const pages: PageSegment[][] = []
  let currentPage: PageSegment[] = []
  let remaining = firstPageBudget

  for (const block of blocks) {
    let rows = block.rows
    let isFirstSegment = true

    while (rows.length > 0) {
      const introRows = isFirstSegment && block.intro ? INTRO_ROWS : 0
      let availableForRows = remaining - HEADING_ROWS - introRows

      if (availableForRows <= 0) {
        pages.push(currentPage)
        currentPage = []
        remaining = ROWS_PER_PAGE
        continue
      }

      if (rows.length > availableForRows) {
        const tailRows = rows.length - availableForRows
        if (tailRows < MIN_ORPHAN_ROWS) {
          availableForRows = Math.max(0, rows.length - MIN_ORPHAN_ROWS)
        }
      }

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
        colorKey: block.colorKey,
        intro: isFirstSegment ? block.intro : undefined,
      })
      remaining -= HEADING_ROWS + introRows + rowsForThisSegment.length
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
  const headingStyle = segment.colorKey ? SEGMENT_HEADING_STYLES[segment.colorKey] : null

  return (
    <div className='mb-4'>
      {segment.intro && <p className='text-sm text-gray-700 mb-3'>{segment.intro}</p>}
      <div className='rounded-md overflow-hidden border border-gray-300'>
        {segment.heading &&
          (headingStyle ? (
            <div className={`flex items-center gap-2 ${headingStyle.bg} px-3 py-1.5`}>
              <p
                className={`font-['Montserrat'] text-xs font-bold uppercase tracking-wider ${headingStyle.text}`}>
                {segment.heading}
              </p>
            </div>
          ) : (
            <p className="text-lg font-['Gotu'] text-gray-800 px-3 pt-2">{segment.heading}</p>
          ))}
        <table className='w-full text-[10px] border-collapse'>
          <thead>
            <tr className='bg-[#5b7a8b]'>
              {segment.columns.map(col => (
                <th
                  key={col}
                  className="font-['Montserrat'] py-2 px-2 text-center text-[8px] font-bold text-white tracking-wide">
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {segment.rows.map((row, i) => (
              <tr key={i} className={i % 2 === 1 ? 'bg-gray-50' : 'bg-white'}>
                {row.map((cell, j) => (
                  <td
                    key={j}
                    className='py-1.5 px-2 text-center text-[#4d4b4b] border-t border-gray-200'>
                    {cell}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

const SchoolSpeechSummaryView = ({ data }: { data: SchoolSpeechSummaryData }) => {
  const { context } = data

  const blocks: TableBlock[] = []

  const hasQualified = context.qualified && (context.qualified_students?.length ?? 0) > 0
  const hasSub = context.sub && (context.sub_students?.length ?? 0) > 0

  if (hasQualified) {
    blocks.push({
      heading: 'Qualified - Primary Caseload',
      columns: ['STUDENT', 'GRADE'],
      rows: sortByGrade(context.qualified_students).map(s => [s.name, s.grade]),
      colorKey: 'qualified',
    })
  }
  if (hasSub) {
    blocks.push({
      heading: 'Subs',
      columns: ['STUDENT', 'GRADE'],
      rows: sortByGrade(context.sub_students).map(s => [s.name, s.grade]),
      colorKey: 'sub',
    })
  }

  if ((context.students_priority_rescreen?.length ?? 0) > 0) {
    blocks.push({
      heading: 'Priority Rescreens (Absent)',
      columns: ['STUDENT', 'GRADE'],
      rows: sortByGrade(context.students_priority_rescreen).map(student => [
        student.name,
        student.grade,
      ]),
      colorKey: 'priority_rescreen',
    })
  }

  if ((context.students_recommendations_and_referrals?.length ?? 0) > 0) {
    blocks.push({
      heading: 'Student Recommendations and Referrals',
      columns: ['STUDENT', 'GRADE', 'Notes'],
      rows: sortByGrade(context.students_recommendations_and_referrals).map(s => [
        s.name,
        s.grade,
        s.recommendations_and_referrals,
      ]),
      colorKey: 'referral',
      intro:
        'Our Speech Therapists have an opportunity to briefly observe students during ' +
        'class-wide speech screens. If the Speech Therapist noted any "red flags" or ' +
        '"developmental concerns" this does not necessarily mean anything is wrong! ' +
        'Recommendations listed below simply serve as proactive steps and suggestions to ' +
        'ensure student success. Please contact your Speech Therapist if you have any questions.',
    })
  }

  if ((context.returning_absent_students?.length ?? 0) > 0) {
    blocks.push({
      heading: 'Students on Caseload from Last Year (Requiring Screens)',
      columns: ['STUDENT', 'GRADE'],
      rows: sortByGrade(context.returning_absent_students).map(s => [s.name, s.grade]),
      colorKey: 'returning_absent',
    })
  }

  const pages = paginateBlocks(blocks, ROWS_FIRST_PAGE)
  const totalPages = pages.length

  return (
    <div className="space-y-6 print:space-y-0 font-['Nunito']">
      <link
        rel='stylesheet'
        href='https://fonts.googleapis.com/css2?family=Gotu&family=Montserrat:ital,wght@0,400;0,700;1,400&family=Nunito:wght@400;700&display=swap'
      />

      {pages.map((segments, i) => {
        const isLastPage = i === totalPages - 1
        return (
          <section
            key={i}
            className='bg-white shadow-sm w-full aspect-[8.5/11] flex flex-col overflow-hidden break-after-page print:shadow-none'>
            <ReportBanner title='School Summary Report' />
            <div className='flex-1 px-10 pt-5'>
              {i === 0 && (
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
              )}
              {i === 0 && (hasQualified || hasSub) && (
                <p className='font-bold text-gray-900 mb-3'>
                  STUDENTS ELIGIBLE TO PARTICIPATE IN SPEECH PROGRAM:
                </p>
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
