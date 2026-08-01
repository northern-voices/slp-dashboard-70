import { REPORT_RESULTS_TEXT } from '@/constants/reportResultsText'
import { DEVELOPMENTAL_CHART } from '@/constants/developmentalSpeechChart'

interface ProcessedError {
  sound: string
  pattern: string
  example: string
  targetSound: string
  week?: number
}

interface StudentSpeechReportData {
  metadata?: { file_name?: string }
  template?: { name?: string }
  context: {
    student_name: string
    date_of_screening: string
    grade: string
    errors: ProcessedError[]
    code?: string
  }
}

const ReportHeader = () => (
  <div className='flex items-center gap-3 mb-10'>
    <img src='/icon.png' alt='' className='w-10 h-10' />
    <div className='leading-tight'>
      <p className='font-bold text-sm tracking-wide text-gray-900'>NORTHERN VOICES</p>
      <p className="font-['Montserrat'] text-[10px] tracking-[0.2em] text-gray-500">
        SPEECH SERVICES
      </p>
    </div>
  </div>
)

const ReportFooter = ({ page, of }: { page: number; of: number }) => (
  <div className='flex items-center justify-between border-t border-gray-200 pt-3 mt-10 text-xs text-gray-500'>
    <span>NORTHERN VOICES SPEECH SERVICES</span>
    <span className='flex items-center gap-2'>
      <img src='/icon.png' alt='' className='w-4 h-4' />
      {page} of {of}
    </span>
  </div>
)

const StudentSpeechReportView = ({ data }: { data: StudentSpeechReportData }) => {
  const { context, template } = data
  const copy = template?.name ? REPORT_RESULTS_TEXT[template.name] : undefined

  return (
    <div className="space-y-6 print:space-y-0 font-['Nunito']">
      <link
        rel='stylesheet'
        href='https://fonts.googleapis.com/css2?family=Gotu&family=Montserrat:ital,wght@0,400;0,700;1,400&family=Nunito:wght@400;700&display=swap'
      />

      {/* Page 1 */}
      <section className='bg-white shadow-sm w-full p-10 break-after-page print:shadow-none print:p-10'>
        <ReportHeader />

        <h1 className="text-4xl font-light text-gray-500 tracking-wide mb-8 text-center font-['Gotu']">
          SPEECH SCREEN REPORT
        </h1>

        <p className='font-semibold text-gray-900 mb-2'>DEAR PARENT(S)/GUARDIAN(S):</p>
        <p className='text-gray-700 leading-snug tracking-tight mb-6'>
          A speech and language pathologist (SLP) recently conducted speech screens at your child's
          school. This report outlines your child's results and provides guidance on steps you can
          take to further support your child's speech development.
        </p>

        <p className='font-bold text-gray-900 mb-3'>SPEECH SCREEN REPORT:</p>
        <div className='space-y-0.5 text-gray-800 mb-6'>
          <p>Student's Name: {context.student_name}</p>
          <p>Grade: {context.grade}</p>
          <p>Date of Screening: {context.date_of_screening}</p>
        </div>

        <p className='text-center text-gray-800 mb-6'>
          Results:{' '}
          <span className='font-bold'>
            {copy?.resultsText ?? template?.name ?? 'Results pending'}
          </span>
        </p>

        {context.errors.length === 0 ? (
          <p className='text-gray-600 mb-6'>
            No speech sound errors were identified in this screening.
          </p>
        ) : (
          <table className='w-full border border-gray-300 text-sm mb-6 break-inside-avoid'>
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
              {context.errors.map((error, i) => (
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
        )}

        {copy?.footerNote && (
          <p className="font-['Montserrat'] text-sm italic text-gray-600">{copy.footerNote}</p>
        )}

        <ReportFooter page={1} of={2} />
      </section>

      {/* Page 2 */}
      <section className='bg-white shadow-sm w-full p-10 print:shadow-none print:p-10'>
        <ReportHeader />

        <p className='font-bold text-gray-900 mb-3'>DEVELOPMENTAL SPEECH SOUND CHART:</p>
        <p className='text-gray-700 leading-relaxed mb-6'>
          This chart provides a general guideline for when children typically develop and master
          specific speech sounds. It's important to start practicing these sounds before the age of
          expected mastery to proactively address any potential speech difficulties.
        </p>

        <table className='w-full border border-gray-300 text-sm mb-6 break-inside-avoid'>
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
          <span className='font-bold'>Please note:</span> Children are unique and develop speech at
          their own pace. This chart is meant to serve as a guide, not a strict timeline.
        </p>

        <ReportFooter page={2} of={2} />
      </section>
    </div>
  )
}

export default StudentSpeechReportView
