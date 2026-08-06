import { DEVELOPMENTAL_CHART } from '@/constants/developmentalSpeechChart'

interface NonCompliantReportData {
  context: {
    student_name: string
    date_of_screening: string
    grade: string
  }
}

const ReportHeader = () => (
  <div className='flex items-center gap-3 mb-4'>
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
  <div className='flex items-center justify-between border-t border-gray-200 pt-3 text-xs text-gray-500'>
    <span>NORTHERN VOICES SPEECH SERVICES</span>
    <span className='flex items-center gap-2'>
      <img src='/icon.png' alt='' className='w-4 h-4' />
      {page} of {of}
    </span>
  </div>
)

const NonCompliantSpeechReportView = ({ data }: { data: NonCompliantReportData }) => {
  const { context } = data

  return (
    <div className="space-y-6 print:space-y-0 font-['Nunito']">
      <link
        rel='stylesheet'
        href='https://fonts.googleapis.com/css2?family=Gotu&family=Montserrat:ital,wght@0,400;0,700;1,400&family=Nunito:wght@400;700&display=swap'
      />

      <section className='bg-white shadow-sm w-full aspect-[8.5/11] pt-6 px-10 pb-8 flex flex-col break-after-page print:shadow-none print:pt-6 print:px-10 print:pb-8'>
        <ReportHeader />

        <div className='flex-1'>
          <h1 className="text-4xl font-light text-gray-500 tracking-wide mb-5 text-center font-['Gotu']">
            SPEECH SCREEN REPORT
          </h1>

          <p className='font-semibold text-gray-900 mb-1'>DEAR PARENT(S)/GUARDIAN(S):</p>
          <p className='text-gray-700 leading-relaxed mb-4'>
            A speech and language pathologist (SLP) recently visited your child's school to
            conduct class-wide speech screens. Unfortunately, your child did not feel comfortable
            completing the screening, and so there are no results to share at this time. If you
            would like us to try again, or if you have any concerns about your child's speech
            development, please feel free to connect with the school to see if another screening
            attempt is possible.
          </p>

          <p className='font-bold text-gray-900 mb-1.5'>SPEECH SCREEN REPORT:</p>
          <div className='space-y-0.5 text-gray-800 mb-4'>
            <p>Student's Name: {context.student_name}</p>
            <p>Grade: {context.grade}</p>
            <p>Date of Screening: {context.date_of_screening}</p>
          </div>

          <p className='font-bold text-gray-900 mb-3'>DEVELOPMENTAL SPEECH SOUND CHART:</p>
          <p className='text-gray-700 leading-relaxed mb-4'>
            This chart provides a general guideline for when children typically develop and
            master specific speech sounds. It's important to start practicing these sounds
            before the age of expected mastery to proactively address any potential speech
            difficulties.
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
            <span className='font-bold'>Please note:</span> Children are unique and develop
            speech at their own pace. This chart is meant to serve as a guide, not a strict
            timeline.
          </p>
        </div>

        <ReportFooter page={1} of={2} />
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

export default NonCompliantSpeechReportView
