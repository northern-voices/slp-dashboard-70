interface TableError {
  sound: string
  pattern: string
  example: string
}

interface GoalError {
  sound: string
  pattern: string
  example: string
  targetSound: string
  stimulability_option: string
}

interface SpeechGoalSheetData {
  template?: { name?: string }
  context: {
    student_name: string
    date_of_screening: string
    school: string
    grade: string
    vocabulary_support: boolean
    primary_errors: GoalError[]
    secondary_errors: GoalError[]
    primary_table_errors: TableError[]
    secondary_table_errors: TableError[]
  }
}

const ReportBanner = ({ title }: { title: string }) => (
  <div className='bg-[#5b7a8b] px-10 py-6 flex items-center justify-between'>
    <h1 className="text-3xl text-white font-['Gotu']">{title}</h1>
    <div className='flex items-center'>
      <img src='/icon.png' alt='' className='w-7 h-7 rounded mr-2' />
      <div className='leading-tight'>
        <p className='font-bold text-[9px] tracking-wide text-white'>NORTHERN VOICES</p>
        <p className="font-['Montserrat'] text-[6px] tracking-[0.2em] text-gray-200">
          SPEECH SERVICES
        </p>
      </div>
    </div>
  </div>
)

const ReportFooter = ({ page, of }: { page: number; of: number }) => (
  <div
    className='flex items-center justify-between border-t border-gray-200 pt-3 text-xs text-gray-500
  px-10 pb-6'>
    <span>NORTHERN VOICES SPEECH SERVICES</span>
    <span className='flex items-center gap-2'>
      <img src='/icon.png' alt='' className='w-4 h-4' />
      {page} of {of}
    </span>
  </div>
)

const Checkbox = ({ label }: { label: string }) => (
  <div className='flex items-center gap-1.5 mb-1'>
    <div className='w-2 h-2 border border-gray-700 shrink-0' />
    <span className='text-[8px] leading-tight'>{label}</span>
  </div>
)

const STRATEGY_ITEMS = ['Pointing to mouth', 'Clapping (syllables)', 'Straw (lateral lisp)']

const HOW_DID_THEY_DO_ITEMS = [
  'Could not say the sound at all',
  'Can say the sound (but not in words)',
  'Can say the sound in most words (with adult cues)',
  'Can say the sound in most words (no adult help)',
]

