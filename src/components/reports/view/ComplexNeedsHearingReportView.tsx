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
    <span>NORTHERN VOICE SPEECH SERVICES</span>
    <span className='flex items-center gap-2'>
      <img src='/icon.png' alt='' className='w-4 h-4' />1 of 1
    </span>
  </div>
)
