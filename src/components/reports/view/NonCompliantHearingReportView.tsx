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

const NonCompliantHearingReportView = ({ data }: { data: HearingReportData }) => {
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
            We recently conducted hearing screenings at the school; unfortunately, we were unable to
            complete the assessment for your child as they were{' '}
            <span className='font-bold'>not comfortable participating</span>.
          </p>

          <p className='text-gray-700 leading-snug mb-3'>
            If your child has not had a recent hearing evaluation, we recommend discussing this with
            your doctor and/or requesting a hearing assessment with an audiologist. Even mild or
            temporary hearing difficulties (such as those caused by wax build-up or ear infections)
            can impact a child's speech, language development, and learning ability.
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
            top priorities, and we're here to help!
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

export default NonCompliantHearingReportView
