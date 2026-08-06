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
    left_ear_volume_ml?: string
    left_ear_compliance_ml?: string
    left_ear_press_dapa?: string
    left_ear_volume_result?: string
    left_ear_compliance_result?: string
    left_ear_press_result?: string
    right_ear_volume_ml?: string
    right_ear_compliance_ml?: string
    right_ear_press_dapa?: string
    right_ear_volume_result?: string
    right_ear_compliance_result?: string
    right_ear_press_result?: string
    left_ear_result?: string
    right_ear_result?: string
    referral_notes?: string
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
    <span>NORTHERN VOICE SPEECH SERVICES</span>
    <span className='flex items-center gap-2'>
      <img src='/icon.png' alt='' className='w-4 h-4' />
      {page} of {of}
    </span>
  </div>
)

const FailStaffHearingReportView = ({ data }: { data: HearingReportData }) => {
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
            Your hearing screening results{' '}
            <span className='font-bold'>fell outside the expected range</span> indicating that
            further testing may be beneficial. These findings do not necessarily mean there are any
            hearing concerns; however, we strongly advise follow-up with an audiologist and/or
            family physician to rule out any potential ear-related issues. Please bring a copy of
            your screening results to your healthcare provider for review during your evaluation.
          </p>

          <p className='text-gray-700 leading-snug mb-3'>
            Please note: screenings are a general tool used to identify potential concerns and
            should not replace full audiological evaluations. Early identification and management of
            hearing issues are important for overall health, communication, and quality of life.
          </p>

          <p className='font-bold text-gray-900 mb-1'>
            Signs That May Suggest Hearing Difficulties:
          </p>
          <ul className='list-disc list-inside text-gray-700 leading-snug mb-3 space-y-0.5'>
            {STAFF_SIGNS_LIST.map((sign, i) => (
              <li key={i}>{sign}</li>
            ))}
          </ul>

          <p className='text-gray-700 leading-snug mb-3'>
            If you would like further guidance on next steps or have questions about your results,
            please do not hesitate to reach out. Your health and well-being are important to us, and
            we are here to assist you in any way we can.
          </p>

          <p className="font-['Caveat'] text-2xl text-gray-900 mb-1">L. Brillinger</p>
          <p className='text-xs text-gray-700'>Lisa Brillinger | CEO NVSS</p>
          <p className='text-xs text-gray-700'>Speech Language Pathologist</p>
          <p className='text-xs text-gray-700'>License Number: 1595</p>
          <p className='text-xs text-gray-700'>lbrillinger@northern-voices.ca</p>
          <p className='text-xs text-gray-700'>www.northern-voices.ca</p>
        </div>

        <ReportFooter page={1} of={2} />
      </section>

      <section className='bg-white shadow-sm w-full aspect-[8.5/11] pt-6 px-10 pb-8 flex flex-col print:shadow-none print:pt-6 print:px-10 print:pb-8'>
        <ReportHeader />

        <div className='flex-1'>
          <h1 className="text-4xl font-light text-gray-500 tracking-wide mb-6 text-center font-['Gotu']">
            HEARING SCREENS
          </h1>

          <table className='w-full border border-black text-xs mb-4'>
            <thead>
              <tr className='bg-[#f2f2f2]'>
                <th className='border border-black py-2 px-2'></th>
                <th rowSpan={2} className='border border-black py-2 px-2 text-center font-bold'>
                  EAR CANAL VOLUME
                  <br />
                  (.5 – 1.5 cm3)
                </th>
                <th colSpan={2} className='border border-black py-2 px-2 text-center font-bold'>
                  PEAK
                </th>
              </tr>
              <tr className='bg-[#f2f2f2]'>
                <th className='border border-black py-2 px-2'></th>
                <th className='border border-black py-2 px-2 text-center font-bold'>
                  0.3 – 1.5 ml
                </th>
                <th className='border border-black py-2 px-2 text-center font-bold'>
                  +/- 200 daPa
                </th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className='border border-black py-2 px-2 font-bold text-center'>LEFT EAR</td>
                <td className='border border-black py-2 px-2 text-center'>
                  {context.left_ear_volume_ml} cm3
                  <br />({context.left_ear_volume_result})
                </td>
                <td className='border border-black py-2 px-2 text-center'>
                  {context.left_ear_compliance_ml} ml
                  <br />({context.left_ear_compliance_result})
                </td>
                <td className='border border-black py-2 px-2 text-center'>
                  {context.left_ear_press_dapa} daPa
                  <br />({context.left_ear_press_result})
                </td>
              </tr>
              <tr>
                <td className='border border-black py-2 px-2 font-bold text-center'>RIGHT EAR</td>
                <td className='border border-black py-2 px-2 text-center'>
                  {context.right_ear_volume_ml} cm3
                  <br />({context.right_ear_volume_result})
                </td>
                <td className='border border-black py-2 px-2 text-center'>
                  {context.right_ear_compliance_ml} ml
                  <br />({context.right_ear_compliance_result})
                </td>
                <td className='border border-black py-2 px-2 text-center'>
                  {context.right_ear_press_dapa} daPa
                  <br />({context.right_ear_press_result})
                </td>
              </tr>
            </tbody>
          </table>

          <p className='mb-2 text-gray-800'>
            <span className='font-bold'>Left Ear:</span> {context.left_ear_result}
          </p>
          <p className='mb-4 text-gray-800'>
            <span className='font-bold'>Right Ear:</span> {context.right_ear_result}
          </p>

          {context.referral_notes && (
            <>
              <p className='font-bold text-gray-900 mb-1'>Notes:</p>
              <div className='border border-black rounded p-3 min-h-[90px] text-gray-700 whitespace-pre-line'>
                {context.referral_notes}
              </div>
            </>
          )}
        </div>

        <ReportFooter page={2} of={2} />
      </section>
    </div>
  )
}

export default FailStaffHearingReportView
