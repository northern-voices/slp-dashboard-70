import { ReportHeader, ReportFooter } from './shared/ReportSimpleChrome'

interface ComplexNeedsLetterData {
  context: {
    student_name: string
  }
}

const ComplexNeedsLetterView = ({ data }: { data: ComplexNeedsLetterData }) => {
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
            TeachSpeech App - Free Family Access!
          </h1>

          <div className='space-y-0.5 text-gray-800 mb-3'>
            <p>Student: {context.student_name}</p>
          </div>

          <p className='font-semibold text-gray-900 mb-1'>DEAR PARENT/CAREGIVER:</p>
          <p className='text-gray-700 leading-relaxed mb-3'>
            As part of the Northern Voices School Speech Program, all students and families at your
            child's school are invited to access the Northern Voices' TeachSpeech app at no cost.
          </p>
          <p className='text-gray-700 leading-relaxed mb-3'>
            The app includes games, activities, educational videos, and practical tools designed to
            support children's speech and communication development. Families are welcome to explore
            and use these resources at home at any time.
          </p>
          <p className='text-gray-700 leading-relaxed mb-3'>
            We hope you enjoy having access to these resources and find them helpful in learning
            about and supporting your child's communication development.
          </p>
          <p className='text-gray-700 leading-relaxed mb-3'>
            If you have any questions about the app or the resources available to your family,
            please feel free to connect with your school team.
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

export default ComplexNeedsLetterView
