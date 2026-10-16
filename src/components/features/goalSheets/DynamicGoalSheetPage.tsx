import { ReportBanner, ReportFooter } from '@/components/reports/view/shared/ReportBannerChrome'
import DynamicGoalSheetSessionCard from './DynamicGoalSheetSessionCard'
import type { DynamicGoalSheetSession } from '@/types/database'

interface DynamicGoalSheetPageProps {
  studentName: string
  pageNumber: number
  totalPages: number
  sessions: DynamicGoalSheetSession[]
  goalText: string
  onGoalTextChange: (value: string) => void
  onGoalTextBlur: () => void
}

const DynamicGoalSheetPage = ({
  studentName,
  pageNumber,
  totalPages,
  sessions,
  goalText,
  onGoalTextChange,
  onGoalTextBlur,
}: DynamicGoalSheetPageProps) => (
  <section className="flex flex-col w-full max-w-5xl mx-auto overflow-hidden bg-white rounded-lg shadow-sm font-['Nunito']">
    <link
      rel='stylesheet'
      href='https://fonts.googleapis.com/css2?family=Gotu&family=Montserrat:ital,wght@0,400;0,700;1,400&family=Nunito:wght@400;700&display=swap'
    />

    <ReportBanner title='Goal Sheet' />

    <div className='flex-1 px-10 pt-5'>
      <p className='mb-3 font-bold text-gray-900'>STUDENT: {studentName}</p>

      {sessions.map((session, index) => (
        <DynamicGoalSheetSessionCard
          key={session.id}
          session={session}
          index={index}
          goalText={goalText}
          onGoalTextChange={onGoalTextChange}
          onGoalTextBlur={onGoalTextBlur}
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

    <ReportFooter page={pageNumber} of={totalPages} brand='NORTHERN VOICES SPEECH SERVICES' />
  </section>
)

export default DynamicGoalSheetPage
