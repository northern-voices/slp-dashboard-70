import { ReportBanner, ReportFooter } from './shared/ReportBannerChrome'

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

const CoachingCallSchoolSummaryView = ({ data }: { data: CoachingCallSchoolSummaryData }) => {
  const { context } = data
  const attendeesText = (context.attendees ?? []).join(', ')

  return (
    <div className="space-y-6 print:space-y-0 font-['Nunito']">
      <link
        rel='stylesheet'
        href='https://fonts.googleapis.com/css2?family=Gotu&family=Montserrat:ital,wght@0,400;0,700;1,400&family=Nunito:wght@400;700&display=swap'
      />

      <section className='bg-white shadow-sm w-full aspect-[8.5/11] flex flex-col overflow-hidden print:shadow-none'>
        <ReportBanner title='Meeting Notes' />

        <div className='flex-1 px-10 pt-5'>
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

          {context.has_topics && (
            <div>
              <p className='font-bold text-gray-900 mb-1 mt-2'>Topics Discussed:</p>
              <p className='text-sm text-gray-700 leading-relaxed whitespace-pre-line mb-2'>
                {context.topics}
              </p>
            </div>
          )}

          {context.has_visit_purpose && (
            <div>
              <p className='font-bold text-gray-900 mb-1 mt-2'>Visit Purpose:</p>
              <p className='text-sm text-gray-700 leading-relaxed whitespace-pre-line mb-2'>
                {context.school_visit_purpose}
              </p>
            </div>
          )}

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
        </div>

        <ReportFooter brand='NORTHERN VOICES SPEECH SERVICES' />
      </section>
    </div>
  )
}

export default CoachingCallSchoolSummaryView
