import { ReportBanner, ReportFooter } from './shared/ReportBannerChrome'
import { ResultBadge, ProgramBadge, ServiceStatusTag } from '@/components/caseload/CaseloadBadges'
import { ServiceStatus, ProgramStatus } from '@/types/database'

interface ScreeningReportRow {
  name: string
  grade: string
  result: string
  program_status: ProgramStatus
  service_status?: ServiceStatus
  date: string
  screener: string
}

interface ScreeningsTableData {
  context: {
    school: string
    screening_count: number
    academic_year: string
    screenings: ScreeningReportRow[]
  }
}

const COLUMNS = ['STUDENT NAME', 'RESULT', 'PROGRAM', 'GRADE', 'DATE', 'SCREENER']

const ScreeningsTableView = ({ data }: { data: ScreeningsTableData }) => {
  const { context } = data
  const screenings = context.screenings

  return (
    <div className="font-['Nunito']">
      <link
        rel='stylesheet'
        href='https://fonts.googleapis.com/css2?family=Gotu&family=Montserrat:ital,wght@0,400;0,700;1,400&family=Nunito:wght@400;700&display=swap'
      />

      <section className='bg-white shadow-sm w-full print:shadow-none'>
        <ReportBanner title='Speech Screenings' />
        <div className='px-10 pt-5'>
          <h2 className="text-xl text-gray-600 text-center font-['Gotu'] mb-4">Screenings</h2>
          <div className='flex justify-between mb-3'>
            <p>
              <span className='font-bold text-gray-900'>School: </span>
              {context.school}
            </p>
            <p>
              <span className='font-bold text-gray-900'>Screening Count: </span>
              {context.screening_count}
            </p>
          </div>

          {screenings.length === 0 ? (
            <p className='text-sm text-gray-500 mt-4'>
              No speech screenings match the selected filters.
            </p>
          ) : (
            <table className='w-full border border-black text-[10px] mb-6'>
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
                {screenings.map((screening, i) => (
                  <tr key={i} className='print:break-inside-avoid'>
                    <td className='border border-black py-2 px-3 text-left align-top'>
                      <div className='flex flex-col gap-1 items-start'>
                        <span className='text-[#4d4b4b]'>{screening.name}</span>
                        <ServiceStatusTag status={screening.service_status} />
                      </div>
                    </td>

                    <td className='border border-black py-1.5 px-2 text-center'>
                      {screening.result && screening.result !== 'N/A' ? (
                        <ResultBadge result={screening.result} />
                      ) : (
                        <span className='text-[10px] text-gray-400 italic'>
                          No Screening Recorded
                        </span>
                      )}
                    </td>

                    <td className='border border-black py-1.5 px-2 text-center'>
                      <ProgramBadge status={screening.program_status} />
                    </td>

                    <td className='border border-black py-1.5 px-2 text-center text-[#4d4b4b]'>
                      {screening.grade}
                    </td>

                    <td className='border border-black py-1.5 px-2 text-center text-[#4d4b4b]'>
                      {screening.date}
                    </td>

                    <td className='border border-black py-1.5 px-2 text-center text-[#4d4b4b]'>
                      {screening.screener}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
        <ReportFooter brand='NORTHERN VOICES SPEECH SERVICES' />
      </section>
    </div>
  )
}

export default ScreeningsTableView