const ErrorTable = ({ title, errors }: { title: string; errors: TableError[] }) => (
  <>
    <h2 className="text-xl text-gray-600 text-center font-['Gotu'] mt-2 mb-3">{title}</h2>
    <table className='w-full border border-black text-sm mb-3'>
      <thead>
        <tr className='bg-[#f2f2f2]'>
          <th className="font-['Montserrat'] border border-black py-2 px-3 text-center text-xs font-bold">
            ERROR SOUND
          </th>
          <th className="font-['Montserrat'] border border-black py-2 px-3 text-center text-xs font-bold">
            ERROR PATTERN EXHIBITED
          </th>
          <th className="font-['Montserrat'] border border-black py-2 px-3 text-center text-xs font-bold">
            EXAMPLE
          </th>
        </tr>
      </thead>
      <tbody>
        {errors.map((error, i) => (
          <tr key={i}>
            <td className='border border-black py-2 px-3 text-center text-[#4d4b4b]'>
              {error.sound}
            </td>
            <td className='border border-black py-2 px-3 text-center text-[#4d4b4b]'>
              {error.pattern}
            </td>
            <td className='border border-black py-2 px-3 text-center text-[#4d4b4b]'>
              {error.example}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </>
)

const GoalWorksheetSection = ({
  studentName,
  error,
}: {
  studentName: string
  error: GoalError
}) => (
  <div className='flex-1'>
    <p className='font-bold text-gray-900 mb-2'>STUDENT: {studentName}</p>

    <div className='flex border border-[#b7b7b7] bg-[#eff3f6] mb-3 p-2.5'>
      <div className='w-[35%] pr-2.5 border-r border-gray-300'>
        <p className='font-bold text-gray-900 text-[9px] mb-0.5'>SOUND:</p>
        <p className='font-bold text-gray-900 text-base mb-1'>{error.sound}</p>
      </div>
      <div className='w-[65%] pl-2.5'>
        <p className='font-bold text-gray-900 text-[9px] mb-1'>STRATEGIES TO USE:</p>
        {STRATEGY_ITEMS.map(item => (
          <Checkbox key={item} label={item} />
        ))}
      </div>
    </div>

    {[0, 1, 2].map(i => (
      <div key={i} className='border border-[#b7b7b7] mb-2.5'>
        <div className={`py-1.5 px-2.5 ${i === 1 ? 'bg-[#e9e2d9]' : 'bg-[#5b7a8b]'}`}>
          <p
            className={`font-['Montserrat'] font-bold text-center text-[9px] tracking-wide ${
              i === 1 ? 'text-[#4d4b4b]' : 'text-white'
            }`}>
            SESSION {i + 1}
          </p>
        </div>
        <div className={`flex p-2.5 ${i === 1 ? 'bg-[#f9f7f4]' : 'bg-[#eff3f6]'}`}>
          <div className='w-[38%] pr-2.5 border-r border-gray-300'>
            <p className='font-bold text-gray-900 text-[9px] mb-0.5'>How did the student do?</p>
            <p className="font-['Montserrat'] italic text-[8px] text-gray-500 mb-1">
              Were they able to say the sound?
            </p>
            {HOW_DID_THEY_DO_ITEMS.map(item => (
              <Checkbox key={item} label={item} />
            ))}
          </div>
          <div className='w-[62%] pl-2.5 text-[9px]'>
            <p className='mb-2 leading-snug'>
              <span className="font-['Montserrat'] italic font-bold">Goal: </span>
              Student will say the <span className='font-bold'>{error.sound}</span> at the{' '}
              <span className='font-bold'>{error.stimulability_option}</span> level with 90%
              accuracy.
            </p>
            <p className='mb-3'>Date: ______________________</p>

            <p className='font-bold text-[8px] text-gray-900 mt-1 mb-1'>Activities / Games</p>
            <div className='border-b border-gray-400 h-3.5 mb-1' />

            <p className='font-bold text-[8px] text-gray-900 mt-1 mb-1'>
              Progress / Improvement{' '}
              <span className="font-normal font-['Montserrat'] italic text-gray-500">
                (Speech, confidence, social skills, language, vocabulary, etc.)
              </span>
            </p>
            <div className='border-b border-gray-400 h-3.5 mb-1' />

            <p className='font-bold text-[8px] text-gray-900 mt-1 mb-1'>
              Additional comments, questions, or concerns
            </p>
            <div className='border-b border-gray-400 h-3.5 mb-1' />
          </div>
        </div>
      </div>
    ))}

    <div className='flex mt-1'>
      <div
        className='flex-1 bg-[#e9e2d9] border border-[#b7b7b7] py-1.5 flex items-center
  justify-center mr-px'>
        <div className='w-2 h-2 rounded-full border border-gray-700 mr-1.5' />
        <span className="font-['Montserrat'] font-bold text-[9px] tracking-wide text-gray-700">
          MASTERED
        </span>
      </div>
      <div
        className='flex-1 bg-[#e9e2d9] border border-[#b7b7b7] py-1.5 flex items-center
  justify-center'>
        <div className='w-2 h-2 rounded-full border border-gray-700 mr-1.5' />
        <span className="font-['Montserrat'] font-bold text-[9px] tracking-wide text-gray-700">
          NEEDS MORE PRACTICE
        </span>
      </div>
    </div>
  </div>
)

const SpeechGoalSheetView = ({ data }: { data: SpeechGoalSheetData }) => {
  const { context } = data
  const worksheetErrors = [...(context.primary_errors ?? []), ...(context.secondary_errors ?? [])]
  const totalPages = 1 + worksheetErrors.length

  return (
    <div className="space-y-6 print:space-y-0 font-['Nunito']">
      <link
        rel='stylesheet'
        href='https://fonts.googleapis.com/css2?family=Gotu&family=Montserrat:ital,wght@0,400;0,700;1,400&family=Nunito:wght@400;700&display=swap'
      />

      <section className='bg-white shadow-sm w-full aspect-[8.5/11] flex flex-col overflow-hidden break-after-page print:shadow-none'>
        <ReportBanner title='Goal Sheet' />

        <div className='flex-1 px-10 pt-5'>
          <div className='flex justify-between mb-2'>
            <p className='flex-1'>
              <span className='font-bold text-gray-900'>Student: </span>
              {context.student_name}
            </p>
            <p className='flex-1'>
              <span className='font-bold text-gray-900'>Grade: </span>
              {context.grade}
            </p>
          </div>
          <div className='flex justify-between mb-2'>
            <p className='flex-1'>
              <span className='font-bold text-gray-900'>School: </span>
              {context.school}
            </p>
            <p className='flex-1'>
              <span className='font-bold text-gray-900'>Screening Date: </span>
              {context.date_of_screening}
            </p>
          </div>

          {context.primary_table_errors?.length > 0 && (
            <ErrorTable title='SOUND ERRORS' errors={context.primary_table_errors} />
          )}

          {context.secondary_table_errors?.length > 0 && (
            <ErrorTable title='SECONDARY SOUND ERRORS' errors={context.secondary_table_errors} />
          )}

          {context.vocabulary_support && (
            <p className="font-['Montserrat'] italic text-gray-600">
              Vocabulary support recommended
            </p>
          )}
        </div>

        <ReportFooter page={1} of={totalPages} />
      </section>

      {worksheetErrors.map((error, i) => (
        <section
          key={i}
          className='bg-white shadow-sm w-full aspect-[8.5/11] flex flex-col overflow-hidden
  break-after-page print:shadow-none'>
          <ReportBanner title='Goal Sheets' />
          <div className='px-10 pt-4 flex flex-col flex-1'>
            <GoalWorksheetSection studentName={context.student_name} error={error} />
          </div>
          <ReportFooter page={i + 2} of={totalPages} />
        </section>
      ))}
    </div>
  )
}

export default SpeechGoalSheetView
