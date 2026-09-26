import { ReportBanner, ReportFooter } from './shared/ReportBannerChrome'
import {
  ResultBadge,
  ConsentBadge,
  ServiceStatusTag,
  ProgramBadge,
  ReturningAbsentBadge,
} from '@/components/caseload/CaseloadBadges'
import { ServiceStatus, ProgramStatus } from '@/types/database'

interface CaseloadStudent {
  name: string
  grade: string
  result: string
  consent: string
  speech_ea: string
  service_status?: ServiceStatus
  program_status: ProgramStatus
  result_year: string | null
  returning_absent_status: 'absent' | 'not_yet_screened' | null
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

const COLUMNS = ['STUDENT NAME', 'GRADE', 'RESULT', 'PROGRAM', 'CONSENT', 'SPEECH EA']

const SECTION_STYLES: Record<'qualified' | 'sub' | 'graduated', { bg: string; text: string }> = {
  qualified: { bg: 'bg-red-100', text: 'text-red-800' },
  sub: { bg: 'bg-orange-100', text: 'text-orange-800' },
  graduated: { bg: 'bg-blue-100', text: 'text-blue-800' },
}

const CaseloadSection = ({
  title,
  status,
  students,
}: {
  title: string
  status: 'qualified' | 'sub' | 'graduated'
  students: CaseloadStudent[]
}) => {
  if (students.length === 0) return null
  const style = SECTION_STYLES[status]

  return (
    <div className='mb-6'>
      <div className={`flex items-center justify-between ${style.bg} rounded-t-md px-3 py-2`}>
        <div className='flex items-center gap-2'>
          <h2
            className={`font-['Montserrat'] text-xs font-bold uppercase tracking-wider ${style.text}`}>
            {title}
          </h2>
        </div>
        <span className={`font-['Montserrat'] text-xs font-bold ${style.text}`}>
          ({students.length})
        </span>
      </div>
      <table className='w-full border border-black text-[10px]'>
        <thead>
          <tr className='bg-[#5b7a8b]'>
            {COLUMNS.map(col => (
              <th
                key={col}
                className="font-['Montserrat'] border border-black py-2 px-3 text-center text-xs font-bold text-white">
                {col}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {students.map((student, i) => (
            <tr key={i} className='print:break-inside-avoid'>
              <td className='border border-black py-2 px-3 text-left align-top'>
                <div className='flex flex-col gap-1 items-start'>
                  <span className='text-[#4d4b4b]'>{student.name}</span>
                  <div className='flex items-center gap-1 flex-wrap'>
                    <ServiceStatusTag status={student.service_status} />
                    <ReturningAbsentBadge status={student.returning_absent_status ?? undefined} />
                  </div>
                </div>
              </td>

              <td className='border border-black py-1.5 px-2 text-center text-[#4d4b4b]'>
                {student.grade}
              </td>

              <td className='border border-black py-1.5 px-2 text-center'>
                {student.result && student.result !== 'N/A' ? (
                  <div className='flex items-center justify-center gap-1.5'>
                    <ResultBadge result={student.result} />
                    {student.result_year && (
                      <span className='text-[10px] text-gray-400 whitespace-nowrap'>
                        {student.result_year}
                      </span>
                    )}
                  </div>
                ) : (
                  <span className='text-[10px] text-gray-400 italic'>No Screening Recorded</span>
                )}
              </td>

              <td className='border border-black py-1.5 px-2 text-center'>
                <ProgramBadge status={student.program_status} />
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
    </div>
  )
}

const ProgramCaseloadView = ({ data }: { data: ProgramCaseloadData }) => {
  const { context } = data

  const students: CaseloadStudent[] = [
    ...(context.qualified ? context.qualified_students : []),
    ...(context.sub ? context.sub_students : []),
    ...(context.graduated ? context.graduated_students : []),
  ]

  const qualifiedCount = students.filter(student => student.program_status === 'qualified').length
  const subCount = students.filter(student => student.program_status === 'sub').length
  const graduatedCount = students.filter(student => student.program_status === 'graduated').length
  const pausedCount = students.filter(student => student.service_status === 'paused').length

  return (
    <div className="font-['Nunito']">
      <link
        rel='stylesheet'
        href='https://fonts.googleapis.com/css2?family=Gotu&family=Montserrat:ital,wght@0,400;0,700;1,400&family=Nunito:wght@400;700&display=swap'
      />

      <section className='bg-white shadow-sm w-full print:shadow-none'>
        <ReportBanner title='Program Caseload' />
        <div className='px-10 pt-5'>
          <div className='flex justify-between mb-3'>
            <p>
              <span className='font-bold text-gray-900'>School: </span>
              {context.school}
            </p>
            <p>
              <span className='font-bold text-gray-900'>Student Count: </span>
              {context.student_count}
            </p>

            <p>
              <span className='font-bold text-gray-900'>School Year: </span>
              {context.academic_year}
            </p>
          </div>

          <div className='flex justify-between mb-3'>
            <p>
              <span className='font-bold text-gray-900'>Qualified: </span>
              {qualifiedCount}
            </p>
            <p>
              <span className='font-bold text-gray-900'>Sub: </span>
              {subCount}
            </p>
            <p>
              <span className='font-bold text-gray-900'>Graduated: </span>
              {graduatedCount}
            </p>
            <p>
              <span className='font-bold text-gray-900'>Paused/Away: </span>
              {pausedCount}
            </p>
          </div>

          {students.length === 0 ? (
            <p className='text-sm text-gray-500 mt-4'>
              No qualified, sub, or graduated students this year.
            </p>
          ) : (
            <>
              {context.qualified && (
                <CaseloadSection
                  title='Qualified'
                  status='qualified'
                  students={context.qualified_students}
                />
              )}
              {context.sub && (
                <CaseloadSection title='Sub' status='sub' students={context.sub_students} />
              )}
              {context.graduated && (
                <CaseloadSection
                  title='Graduated'
                  status='graduated'
                  students={context.graduated_students}
                />
              )}
            </>
          )}
        </div>
        <ReportFooter brand='NORTHERN VOICES SPEECH SERVICES' />
      </section>
    </div>
  )
}

export default ProgramCaseloadView
