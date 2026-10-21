import { format } from 'date-fns'
import { ReportBanner, ReportFooter } from './shared/ReportBannerChrome'
import { DYNAMIC_GOAL_SHEET_RATING_OPTIONS } from '@/constants/dynamicGoalSheet'
import type { DynamicGoalSheetSession } from '@/types/database'

interface DynamicGoalSheetReportPage {
  page_number: number
  goal_text: string
  sessions: DynamicGoalSheetSession[]
}

interface DynamicGoalSheetReportData {
  context: {
    student_name: string
    pages: DynamicGoalSheetReportPage[]
  }
}

const Checkbox = ({ label, checked }: { label: string; checked?: boolean }) => (
  <div className='flex items-start gap-1.5 mb-1'>
    <div
      className={`w-2.5 h-2.5 border border-gray-700 shrink-0 mt-0.5 ${checked ? 'bg-gray-700' : ''}`}
    />
    <span className='text-[11px] leading-tight'>{label}</span>
  </div>
)

const SessionCard = ({
  session,
  index,
  goalText,
}: {
  session: DynamicGoalSheetSession
  index: number
  goalText: string
}) => {
  const isTan = index === 1

  return (
    <div className='border border-[#b7b7b7] mb-3'>
      <div className={`py-2 px-4 ${isTan ? 'bg-[#e9e2d9]' : 'bg-[#5b7a8b]'}`}>
        <p
          className={`font-['Montserrat'] font-bold text-center text-xs tracking-wide ${
            isTan ? 'text-[#4d4b4b]' : 'text-white'
          }`}>
          SESSION {session.session_number}
        </p>
      </div>
      <div
        className={`flex flex-col gap-4 p-4 sm:flex-row sm:gap-0 ${
          isTan ? 'bg-[#f9f7f4]' : 'bg-[#eff3f6]'
        }`}>
        <div className='border-gray-300 sm:w-[38%] sm:pr-4 sm:border-r'>
          <p className='mb-0.5 text-xs font-bold text-gray-900'>How did the student do?</p>
          <p className="font-['Montserrat'] mb-1.5 text-[11px] italic text-gray-500">
            Were they able to say the sound?
          </p>
          {DYNAMIC_GOAL_SHEET_RATING_OPTIONS.map(option => (
            <Checkbox
              key={option.value}
              label={option.label}
              checked={session.sound_rating === option.value}
            />
          ))}
        </div>

        <div className='text-xs sm:w-[62%] sm:pl-4'>
          <p className='mb-3 leading-snug'>
            <span className="font-['Montserrat'] italic font-bold">Goal: </span>
            {goalText}
          </p>
          <p className='mb-3 text-gray-700'>
            Date:{' '}
            {session.session_date
              ? format(new Date(session.session_date), 'MMM d, yyyy')
              : '______________________'}
          </p>

          <p className='mb-1 font-bold text-gray-900'>Activities / Games</p>
          {session.activities ? (
            <p className='mb-3 text-gray-700'>{session.activities}</p>
          ) : (
            <div className='h-6 mb-3 border-b border-gray-400' />
          )}

          <p className='mb-1 font-bold text-gray-900'>
            Progress / Improvement{' '}
            <span className="font-['Montserrat'] italic font-normal text-gray-500">
              (Speech, confidence, social skills, language, vocabulary, etc.)
            </span>
          </p>
          {session.progress_notes ? (
            <p className='mb-3 text-gray-700'>{session.progress_notes}</p>
          ) : (
            <div className='h-6 mb-3 border-b border-gray-400' />
          )}

          <p className='mb-1 font-bold text-gray-900'>
            Additional comments, questions, or concerns
          </p>
          {session.additional_comments ? (
            <p className='mb-1 text-gray-700'>{session.additional_comments}</p>
          ) : (
            <div className='h-6 mb-1 border-b border-gray-400' />
          )}
        </div>
      </div>
    </div>
  )
}

const DynamicGoalSheetReportView = ({ data }: { data: DynamicGoalSheetReportData }) => {
  const { context } = data
  const totalPages = context.pages.length

  return (
    <div className="space-y-6 print:space-y-0 font-['Nunito']">
      <link
        rel='stylesheet'
        href='https://fonts.googleapis.com/css2?family=Gotu&family=Montserrat:ital,wght@0,400;0,700;1,400&family=Nunito:wght@400;700&display=swap'
      />

      {context.pages.map(page => (
        <section
          key={page.page_number}
          className='bg-white shadow-sm w-full aspect-[8.5/11] flex flex-col overflow-hidden break-after-page print:shadow-none'>
          <ReportBanner title='Goal Sheet' />

          <div className='flex-1 px-10 pt-5'>
            <p className='mb-3 font-bold text-gray-900'>STUDENT: {context.student_name}</p>

            {page.sessions.map((session, index) => (
              <SessionCard
                key={session.id}
                session={session}
                index={index}
                goalText={page.goal_text}
              />
            ))}

            <div className='flex mb-6'>
              <div className='flex items-center justify-center flex-1 py-2 border border-[#b7b7b7] bg-[#e9e2d9] mr-px'>
                <div className='w-2 h-2 mr-1.5 rounded-full border border-gray-700' />
                <span className="font-['Montserrat'] text-xs font-bold tracking-wide text-gray-700">
                  MASTERED
                </span>
              </div>
              <div className='flex items-center justify-center flex-1 py-2 border border-[#b7b7b7] bg-[#e9e2d9]'>
                <div className='w-2 h-2 mr-1.5 rounded-full border border-gray-700' />
                <span className="font-['Montserrat'] text-xs font-bold tracking-wide text-gray-700">
                  NEEDS MORE PRACTICE
                </span>
              </div>
            </div>
          </div>

          <ReportFooter
            page={page.page_number}
            of={totalPages}
            brand='NORTHERN VOICES SPEECH SERVICES'
          />
        </section>
      ))}
    </div>
  )
}

export default DynamicGoalSheetReportView
