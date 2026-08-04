interface StudentUpdate {
  student_name: string
  sessions_attended: number
  meeting_notes: string
  is_sub: boolean
}

interface MonthlyMeetingReportData {
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
const ROWS_FIRST_PAGE = 12
const ROWS_PER_CONTINUATION_PAGE = 18

const chunkRows = (updates: StudentUpdate[]): StudentUpdate[][] => {
  if (updates.length === 0) return [[]]
  if (updates.length <= ROWS_FIRST_PAGE) return [updates]

  const chunks = [updates.slice(0, ROWS_FIRST_PAGE)]
  for (let i = ROWS_FIRST_PAGE; i < updates.length; i += ROWS_PER_CONTINUATION_PAGE) {
    chunks.push(updates.slice(i, i + ROWS_PER_CONTINUATION_PAGE))
  }
  return chunks
}

const ReportBanner = () => (
  <div className='bg-[#5b7a8b] px-10 py-6 flex items-center justify-between'>
    <h1 className="text-3xl text-white font-['Gotu']">Meeting Notes</h1>
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
  <div className='flex items-center justify-between border-t border-gray-200 pt-3 text-xs text-gray-500 px-10 pb-6'>
    <span>NORTHERN VOICES SPEECH SERVICES</span>
    <span className='flex items-center gap-2'>
      <img src='/icon.png' alt='' className='w-4 h-4' />
      {page} of {of}
    </span>
  </div>
)

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
