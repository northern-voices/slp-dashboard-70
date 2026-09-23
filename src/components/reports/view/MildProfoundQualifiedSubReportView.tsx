import { DEVELOPMENTAL_CHART } from '@/constants/developmentalSpeechChart'
import { ReportHeader, ReportFooter } from './shared/ReportSimpleChrome'

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
  const totalPages = errorChunks.length + 5

  return (
    <div className="space-y-6 print:space-y-0 font-['Nunito']">
      <link
        rel='stylesheet'
        href='https://fonts.googleapis.com/css2?family=Gotu&family=Montserrat:ital,wght@0,400;0,700;1,400&family=Nunito:wght@400;700&family=Alex+Brush&display=swap'
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

        <ReportFooter
          page={errorChunks.length + 1}
          of={totalPages}
          brand='NORTHERN VOICES SPEECH SERVICES'
        />
      </section>

      {/* School Speech Program page */}
      <section className='bg-white shadow-sm w-full aspect-[8.5/11] pt-6 px-10 pb-8 flex flex-col break-after-page print:shadow-none print:pt-6 print:px-10 print:pb-8'>
        <ReportHeader />

        <div className='flex-1'>
          <h1 className="text-4xl font-light text-gray-500 tracking-wide mb-5 text-center font-['Gotu']">
            SCHOOL SPEECH PROGRAM
          </h1>

          <p className='text-gray-700 leading-relaxed mb-4 font-bold'>
            Your child is welcome to participate in the{' '}
            <span className="font-['Montserrat'] italic">Northern Voices</span> school speech
            program to support them with their speech development.
          </p>
          <p className='text-gray-700 leading-relaxed mb-4'>
            Strong communication skills play a big role in confidence, relationships, classroom
            participation, literacy and learning. Providing early speech support gives children the
            opportunity to strengthen these skills in a supportive and encouraging environment. Our
            goal is to help your child improve their speech and strengthen their communication
            skills. We are excited to work with your child to support their progress!
          </p>
          <p className='text-gray-700 leading-relaxed mb-4'>
            Students participating in the school speech program will take part in one-on-one speech
            practice sessions with a trained adult. Each child will follow an individualized speech
            plan developed and overseen by a Speech-Language Pathologist, with activities tailored
            to their specific speech needs. This gives your child opportunities to practise their
            speech skills and build confidence in their communication.
          </p>
          <p className='text-gray-700 leading-relaxed mb-4'>
            The frequency of speech practice sessions may vary throughout the school year based on
            your child's individual needs, the size of the school's speech caseload, and staff
            availability. Some students may participate in regular weekly sessions, while others may
            receive periodic speech practice or support throughout the year. We encourage you to
            connect with your school team and/or the Speech-Language Pathologist at any time if you
            would like to learn more about your child's speech plan, session frequency, or progress.
          </p>
          <p className='text-gray-700 leading-relaxed mb-4 font-bold'>
            We look forward to supporting your child and celebrating their progress throughout the
            school year!
          </p>
          <p className="font-['Alex_Brush'] text-3xl text-gray-900 mb-1">L. Brillinger</p>
          <p className='text-xs text-gray-700'>Lisa Brillinger, M.Sc., SLP | Registered SK, ON</p>
          <p className='text-xs text-gray-700'>lbrillinger@northern-voices.ca</p>
          <p className='text-xs text-gray-700'>(306) 930-0009</p>
        </div>

        <ReportFooter
          page={errorChunks.length + 2}
          of={totalPages}
          brand='NORTHERN VOICES SPEECH SERVICES'
        />
      </section>

      {/* Consent page 1 of 3 */}
      <section className='bg-white shadow-sm w-full aspect-[8.5/11] flex flex-col break-after-page print:shadow-none'>
        <div className='bg-[#55707C] px-10 py-6 flex items-center justify-between'>
          <h1 className="font-['Gotu'] text-2xl text-white leading-snug">
            CONSENT TO PARTICIPATE IN
            <br />
            THE SCHOOL SPEECH PROGRAM
          </h1>
          <div className='flex items-center gap-2 shrink-0 ml-4'>
            <img src='/icon.png' alt='' className='w-8 h-8 object-cover shrink-0' />
            <div className='text-right leading-tight'>
              <p className='font-bold text-sm tracking-wide text-white'>NORTHERN VOICES</p>
              <p className="font-['Montserrat'] text-[10px] tracking-[0.2em] text-gray-200">
                SPEECH SERVICES
              </p>
            </div>
          </div>
        </div>

        <div className='flex-1 flex flex-col px-10 pt-5 pb-8 print:px-10 print:pt-5 print:pb-8'>
          <div className='flex-1'>
            <div className='flex gap-6 mb-4 text-sm'>
              <div className='flex-1 flex items-end gap-1'>
                <span>Child's Name:</span>
                <span className='flex-1 border-b border-black h-3' />
              </div>
              <div className='flex-1 flex items-end gap-1'>
                <span>School:</span>
                <span className='flex-1 border-b border-black h-3' />
              </div>
            </div>

            <p className='font-bold text-gray-900 mb-1'>Dear Parent / Caregiver,</p>
            <p className='text-gray-700 leading-relaxed mb-3'>
              Your child is invited to receive additional speech support through the{' '}
              <span className="font-['Montserrat'] italic">Northern Voices</span> School Speech
              Program. Please review the information below before providing consent for your
              child to participate.
            </p>

            <div className='bg-[#EFE6DB] px-2.5 py-1.5 mt-3.5 mb-2.5 rounded-md'>
              <p className='font-bold text-sm tracking-wide text-gray-900'>
                SPEECH SCREEN RESULTS
              </p>
            </div>
            <p className='text-gray-700 leading-relaxed mb-3'>
              A recent speech screen completed at your child's school identified speech sounds
              that may benefit from additional practice. Please refer to your child's speech
              screen report for more information about their individual results.
            </p>
            <p className='text-xs italic text-gray-700 mb-3.5 leading-snug'>
              <span className='font-bold not-italic'>PLEASE NOTE: </span>
              A speech screen is not a comprehensive speech-language assessment or diagnosis. If
              additional assessment or other services are recommended for your child, this will
              be discussed with you.
            </p>

            <div className='bg-[#EFE6DB] px-2.5 py-1.5 mt-3.5 mb-2.5 rounded-md'>
              <p className='font-bold text-sm tracking-wide text-gray-900'>
                SCHOOL SPEECH PROGRAM
              </p>
            </div>
            <p className='text-gray-700 leading-relaxed mb-3'>
              Students participating in the{' '}
              <span className="font-['Montserrat'] italic">Northern Voices</span> School Speech
              Program take part in one-on-one speech practice sessions with a trained school
              staff member. Each child follows an individualized speech plan developed and
              overseen by a Speech-Language Pathologist, with activities tailored to their
              specific speech needs. Sessions follow a play-based model to help make learning
              fun!
            </p>
            <p className='text-gray-700 leading-relaxed mb-3'>
              The frequency of speech practice sessions may vary throughout the school year based
              on your child's needs, the size of the school's speech caseload, and staff
              availability. Some students may participate in regular weekly sessions, while
              others may receive periodic speech practice throughout the year. Session frequency
              may change as your child's needs or the school's caseload changes.
            </p>
            <p className='text-gray-700 leading-relaxed mb-3'>
              Your child's speech may also be re-screened or reviewed throughout the school year
              to monitor progress and help guide their speech plan.
            </p>
            <p className='text-gray-700 leading-relaxed'>
              Every child progresses differently, and participation in the program does not
              guarantee a specific rate of improvement. Your child's willingness to participate
              will also be respected.
            </p>
          </div>

          <ReportFooter
            page={errorChunks.length + 3}
            of={totalPages}
            brand='NORTHERN VOICES SPEECH SERVICES'
          />
        </div>
      </section>

      {/* Consent page 2 of 3 */}
      <section className='bg-white shadow-sm w-full aspect-[8.5/11] flex flex-col break-after-page print:shadow-none'>
        <div className='bg-[#55707C] px-10 py-6 flex items-center justify-between'>
          <h1 className="font-['Gotu'] text-2xl text-white leading-snug">
            CONSENT TO PARTICIPATE IN
            <br />
            THE SCHOOL SPEECH PROGRAM
          </h1>
          <div className='flex items-center gap-2 shrink-0 ml-4'>
            <img src='/icon.png' alt='' className='w-8 h-8 object-cover shrink-0' />
            <div className='text-right leading-tight'>
              <p className='font-bold text-sm tracking-wide text-white'>NORTHERN VOICES</p>
              <p className="font-['Montserrat'] text-[10px] tracking-[0.2em] text-gray-200">
                SPEECH SERVICES
              </p>
            </div>
          </div>
        </div>

        <div className='flex-1 flex flex-col px-10 pt-5 pb-8 print:px-10 print:pt-5 print:pb-8'>
          <div className='flex-1'>
            <div className='bg-[#EFE6DB] px-2.5 py-1.5 mb-2.5 rounded-md'>
              <p className='font-bold text-sm tracking-wide text-gray-900'>
                SCHOOL SPEECH PROGRAM
              </p>
            </div>
            <p className='text-gray-700 leading-relaxed mb-3'>
              If there is a significant change to the nature of the speech services being
              provided to your child, you will be informed and additional consent will be
              obtained where appropriate.
            </p>
            <p className='text-gray-700 leading-relaxed mb-3'>
              We encourage you to connect with your school team and/or the Speech-Language
              Pathologist at any time if you have questions or would like to learn more about
              your child's speech plan, session frequency, or progress.
            </p>

            <div className='bg-[#EFE6DB] px-2.5 py-1.5 mt-3.5 mb-2.5 rounded-md'>
              <p className='font-bold text-sm tracking-wide text-gray-900'>
                PRIVACY &amp; SHARING OF INFORMATION
              </p>
            </div>
            <p className='text-gray-700 leading-relaxed mb-3'>
              To effectively provide and coordinate your child's speech program,{' '}
              <span className="font-['Montserrat'] italic">Northern Voices</span> may collect,
              use and retain information related to your child's speech development, screening
              results, speech plan, participation and progress.
            </p>
            <p className='text-gray-700 leading-relaxed mb-3'>
              Relevant information will only be shared between{' '}
              <span className="font-['Montserrat'] italic">Northern Voices</span> team members
              and school staff directly involved in your child's speech program for the purposes
              of planning, providing, monitoring and coordinating speech support. Information
              will be handled in accordance with applicable privacy requirements and
              professional standards.
            </p>
            <p className='text-gray-700 leading-relaxed mb-3'>
              You may contact the school or{' '}
              <span className="font-['Montserrat'] italic">Northern Voices</span> if you have
              questions about how your child's information is collected, used, stored or shared.
            </p>

            <div className='bg-[#EFE6DB] px-2.5 py-1.5 mt-3.5 mb-2.5 rounded-md'>
              <p className='font-bold text-sm tracking-wide text-gray-900'>
                VOLUNTARY PARTICIPATION
              </p>
            </div>
            <p className='text-gray-700 leading-relaxed mb-3'>
              Participation in the{' '}
              <span className="font-['Montserrat'] italic">Northern Voices</span> School Speech
              Program is voluntary. You may choose not to have your child participate, and
              consent may be withdrawn at any time by contacting your child's school or the
              Speech-Language Pathologist.
            </p>
            <p className='text-gray-700 leading-relaxed'>
              You are welcome to ask questions about the program before providing consent or at
              any time afterward.
            </p>
          </div>

          <ReportFooter
            page={errorChunks.length + 4}
            of={totalPages}
            brand='NORTHERN VOICES SPEECH SERVICES'
          />
        </div>
      </section>

      {/* Consent page 3 of 3 */}
      <section className='bg-white shadow-sm w-full aspect-[8.5/11] flex flex-col break-after-page print:shadow-none'>
        <div className='bg-[#55707C] px-10 py-6 flex items-center justify-between'>
          <h1 className="font-['Gotu'] text-2xl text-white leading-snug">
            CONSENT TO PARTICIPATE IN
            <br />
            THE SCHOOL SPEECH PROGRAM
          </h1>
          <div className='flex items-center gap-2 shrink-0 ml-4'>
            <img src='/icon.png' alt='' className='w-8 h-8 object-cover shrink-0' />
            <div className='text-right leading-tight'>
              <p className='font-bold text-sm tracking-wide text-white'>NORTHERN VOICES</p>
              <p className="font-['Montserrat'] text-[10px] tracking-[0.2em] text-gray-200">
                SPEECH SERVICES
              </p>
            </div>
          </div>
        </div>

        <div className='flex-1 flex flex-col px-10 pt-5 pb-8 print:px-10 print:pt-5 print:pb-8'>
          <div className='flex-1'>
            <div className='bg-[#EFE6DB] px-2.5 py-1.5 mb-2.5 rounded-md'>
              <p className='font-bold text-sm tracking-wide text-gray-900'>CONSENT</p>
            </div>
            <p className='text-gray-700 leading-relaxed mb-3'>
              By signing below, I confirm that I have reviewed the information above and have had
              the opportunity to ask questions.
            </p>
            <p className='text-gray-700 leading-relaxed mb-3'>
              I consent to my child participating in the{' '}
              <span className="font-['Montserrat'] italic">Northern Voices</span> School Speech
              Program, including:
            </p>

            <ul className='list-disc list-inside text-gray-700 leading-snug mb-3 space-y-1.5'>
              <li>
                one-on-one speech practice with a trained school staff member using a speech plan
                developed and overseen by a Speech-Language Pathologist;
              </li>
              <li>progress monitoring and re-screening as part of the program; and</li>
              <li>
                the collection, use and sharing of information between{' '}
                <span className="font-['Montserrat'] italic">Northern Voices</span> and relevant
                school personnel as described above for the purpose of providing and coordinating
                my child's speech support.
              </li>
            </ul>

            <p className='text-gray-700 leading-relaxed mb-5'>
              I understand that the frequency of services may vary, that specific outcomes cannot
              be guaranteed, and that I may withdraw consent at any time.
            </p>

            <div className='flex items-end gap-1 text-sm mb-5'>
              <span>Parent/Caregiver or Authorized Decision-Maker:</span>
              <span className='flex-1 border-b border-black h-3' />
            </div>

            <div className='flex items-end gap-1 text-sm mb-5'>
              <span>Relationship to the Child:</span>
              <span className='flex-1 border-b border-black h-3' />
            </div>

            <div className='flex gap-6 text-sm'>
              <div className='flex-1 flex items-end gap-1'>
                <span>Signature:</span>
                <span className='flex-1 border-b border-black h-3' />
              </div>
              <div className='flex-1 flex items-end gap-1'>
                <span>Date:</span>
                <span className='flex-1 border-b border-black h-3' />
              </div>
            </div>
          </div>

          <ReportFooter
            page={errorChunks.length + 5}
            of={totalPages}
            brand='NORTHERN VOICES SPEECH SERVICES'
          />
        </div>
      </section>

      <section className='bg-white shadow-sm w-full overflow-hidden'>
        <img
          src={
            context.errors?.length > 0
              ? '/teachspeech-app-poster-sound-errors.jpg'
              : '/teachspeech-app-poster.jpg'
          }
          alt='Free access to the NVSS TeachSpeech app'
          className='w-full h-auto block'
        />
      </section>
    </div>
  )
}

export default MildProfoundQualifiedSubReportView
