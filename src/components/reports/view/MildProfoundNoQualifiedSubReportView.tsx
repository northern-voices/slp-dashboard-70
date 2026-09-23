import { DEVELOPMENTAL_CHART } from '@/constants/developmentalSpeechChart'
import { ReportHeader, ReportFooter } from './shared/ReportSimpleChrome'

interface ProcessedError {
  sound: string
  pattern: string
  example: string
  targetSound: string
  week?: number
}

interface MildProfoundNoQualifiedSubReportData {
  context: {
    student_name: string
    date_of_screening: string
    grade: string
    errors: ProcessedError[]
  }
}

const ERRORS_FIRST_PAGE = 17
const ERRORS_PER_CONTINUATION_PAGE = 24

const chunkErrorRows = (errors: ProcessedError[]): ProcessedError[][] => {
  if (errors.length === 0) return [[]]
  if (errors.length <= ERRORS_FIRST_PAGE) return [errors]

  const chunks = [errors.slice(0, ERRORS_FIRST_PAGE)]
  for (let i = ERRORS_FIRST_PAGE; i < errors.length; i += ERRORS_PER_CONTINUATION_PAGE) {
    chunks.push(errors.slice(i, i + ERRORS_PER_CONTINUATION_PAGE))
  }
  return chunks
}

const ErrorsTable = ({ errors }: { errors: ProcessedError[] }) => (
  <table className='w-full border border-gray-300 text-sm mb-3 break-inside-avoid'>
    <thead>
      <tr className='bg-gray-50'>
        <th className="font-['Montserrat'] border border-gray-300 py-2 px-3 text-center text-xs font-bold tracking-wide">
          ERROR SOUND
        </th>
        <th className="font-['Montserrat'] border border-gray-300 py-2 px-3 text-center text-xs font-bold tracking-wide">
          ERROR PATTERN EXHIBITED
        </th>
        <th className="font-['Montserrat'] border border-gray-300 py-2 px-3 text-center text-xs font-bold tracking-wide">
          EXAMPLE
        </th>
      </tr>
    </thead>
    <tbody>
      {errors.map((error, i) => (
        <tr key={i}>
          <td className='border border-gray-300 py-2 px-3 text-center'>
            {error.targetSound || error.sound}
          </td>
          <td className='border border-gray-300 py-2 px-3 text-center'>{error.pattern}</td>
          <td className='border border-gray-300 py-2 px-3 text-center'>{error.example}</td>
        </tr>
      ))}
    </tbody>
  </table>
)

const MildProfoundNoQualifiedSubReportView = ({
  data,
}: {
  data: MildProfoundNoQualifiedSubReportData
}) => {
  const { context } = data
  const errorChunks = chunkErrorRows(context.errors)
  const totalPages = errorChunks.length + 2

  return (
    <div className="space-y-6 print:space-y-0 font-['Nunito']">
      <link
        rel='stylesheet'
        href='https://fonts.googleapis.com/css2?family=Gotu&family=Montserrat:ital,wght@0,400;0,700;1,400&family=Nunito:wght@400;700&display=swap'
      />
      {errorChunks.map((chunk, i) => {
        const isFirstPage = i === 0

        return (
          <section
            key={i}
            className='bg-white shadow-sm w-full aspect-[8.5/11] pt-6 px-10 pb-8 flex flex-col break-after-page print:shadow-none print:pt-6 print:px-10 print:pb-8'>
            <ReportHeader />

            <div className='flex-1'>
              {isFirstPage && (
                <>
                  <h1 className="text-4xl font-light text-gray-500 tracking-wide mb-5 text-center font-['Gotu']">
                    SPEECH SCREEN REPORT
                  </h1>

                  <p className='font-semibold text-gray-900 mb-1'>DEAR PARENT(S)/GUARDIAN(S):</p>
                  <p className='text-gray-700 leading-tight tracking-tighter mb-2'>
                    A speech and language pathologist (SLP) recently conducted speech screens at
                    your child's school. This report outlines your child's results and provides
                    guidance on steps you can take to further support your child's speech
                    development.
                  </p>

                  <p className='font-bold text-gray-900 mb-1.5'>SPEECH SCREEN REPORT:</p>
                  <div className='space-y-0.5 text-gray-800 mb-3'>
                    <p>Student's Name: {context.student_name}</p>
                    <p>Grade: {context.grade}</p>
                    <p>Date of Screening: {context.date_of_screening}</p>
                  </div>
                </>
              )}

              {chunk.length === 0 ? (
                <p className='text-gray-600 mb-3'>
                  No speech sound errors were identified in this screening.
                </p>
              ) : (
                <ErrorsTable errors={chunk} />
              )}
            </div>

            <ReportFooter page={i + 1} of={totalPages} brand='NORTHERN VOICES SPEECH SERVICES' />
          </section>
        )
      })}

      {/* Developmental chart page */}
      <section className='bg-white shadow-sm w-full aspect-[8.5/11] pt-6 px-10 pb-8 flex flex-col print:shadow-none print:pt-6 print:px-10 print:pb-8'>
        <ReportHeader />

        <div className='flex-1'>
          <p className='font-bold text-gray-900 mb-3'>DEVELOPMENTAL SPEECH SOUND CHART:</p>
          <p className='text-gray-700 leading-relaxed mb-6'>
            This chart provides a general guideline for when children typically develop and master
            specific speech sounds. It's important to start practicing these sounds before the age
            of expected mastery to proactively address any potential speech difficulties.
          </p>

          <table className='w-full border border-gray-300 text-sm mb-4 break-inside-avoid'>
            <thead>
              <tr className='bg-gray-50'>
                <th className="font-['Montserrat'] border border-gray-300 py-2 px-3 text-center text-xs font-bold tracking-wide">
                  AGE RANGE
                </th>
                <th className="font-['Montserrat'] border border-gray-300 py-2 px-3 text-center text-xs font-bold tracking-wide">
                  DEVELOPING SOUNDS
                </th>
                <th className="font-['Montserrat'] border border-gray-300 py-2 px-3 text-center text-xs font-bold tracking-wide">
                  EXPECTED MASTERY
                </th>
              </tr>
            </thead>
            <tbody>
              {DEVELOPMENTAL_CHART.map(row => (
                <tr key={row.ageRange}>
                  <td className='border border-gray-300 py-2 px-3 text-center'>{row.ageRange}</td>
                  <td className='border border-gray-300 py-2 px-3 text-center'>{row.sounds}</td>
                  <td className='border border-gray-300 py-2 px-3 text-center'>{row.mastery}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <p className='text-gray-700 leading-relaxed'>
            Remember, every child is unique in their development. The above chart serves as a
            general guide.
          </p>
        </div>

        <ReportFooter
          page={errorChunks.length + 1}
          of={totalPages}
          brand='NORTHERN VOICES SPEECH SERVICES'
        />
      </section>

      <section className='bg-white shadow-sm w-full overflow-hidden'>
        <img
          src='/teachspeech-app-poster.jpg'
          alt='Free access to the NVSS TeachSpeech app'
          className='w-full h-auto block'
        />
      </section>
    </div>
  )
}

export default MildProfoundNoQualifiedSubReportView
