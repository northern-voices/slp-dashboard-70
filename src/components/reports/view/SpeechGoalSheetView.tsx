import { Ear } from 'lucide-react'
import { ReportBanner, ReportFooter } from './shared/ReportBannerChrome'

interface TableError {
  sound: string
  pattern: string
  example: string
}

interface GoalSheetStrategies {
  wordPhrase: string[]
  sound: string[]
  audDiscrim: string[]
}

interface QrVideo {
  category: string
  title: string
  url: string
  dataUri: string
}

interface GoalError {
  sound: string
  pattern: string
  example: string
  targetSound: string
  stimulability_option: string
  strategies: GoalSheetStrategies
  qrVideos: QrVideo[]
}

// Maps the student's recorded stimulability level to which strategy column
// to show. Word and Phrase share a column - see the source document's own
// "default to word unless phrase or aud. discrim is selected" note.
const STIMULABILITY_STRATEGY_COLUMN: Record<string, keyof GoalSheetStrategies> = {
  'non-stimulable': 'audDiscrim',
  sound: 'sound',
  word: 'wordPhrase',
  phrase: 'wordPhrase',
}

const getStrategyItems = (error: GoalError): string[] => {
  const column = STIMULABILITY_STRATEGY_COLUMN[error.stimulability_option] || 'wordPhrase'
  return error.strategies?.[column] ?? []
}

const STIMULABILITY_DISPLAY_LABEL: Record<string, string> = {
  'non-stimulable': 'Aud. Discrim.',
  sound: 'Sound',
  word: 'Word',
  phrase: 'Phrase',
}

const getStimulabilityLabel = (option: string): string =>
  STIMULABILITY_DISPLAY_LABEL[option] || option

const STRATEGY_COLUMN_MAX = 3

// Wraps a strategy list into side-by-side sub-columns of at most
// STRATEGY_COLUMN_MAX items each, instead of letting one long list run tall.
const chunkStrategyItems = (items: string[]): string[][] => {
  const chunks: string[][] = []
  for (let i = 0; i < items.length; i += STRATEGY_COLUMN_MAX) {
    chunks.push(items.slice(i, i + STRATEGY_COLUMN_MAX))
  }
  return chunks
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
    level?: 1 | 2
    level_1_table_errors?: TableError[]
    level_2_table_errors?: TableError[]
  }
}

const Checkbox = ({ label }: { label: string }) => (
  <div className='flex items-center gap-1.5 mb-1'>
    <div className='w-2 h-2 border border-gray-700 shrink-0' />
    <span className='text-[8px] leading-tight'>{label}</span>
  </div>
)

