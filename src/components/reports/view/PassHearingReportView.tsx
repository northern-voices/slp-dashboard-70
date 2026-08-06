const SIGNS_LIST = [
  'Trouble understanding or following instructions',
  'Unclear speech',
  'Not responding to name or environmental sounds',
  'Frequent requests for repetition (e.g., saying, "What?" or "Huh?")',
  'Complaints of ear pain, ringing, or noises in the ear(s)',
  'Turning up the volume on the TV or music devices',
  'Speaking loudly or watching lips closely when listening to others',
  'Challenges with reading or academic progress',
]

interface HearingReportData {
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

const ReportFooter = () => (
  <div className='flex items-center justify-between border-t border-gray-200 pt-3 text-xs text-gray-500'>
    <span>NORTHERN VOICES SPEECH SERVICES</span>
    <span className='flex items-center gap-2'>
      <img src='/icon.png' alt='' className='w-4 h-4' />1 of 1
    </span>
  </div>
)

const PassHearingReportView = ({ data }: { data: HearingReportData }) => {
  const { context } = data

  return (
    <div className="space-y-6 print:space-y-0 font-['Nunito']">
      <link
        rel='stylesheet'
        href='https://fonts.googleapis.com/css2?family=Gotu&family=Montserrat:ital,wght@0,400;0,700;1,400&family=Nunito:wght@400;700&family=Caveat&display=swap'
      />

      <section className='bg-white shadow-sm w-full aspect-[8.5/11] pt-6 px-10 pb-8 flex flex-col print:shadow-none print:pt-6 print:px-10 print:pb-8'>
        <ReportHeader />

        <div className='flex-1'>
          <h1 className="text-4xl font-light text-gray-500 tracking-wide mb-5 text-center font-['Gotu']">
            HEARING SCREEN REPORT
          </h1>

          <div className='flex justify-between mb-4 text-gray-800'>
            <p>Student: {context.student_name}</p>
            <p>Date: {context.date_of_screening}</p>
          </div>

          <p className='font-bold text-gray-900 mb-1'>DEAR PARENT(S)/GUARDIAN(S):</p>
          <p className='text-gray-700 leading-snug mb-2.5'>
            Class-wide hearing screens were recently administered at the school. Your child{' '}
            <span className='font-bold'>passed</span> the screen, and no hearing-related concerns
            were noted by the Speech-Language Pathologist.
          </p>

          <p className='text-gray-700 leading-snug mb-2.5'>
            Please be advised that hearing screens should not replace regular audiological checkups.
            They serve to identify children who may require further assessment. If you have concerns
            about your child's hearing, we strongly recommend discussing this with your doctor
            and/or requesting a hearing evaluation with an audiologist.
          </p>

          <p className='text-gray-700 leading-snug mb-3'>
            It is important to have your child's hearing tested regularly. Even a slight or
            temporary hearing loss (e.g., wax build-up, ear infection) can significantly impact a
            child's speech, language and ability to learn.
          </p>

          <p className='font-bold text-gray-900 mb-1'>
            Signs That May Suggest Hearing Difficulties:
          </p>
          <ul className='list-disc list-inside text-gray-700 leading-snug mb-3 space-y-0.5'>
            {SIGNS_LIST.map((sign, i) => (
              <li key={i}>{sign}</li>
            ))}
          </ul>

          <p className='text-gray-700 leading-snug mb-3'>
            If you have any concerns or would like guidance on what to do next, please do not
            hesitate to reach out to us or your school. Your child's success and well-being are our
            top priorities, and we are here to help in any way we can.
          </p>

          <p className="font-['Caveat'] text-2xl text-gray-900 mb-1">L. Brillinger</p>
          <p className='text-xs text-gray-700'>Lisa Brillinger | CEO NVSS</p>
          <p className='text-xs text-gray-700'>Speech Language Pathologist</p>
          <p className='text-xs text-gray-700'>License Number: 1595</p>
          <p className='text-xs text-gray-700'>lbrillinger@northern-voices.ca</p>
          <p className='text-xs text-gray-700'>www.northern-voices.ca</p>
        </div>

        <ReportFooter />
      </section>
    </div>
  )
}

export default PassHearingReportView
