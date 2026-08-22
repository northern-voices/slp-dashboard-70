import { ReportHeader, ReportFooter } from './shared/ReportSimpleChrome'

interface NoConsentLetterData {
  context: {
    student_name: string
    grade: string
  }
}

const NoConsentLetterView = ({ data }: { data: NoConsentLetterData }) => {
  const { context } = data

  return (
    <div className="space-y-6 print:space-y-0 font-['Nunito']">
      <link
        rel='stylesheet'
        href='https://fonts.googleapis.com/css2?family=Gotu&family=Montserrat:ital,wght@0,400;0,700;1,400&family=Nunito:wght@400;700&display=swap'
      />

      <section
        className='bg-white shadow-sm w-full aspect-[8.5/11] pt-6 px-10 pb-8 flex flex-col break-after-page print:shadow-none print:pt-6 print:px-10
  print:pb-8'>
        <ReportHeader />

        <div className='flex-1'>
          <h1 className="text-4xl font-light text-gray-500 tracking-wide mb-5 text-center font-['Gotu']">
            SPEECH SCREEN REPORT
          </h1>

          <div className='space-y-0.5 text-gray-800 mb-3'>
            <p>Student's Name: {context.student_name}</p>
            <p>Grade: {context.grade}</p>
          </div>

          <p className='font-semibold text-gray-900 mb-1'>DEAR PARENT/CAREGIVER:</p>
          <p className='text-gray-700 leading-relaxed mb-3'>
            We recently completed speech screenings at your child's school. As we did not receive
            consent for your child to participate, your child was not screened by the
            Speech-Language Pathologist.
          </p>
          <p className='text-gray-700 leading-relaxed mb-3'>
            Even though your child did not participate in the screening, your family is still
            welcome to access the Northern Voices speech app at no cost through your school. The app
            includes games, activities, videos, and practical tools that families can use to support
            speech development at home.
          </p>
          <p className='text-gray-700 leading-relaxed mb-3'>
            If you change your mind and would like your child to participate in a speech screening
            in the future, please reach out to your school team. We would be happy to connect with
            you, answer any questions, and discuss available screening opportunities.
          </p>
          <p className='text-gray-700 leading-relaxed mb-3'>
            We hope you enjoy exploring the TeachSpeech app!
          </p>
          <p className='font-bold text-gray-900'>Northern Voices Speech Services</p>
        </div>

        <ReportFooter page={1} of={2} brand='NORTHERN VOICES SPEECH SERVICES' />
      </section>

      <section className='bg-white shadow-sm w-full overflow-hidden'>
        <img
          src='/No-Consent_Non-Registered_Complex-Needs.jpg'
          alt='Free access to the NVSS TeachSpeech app'
          className='w-full h-auto block'
        />
      </section>
    </div>
  )
}

export default NoConsentLetterView