const QrVideoColumn = ({ qrVideos }: { qrVideos: QrVideo[] }) => {
  if (!qrVideos || qrVideos.length === 0) return null

  return (
    <div className='shrink-0 pl-3'>
      <p className='font-bold text-gray-900 text-[9px] mb-1'>VIDEOS:</p>
      <div className='flex items-start gap-2'>
        {qrVideos.map(video => (
          <div key={video.category} className='flex flex-col items-center w-[50px]'>
            <img
              src={video.dataUri}
              alt={`QR code for ${video.title} training video`}
              className='w-[50px] h-[50px]'
            />
            <span className="font-['Montserrat'] text-[6px] text-gray-600 text-center mt-0.5">
              {video.title}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

const HOW_DID_THEY_DO_ITEMS = [
  'Cannot say the sound at all',
  'Can say the sound (but not in words)',
  'Can say the sound in most words (with adult help)',
  'Can say the sound in most words (no adult help)',
]

const ErrorTable = ({
  title,
  errors,
  variant,
}: {
  title: string
  errors: TableError[]
  variant?: 'level1' | 'level2'
}) => {
  const titleColorClass =
    variant === 'level1'
      ? 'text-[#5b7a8b]'
      : variant === 'level2'
        ? 'text-[#8a6d4f]'
        : 'text-gray-600'
  const headerRowClass =
    variant === 'level1' ? 'bg-[#5b7a8b]' : variant === 'level2' ? 'bg-[#e9e2d9]' : 'bg-[#f2f2f2]'
  const headerTextClass =
    variant === 'level1' ? 'text-white' : variant === 'level2' ? 'text-[#4d4b4b]' : ''

  return (
    <>
      <h2 className={`text-xl ${titleColorClass} text-center font-['Gotu'] mt-2 mb-3`}>{title}</h2>
      <table className='w-full border border-black text-sm mb-3'>
        <thead>
          <tr className={headerRowClass}>
            <th
              className={`font-['Montserrat'] border border-black py-2 px-3 text-center text-xs font-bold ${headerTextClass}`}>
              ERROR SOUND
            </th>
            <th
              className={`font-['Montserrat'] border border-black py-2 px-3 text-center text-xs font-bold ${headerTextClass}`}>
              ERROR PATTERN EXHIBITED
            </th>
            <th
              className={`font-['Montserrat'] border border-black py-2 px-3 text-center text-xs font-bold ${headerTextClass}`}>
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
}

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
      <div className='w-[13%] pr-1 border-r border-gray-300'>
        <p className='font-bold text-gray-900 text-[9px] mb-0.5'>TARGET:</p>
        <p className='font-bold text-gray-900 text-base mb-1'>{error.sound}</p>
        <p className='font-bold text-gray-900 text-[9px] mb-0.5'>STIMULABILITY:</p>
        {error.stimulability_option === 'non-stimulable' ? (
          <div className='flex flex-col items-start mb-1'>
            <p className='font-bold text-gray-900 text-sm'>
              {getStimulabilityLabel(error.stimulability_option)}
            </p>
            <Ear className='w-[18px] h-[18px] text-gray-900 mt-1' strokeWidth={2} />
          </div>
        ) : (
          <p className='font-bold text-gray-900 text-base mb-1'>
            {getStimulabilityLabel(error.stimulability_option)}
          </p>
        )}
      </div>
      <div className='w-[87%] pl-3 flex'>
        <div className='pr-4 border-r border-gray-300'>
          <p className='font-bold text-gray-900 text-[9px] mb-1'>STRATEGIES:</p>
          <div className='flex'>
            {chunkStrategyItems(getStrategyItems(error)).map((chunk, i) => (
              <div key={i} className='pr-2.5'>
                {chunk.map(item => (
                  <Checkbox key={item} label={item} />
                ))}
              </div>
            ))}
          </div>
        </div>
        <QrVideoColumn qrVideos={error.qrVideos} />
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
              {error.stimulability_option === 'non-stimulable' ? (
                <>
                  Student will identify correct <span className='font-bold'>{error.sound}</span>{' '}
                  with 90% accuracy when listening to adult say contrast pairs.
                </>
              ) : (
                <>
                  Student will say <span className='font-bold'>{error.sound}</span> at the{' '}
                  <span className='font-bold'>{error.stimulability_option}</span> level with 90%
                  accuracy.
                </>
              )}
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

const getBannerProps = (level: 1 | 2 | undefined, title: string) => ({
  title: level ? `${title} (Level ${level})` : title,
  backgroundColor: level === 2 ? '#e9e2d9' : undefined,
  textColor: level === 2 ? '#4d4b4b' : undefined,
})

const SpeechGoalSheetView = ({ data }: { data: SpeechGoalSheetData }) => {
  const { context } = data
  const bannerTitle =
    context.level === 1
      ? 'Goal Sheet (Level 1)'
      : context.level === 2
        ? 'Goal Sheet (Level 2)'
        : 'Goal Sheet'
  const worksheetErrors = [...(context.primary_errors ?? []), ...(context.secondary_errors ?? [])]
  const totalPages = 1 + worksheetErrors.length

  return (
    <div className="space-y-6 print:space-y-0 font-['Nunito']">
      <link
        rel='stylesheet'
        href='https://fonts.googleapis.com/css2?family=Gotu&family=Montserrat:ital,wght@0,400;0,700;1,400&family=Nunito:wght@400;700&display=swap'
      />

      <section className='bg-white shadow-sm w-full aspect-[8.5/11] flex flex-col overflow-hidden break-after-page print:shadow-none'>
        <ReportBanner
          title={bannerTitle}
          backgroundColor={context.level === 2 ? '#e9e2d9' : undefined}
          textColor={context.level === 2 ? '#4d4b4b' : undefined}
        />

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

          {context.level_1_table_errors || context.level_2_table_errors ? (
            <>
              {(context.level_1_table_errors?.length ?? 0) > 0 && (
                <ErrorTable
                  title='PRIMARY SOUND ERRORS'
                  errors={context.level_1_table_errors!}
                  variant='level1'
                />
              )}
              {(context.level_2_table_errors?.length ?? 0) > 0 && (
                <ErrorTable
                  title='SECONDARY SOUND ERRORS'
                  errors={context.level_2_table_errors!}
                  variant='level2'
                />
              )}
            </>
          ) : (
            <>
              {context.primary_table_errors?.length > 0 && (
                <ErrorTable title='PRIMARY SOUND ERRORS' errors={context.primary_table_errors} />
              )}
              {context.secondary_table_errors?.length > 0 && (
                <ErrorTable
                  title='SECONDARY SOUND ERRORS'
                  errors={context.secondary_table_errors}
                />
              )}
            </>
          )}
        </div>

        <ReportFooter brand='NORTHERN VOICES SPEECH SERVICES' page={1} of={totalPages} />
      </section>

      {worksheetErrors.map((error, i) => (
        <section
          key={i}
          className='bg-white shadow-sm w-full aspect-[8.5/11] flex flex-col overflow-hidden break-after-page print:shadow-none'>
          <ReportBanner {...getBannerProps(context.level, 'Goal Sheet')} />
          <div className='px-10 pt-4 flex flex-col flex-1'>
            <GoalWorksheetSection studentName={context.student_name} error={error} />
          </div>
          <ReportFooter brand='NORTHERN VOICES SPEECH SERVICES' page={i + 2} of={totalPages} />
        </section>
      ))}
    </div>
  )
}

export default SpeechGoalSheetView
