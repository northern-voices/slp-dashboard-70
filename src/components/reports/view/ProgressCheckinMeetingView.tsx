import { ReportBanner, ReportFooter } from './shared/ReportBannerChrome'

interface StudentUpdate {
  student_name: string
  sessions_attended: number
  meeting_notes: string
  is_sub: boolean
}

interface ProgressCheckinMeetingData {
  context: {
    meeting_title: string
    facilitator_name: string
    school: string
    meeting_date: string
    attendees: string[]
    has_student_updates: boolean
    student_updates: StudentUpdate[]
    has_additional_notes: boolean
    additional_notes: string
    has_action_plan: boolean
    action_plan: string
  }
}

// Unverified estimate - recalibrate against a real PDF render with a longer student roster,
// same way ROWS_FIRST_PAGE/ROWS_PER_CONTINUATION_PAGE were tuned for the progress report.
const ROWS_FIRST_PAGE = 18
const ROWS_PER_CONTINUATION_PAGE = 26

const chunkRows = (updates: StudentUpdate[]): StudentUpdate[][] => {
  if (updates.length === 0) return [[]]
  if (updates.length <= ROWS_FIRST_PAGE) return [updates]

  const chunks = [updates.slice(0, ROWS_FIRST_PAGE)]
  for (let i = ROWS_FIRST_PAGE; i < updates.length; i += ROWS_PER_CONTINUATION_PAGE) {
    chunks.push(updates.slice(i, i + ROWS_PER_CONTINUATION_PAGE))
  }
  return chunks
}

const StudentNotesTable = ({ updates }: { updates: StudentUpdate[] }) => (
  <table className='w-full border border-black text-[10px] mb-3'>
    <thead>
      <tr className='bg-[#f2f2f2]'>
        <th className="font-['Montserrat'] border border-black py-1.5 px-2 text-center text-[8px] font-bold">
          STUDENT
        </th>
        <th className="font-['Montserrat'] border border-black py-1.5 px-2 text-center text-[8px] font-bold">
          SESSIONS ATTENDED
        </th>
        <th className="font-['Montserrat'] border border-black py-1.5 px-2 text-center text-[8px] font-bold">
          STUDENT NOTES
        </th>
      </tr>
    </thead>
    <tbody>
      {updates.map((update, i) => (
        <tr key={i}>
          <td className='border border-black py-1.5 px-2 text-center text-[#4d4b4b]'>
            {update.student_name}
            {update.is_sub ? ' (Sub)' : ''}
          </td>
          <td className='border border-black py-1.5 px-2 text-center text-[#4d4b4b]'>
            {update.sessions_attended}
          </td>
          <td className='border border-black py-1.5 px-2 text-center text-[#4d4b4b]'>
            {update.meeting_notes}
          </td>
        </tr>
      ))}
    </tbody>
  </table>
)

const ProgressCheckinMeetingView = ({ data }: { data: ProgressCheckinMeetingData }) => {
  const { context } = data
  const hasTable = context.has_student_updates && (context.student_updates?.length ?? 0) > 0
  const rowChunks = hasTable ? chunkRows(context.student_updates) : [[]]
  const totalPages = rowChunks.length
  const attendeesText = (context.attendees ?? []).join(', ')

  return (
    <div className="space-y-6 print:space-y-0 font-['Nunito']">
      <link
        rel='stylesheet'
        href='https://fonts.googleapis.com/css2?family=Gotu&family=Montserrat:ital,wght@0,400;0,700;1,400&family=Nunito:wght@400;700&display=swap'
      />

      {rowChunks.map((chunk, i) => {
        const isFirstPage = i === 0
        const isLastPage = i === rowChunks.length - 1

        return (
          <section
            key={i}
            className='bg-white shadow-sm w-full aspect-[8.5/11] flex flex-col overflow-hidden break-after-page print:shadow-none'>
            <ReportBanner title='Meeting Notes' />

            <div className='flex-1 px-10 pt-5'>
              {isFirstPage && (
                <>
                  <p className='mb-2'>
                    <span className='font-bold text-gray-900'>Meeting Title: </span>
                    {context.meeting_title}
                  </p>
                  <p className='mb-2'>
                    <span className='font-bold text-gray-900'>Facilitator: </span>
                    {context.facilitator_name}
                  </p>
                  <p className='mb-2'>
                    <span className='font-bold text-gray-900'>Date: </span>
                    {context.meeting_date}
                  </p>
                  <p className='mb-2'>
                    <span className='font-bold text-gray-900'>School: </span>
                    {context.school}
                  </p>
                  <p className='mb-2'>
                    <span className='font-bold text-gray-900'>Attendees: </span>
                    {attendeesText}
                  </p>

                  {hasTable && (
                    <h2 className="text-xl text-gray-600 text-center font-['Gotu'] mt-2 mb-3">
                      Student Notes
                    </h2>
                  )}
                </>
              )}

              {hasTable && <StudentNotesTable updates={chunk} />}

              {isLastPage && (
                <>
                  {context.has_additional_notes && (
                    <div>
                      <p className='font-bold text-gray-900 mb-1 mt-2'>Meeting Notes:</p>
                      <p className='text-sm text-gray-700 leading-relaxed whitespace-pre-line mb-2'>
                        {context.additional_notes}
                      </p>
                    </div>
                  )}

                  {context.has_action_plan && (
                    <div>
                      <p className='font-bold text-gray-900 mb-1 mt-2'>Action Plan:</p>
                      <p className='text-sm text-gray-700 leading-relaxed whitespace-pre-line mb-2'>
                        {context.action_plan}
                      </p>
                    </div>
                  )}
                </>
              )}
            </div>

            <ReportFooter brand='NORTHERN VOICES SPEECH SERVICES' page={i + 1} of={totalPages} />
          </section>
        )
      })}
    </div>
  )
}

export default ProgressCheckinMeetingView
