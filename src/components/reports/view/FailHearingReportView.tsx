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
    <span>NORTHERN VOICES SPEECH SERVICES</span>
    <span className='flex items-center gap-2'>
      <img src='/icon.png' alt='' className='w-4 h-4' />
      {page} of {of}
    </span>
  </div>
)

const FailHearingReportView = ({ data }: { data: HearingReportData }) => {
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
            Class-wide hearing screenings were recently administered at the school, and the
            tympanometry test showed that your child's results{' '}
            <span className='font-bold'>fell outside the expected range</span>, indicating a need
            for further evaluation. This does not necessarily mean your child has hearing
            difficulties; however, we recommend follow-up with an audiologist and/or family
            physician to rule out potential ear infections or hearing issues. Please provide a copy
            of the screening results to your chosen service provider for their review and
            consideration during your child's evaluation.
          </p>

          <p className='text-gray-700 leading-snug mb-3'>
            Please note: hearing screens should not replace regular audiological check-ups. They
            serve to identify children who may require further assessment. If at any point you have
            concerns about your child's hearing, we strongly advise discussing these with your
            doctor and/or requesting a hearing evaluation with an audiologist. It is important to
            have your child's hearing tested regularly— even a slight or temporary hearing loss due
            to wax build-up or an ear infection can significantly impact a child's speech, language,
            and ability to learn.
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

export default FailHearingReportView
