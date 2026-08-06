const STAFF_SIGNS_LIST = [
  'Trouble understanding or following conversations',
  'Difficulty hearing in noisy environments',
  'Frequently asking others to repeat themselves',
  'Turning up the volume on devices',
  'Ringing or noises in the ear(s)',
  'Speaking loudly or straining to hear others',
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

const PassStaffHearingReportView = ({ data }: { data: HearingReportData }) => {
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

          <p className='mb-4 text-gray-800'>Date: {context.date_of_screening}</p>

          <p className='text-gray-800 mb-2.5'>Dear {context.student_name},</p>

          <p className='text-gray-700 leading-snug mb-2.5'>
            Your hearing screening results showed that your hearing fell{' '}
            <span className='font-bold'>within the expected range</span>, with no concerns observed.
          </p>

          <p className='text-gray-700 leading-snug mb-3'>
            Please note that hearing screens are a general tool to identify potential concerns and
            are not a substitute for comprehensive audiological assessments. We encourage you to
            continue attending regular hearing evaluations with your healthcare provider, especially
            if you notice changes in your hearing.
          </p>

          <p className='font-bold text-gray-900 mb-1'>
            Signs That May Suggest Hearing Difficulties:
          </p>
          <ul className='list-disc list-inside text-gray-700 leading-snug mb-3 space-y-0.5'>
            {STAFF_SIGNS_LIST.map((sign, i) => (
              <li key={i}>{sign}</li>
            ))}
          </ul>

          <p className='text-gray-700 leading-snug mb-2.5'>
            If you experience any of these signs or have concerns about your hearing in the future,
            we encourage you to consult an audiologist and/or physician.
          </p>

          <p className='text-gray-700 leading-snug mb-3'>
            Thank you for your participation and commitment to your health and well-being!
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

export default PassStaffHearingReportView
