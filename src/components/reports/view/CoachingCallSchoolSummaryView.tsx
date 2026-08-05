interface CoachingCallSchoolSummaryData {
  context: {
    meeting_title: string
    facilitator_name: string
    school: string
    meeting_date: string
    attendees: string[]
    has_topics: boolean
    topics: string
    has_visit_purpose: boolean
    school_visit_purpose: string
    has_additional_notes: boolean
    additional_notes: string
    has_action_plan: boolean
    action_plan: string
  }
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

const ReportFooter = () => (
  <div className='flex items-center justify-between border-t border-gray-200 pt-3 text-xs text-gray-500 px-10 pb-6'>
    <span>NORTHERN VOICES SPEECH SERVICES</span>
    <span className='flex items-center gap-2'>
      <img src='/icon.png' alt='' className='w-4 h-4' />1 of 1
    </span>
  </div>
)
