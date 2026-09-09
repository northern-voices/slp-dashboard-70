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
    graduated: boolean
    qualified_students: CaseloadStudent[]
    sub_students: CaseloadStudent[]
    graduated_students: CaseloadStudent[]
  }
}

interface TableBlock {
  heading: string
  variant: 'qualified' | 'sub' | 'graduated'
  columns: string[]
  rows: CaseloadStudent[]
}

const VARIANT_STYLES = {
  qualified: { heading: 'text-[#5b7a8b]', headerRow: 'bg-[#5b7a8b]', headerText: 'text-white' },
  sub: { heading: 'text-[#8a6d4f]', headerRow: 'bg-[#e9e2d9]', headerText: 'text-[#4d4b4b]' },
  graduated: { heading: 'text-[#3f6d8a]', headerRow: 'bg-[#7fa5bf]', headerText: 'text-white' },
} as const

// One heading + one table per block, rendered in full - no page-count guessing.
// If this is ever browser-printed, the browser's own print engine paginates the
// flowing content automatically; print:break-inside-avoid on each row keeps a
// single row from being split across a printed page boundary.
const BlockTable = ({ block }: { block: TableBlock }) => {
  const {
    heading: headingColorClass,
    headerRow: headerRowClass,
    headerText: headerTextClass,
  } = VARIANT_STYLES[block.variant]

  return (
    <>
      <h2 className={`text-lg font-['Gotu'] text-center mb-2 ${headingColorClass}`}>
        {block.heading}
      </h2>
      <table className='w-full border border-black text-[10px] mb-6'>
        <thead>
          <tr className={headerRowClass}>
            {block.columns.map(col => (
              <th
                key={col}
                className={`font-['Montserrat'] border border-black py-2 px-3 text-center text-xs font-bold ${headerTextClass}`}>
                {col}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {block.rows.map((student, i) => (
            <tr key={i} className='print:break-inside-avoid'>
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

  if (context.graduated && context.graduated_students?.length > 0) {
    blocks.push({
      heading: 'Graduated',
      variant: 'graduated',
      columns: ['STUDENT NAME', 'GRADE', 'RESULT', 'CONSENT', 'SPEECH EA'],
      rows: context.graduated_students,
    })
  }

  return (
    <div className="font-['Nunito']">
      <link
        rel='stylesheet'
        href='https://fonts.googleapis.com/css2?family=Gotu&family=Montserrat:ital,wght@0,400;0,700;1,400&family=Nunito:wght@400;700&display=swap'
      />

      <section className='bg-white shadow-sm w-full print:shadow-none'>
        <ReportBanner title='Program Caseload' />
        <div className='px-10 pt-5'>
          <h2 className="text-xl text-gray-600 text-center font-['Gotu'] mb-4">
            Qualified & Sub Students
          </h2>
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

          {blocks.length === 0 ? (
            <p className='text-sm text-gray-500 mt-4'>
              No qualified, sub, or graduated students this year.
            </p>
          ) : (
            blocks.map((block, i) => <BlockTable key={i} block={block} />)
          )}
        </div>
        <ReportFooter brand='NORTHERN VOICES SPEECH SERVICES' />
      </section>
    </div>
  )
}

export default ProgramCaseloadView
