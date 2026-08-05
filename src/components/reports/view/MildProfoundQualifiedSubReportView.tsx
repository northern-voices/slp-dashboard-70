import { DEVELOPMENTAL_CHART } from '@/constants/developmentalSpeechChart'

interface ProcessedError {
  sound: string
  pattern: string
  example: string
  targetSound: string
  week?: number
}

interface MildProfoundQualifiedSubReportData {
  context: {
    student_name: string
    date_of_screening: string
    grade: string
    school: string
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

const MildProfoundQualifiedSubReportView = ({
  data,
}: {
  data: MildProfoundQualifiedSubReportData
}) => {
  const { context } = data
  const errorChunks = chunkErrorRows(context.errors)
  const totalPages = errorChunks.length + 3

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

            <ReportFooter page={i + 1} of={totalPages} />
          </section>
        )
      })}

      {/* Developmental chart page */}
      <section className='bg-white shadow-sm w-full aspect-[8.5/11] pt-6 px-10 pb-8 flex flex-col break-after-page print:shadow-none print:pt-6 print:px-10 print:pb-8'>
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

        <ReportFooter page={errorChunks.length + 1} of={totalPages} />
      </section>

      {/* School Speech Program page */}
      <section className='bg-white shadow-sm w-full aspect-[8.5/11] pt-6 px-10 pb-8 flex flex-col break-after-page print:shadow-none print:pt-6 print:px-10 print:pb-8'>
        <ReportHeader />

        <div className='flex-1'>
          <h1 className="text-4xl font-light text-gray-500 tracking-wide mb-5 text-center font-['Gotu']">
            SCHOOL SPEECH PROGRAM
          </h1>

          <p className='text-gray-700 leading-relaxed mb-4'>
            Your child is welcome to participate in the{' '}
            <span className="font-['Montserrat'] italic">Northern Voices Speech Services</span>{' '}
            (NVSS) program at the school to assist them with their speech development. This is an
            important step towards enhancing your child's communication abilities. Early
            intervention is key to improving speech outcomes, and our team is dedicated to
            supporting your child's progress!
          </p>

          <p className='text-gray-700 leading-relaxed mb-4'>
            Many people know that speech sound disorders can affect a child's ability to be
            understood by others, but what they might not realize are the long-term consequences
            that can occur when they are left untreated. Communication difficulties can profoundly
            impact social behaviour, self-esteem, relationships, literacy, learning, and overall
            academic performance. In fact, the ability to communicate effectively is the very
            foundation of a child's overall development and academic achievement, and early
            intervention is crucial! The earlier support can be provided, the better the outcome.
          </p>

          <p className='text-gray-700 leading-relaxed mb-4'>
            Students involved in the NVSS school speech program will participate in one-on-one
            sessions with an Educational Assistant who has received extensive training to help
            children enhance their speech. Sessions will follow an individualized therapy program
            developed by the Speech Language Pathologist.
          </p>
        </div>

        <ReportFooter page={errorChunks.length + 2} of={totalPages} />
      </section>

      {/* Informed Consent page */}
      <section className='bg-white shadow-sm w-full aspect-[8.5/11] pt-6 px-10 pb-8 flex flex-col break-after-page print:shadow-none print:pt-6 print:px-10 print:pb-8'>
        <ReportHeader />

        <div className='flex-1'>
          <h1 className="text-3xl font-light text-gray-500 tracking-wide text-center font-['Gotu'] mb-1">
            INFORMED CONSENT
          </h1>
          <p className='text-center font-bold text-gray-500 text-sm tracking-wide mb-5'>
            PARTICIPATING IN THE SCHOOL SPEECH PROGRAM
          </p>

          <div className='flex gap-6 mb-4 text-sm'>
            <div className='flex-1 flex items-end gap-1'>
              <span>Student:</span>
              <span className='flex-1 border-b border-black h-3' />
            </div>
            <div className='flex-1 flex items-end gap-1'>
              <span>School:</span>
              <span className='flex-1 border-b border-black h-3' />
            </div>
          </div>

          <p className='font-bold text-gray-900 mb-1'>DEAR PARENT(S) / GUARDIANS(S):</p>
          <p className='text-gray-700 leading-relaxed mb-3'>
            Your child is eligible to receive speech services through the{' '}
            <span className='font-bold'>Northern Voices Speech Services</span> School Program at
            school. If you agree to your child receiving these services, please sign below.
          </p>

          <p className='text-gray-700 leading-relaxed mb-3'>
            <span className='font-bold'>SPEECH SCREEN RESULTS | </span>
            The results of a recent speech screen administered at the school indicated that your
            child demonstrated some difficulties with certain speech sounds and may benefit from
            targeted practice with a trained adult. Please see the attached report for details
            outlining specific speech errors identified.
          </p>

          <p className='text-gray-700 leading-relaxed mb-3'>
            <span className='font-bold'>PROGRAM | </span>
            The speech program is designed to provide opportunities for your child to practice
            their speech sounds to help them strengthen their communication skills. Improvements in
            speech may also support growth in literacy and academic learning, while also
            encouraging confidence and positive social interactions.
          </p>

          <p className='text-gray-700 leading-relaxed mb-3'>
            Students involved in the Northern Voices Speech Program will participate in one-on-one
            speech practice sessions ran by a trained Educational Assistant (working under the
            guidance of the contracted speech-language pathologist). Frequency of sessions will
            depend on severity of speech difficulties. Your child's student plan would be developed
            by the Speech Therapist, and tailored to your child's speech screen results.
          </p>

          <p className='text-gray-700 leading-relaxed mb-3'>
            You may request a copy of your child's speech practice plan or progress updates at any
            time. Any personal information collected is kept confidential and will only be shared
            with those directly involved in your child's educational program, in line with privacy
            legislation and professional standards of practice. Participation in the program is
            voluntary, and you may withdraw your consent at any time by notifying the school.
          </p>

          <p className='font-bold text-gray-900 mb-1'>CONSENT</p>
          <p className='text-gray-700 leading-relaxed mb-3'>
            I have read the information above and understand the purpose and process of the NVSS
            school speech program:
          </p>

          <div className='flex items-center gap-1.5 mb-4'>
            <div className='w-2.5 h-2.5 border border-black shrink-0' />
            <span className='text-sm'>
              I consent to my child participating in the NVSS school speech program.
            </span>
          </div>

          <div className='flex gap-6 mb-1'>
            <span className='flex-1 border-b border-black h-4' />
            <span className='flex-1 border-b border-black h-4' />
          </div>
          <div className='flex gap-6 mb-4 text-xs text-gray-700'>
            <span className='flex-1'>Parent/Caregiver Name</span>
            <span className='flex-1'>Child's Name</span>
          </div>

          <div className='flex gap-6 mb-1'>
            <span className='flex-1 border-b border-black h-4' />
            <span className='flex-1 border-b border-black h-4' />
          </div>
          <div className='flex gap-6 mb-4 text-xs text-gray-700'>
            <span className='flex-1'>Parent/Caregiver Signature</span>
            <span className='flex-1'>Date</span>
          </div>

          <div className='flex flex-col items-end gap-1 text-xs text-gray-700'>
            <span className='font-bold text-gray-900 text-sm mb-0.5'>Consent Attained:</span>
            <span className='flex items-center gap-1.5'>
              <span className='w-6 border-b border-black h-2.5' /> In Person
            </span>
            <span className='flex items-center gap-1.5'>
              <span className='w-6 border-b border-black h-2.5' /> By Phone
            </span>
            <span className='flex items-center gap-1.5'>
              <span className='w-6 border-b border-black h-2.5' /> By Video
            </span>
          </div>
        </div>

        <ReportFooter page={errorChunks.length + 3} of={totalPages} />
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

export default MildProfoundQualifiedSubReportView
