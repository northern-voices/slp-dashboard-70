import { ReportBanner, ReportFooter } from './shared/ReportBannerChrome'

interface ProgressTableError {
  sound: string
  pattern: string
  example: string
  initial_screen: string
  progress_screen: string
  summary: string
}

interface SpeechProgressReportData {
  context: {
    student_name: string
    grade: string
    school: string
    initial_screen_date: string
    progress_screen_date: string
    primary_table_errors: ProgressTableError[]
    progress_notes: string
  }
}

const ROWS_FIRST_PAGE = 10
const ROWS_PER_CONTINUATION_PAGE = 14

const chunkRows = (errors: ProgressTableError[]): ProgressTableError[][] => {
  if (errors.length === 0) return [[]]
  if (errors.length <= ROWS_FIRST_PAGE) return [errors]

  const chunks = [errors.slice(0, ROWS_FIRST_PAGE)]

  for (let i = ROWS_FIRST_PAGE; i < errors.length; i += ROWS_PER_CONTINUATION_PAGE) {
    chunks.push(errors.slice(i, i + ROWS_PER_CONTINUATION_PAGE))
  }
  return chunks
}

const ProgressTable = ({ errors }: { errors: ProgressTableError[] }) => (
  <table className='w-full border border-black text-[10px] mb-3'>
    <thead>
      <tr className='bg-[#f2f2f2]'>
        <th className="font-['Montserrat'] border border-black py-1.5 px-1.5 text-center text-[8px] font-bold">
          SOUND
        </th>
        <th className="font-['Montserrat'] border border-black py-1.5 px-1.5 text-center text-[8px] font-bold">
          ERROR PATTERN
        </th>
        <th className="font-['Montserrat'] border border-black py-1.5 px-1.5 text-center text-[8px] font-bold">
          EXAMPLE
        </th>
        <th className="font-['Montserrat'] border border-black py-1.5 px-1.5 text-center text-[8px] font-bold">
          INITIAL SCREEN
        </th>
        <th className="font-['Montserrat'] border border-black py-1.5 px-1.5 text-center text-[8px] font-bold">
          PROGRESS SCREEN
        </th>
        <th className="font-['Montserrat'] border border-black py-1.5 px-1.5 text-center text-[8px] font-bold">
          SUMMARY
        </th>
      </tr>
    </thead>
    <tbody>
      {errors.map((error, i) => (
        <tr key={i}>
          <td className='border border-black py-1.5 px-1.5 text-center text-[#4d4b4b]'>
            {error.sound}
          </td>
          <td className='border border-black py-1.5 px-1.5 text-center text-[#4d4b4b]'>
            {error.pattern}
          </td>
          <td className='border border-black py-1.5 px-1.5 text-center text-[#4d4b4b]'>
            {error.example}
          </td>
          <td className='border border-black py-1.5 px-1.5 text-center text-[#4d4b4b]'>
            {error.initial_screen}
          </td>
          <td className='border border-black py-1.5 px-1.5 text-center text-[#4d4b4b]'>
            {error.progress_screen}
          </td>
          <td className='border border-black py-1.5 px-1.5 text-center text-[#4d4b4b]'>
            {error.summary}
          </td>
        </tr>
      ))}
    </tbody>
  </table>
)

const SpeechProgressReportView = ({ data }: { data: SpeechProgressReportData }) => {
  const { context } = data
  const rowChunks = chunkRows(context.primary_table_errors ?? [])
  const totalPages = rowChunks.length

  return (
    <div className="space-y-6 print:space-y-0 font-['Nunito']">
      <link
        rel='stylesheet'
        href='https://fonts.googleapis.com/css2?family=Gotu&family=Montserrat:ital,wght@0,400;0,700;1,400&family=Nunito:wght@400;700&display=swap'
      />

      {rowChunks.map((chunk, i) => {
        const isFirstPage = i === 0
        const isLastPage = i === rowChunks.length - 1

        return (
          <section
            key={i}
            className='bg-white shadow-sm w-full aspect-[8.5/11] flex flex-col overflow-hidden break-after-page print:shadow-none'>
            <ReportBanner title='Student Progress Report' titleClassName='text-[28px]' />

            <div className='flex-1 px-10 pt-5'>
              {isFirstPage && (
                <>
                  <div className='flex mb-1.5'>
                    <p className='flex-1'>
                      <span className='font-bold text-gray-900'>Student: </span>
                      {context.student_name}
                    </p>
                    <p className='flex-1'>
                      <span className='font-bold text-gray-900'>Grade: </span>
                      {context.grade}
                    </p>
                  </div>
                  <p className='mb-1.5'>
                    <span className='font-bold text-gray-900'>School: </span>
                    {context.school}
                  </p>
                  <p className='mb-1.5'>
                    <span className='font-bold text-gray-900'>Initial Screening Date: </span>
                    {context.initial_screen_date}
                  </p>
                  <p className='mb-1.5'>
                    <span className='font-bold text-gray-900'>Progress Screening Date: </span>
                    {context.progress_screen_date}
                  </p>

                  <h2 className="text-xl text-gray-600 text-center font-['Gotu'] mt-2 mb-3">
                    SOUND SUMMARY
                  </h2>
                </>
              )}

              <ProgressTable errors={chunk} />

              {isLastPage && (
                <>
                  <p className='text-sm text-gray-700 leading-relaxed mb-3'>
                    <span className='font-bold text-gray-900'>Please note: </span>
                    Students often show meaningful improvement during practice activities with
                    support, cues and adult modelling before these skills are demonstrated during
                    formal testing.
                  </p>

                  {context.progress_notes && (
                    <div>
                      <p className='font-bold text-gray-900 mb-1'>Summary Notes:</p>
                      <p className='text-sm text-gray-700 leading-relaxed'>
                        {context.progress_notes}
                      </p>
                    </div>
                  )}
                </>
              )}
            </div>

            <ReportFooter brand='NORTHERN VOICES SPEECH SERVICES' page={i + 1} of={totalPages} />
          </section>
        )
      })}
    </div>
  )
}

export default SpeechProgressReportView
