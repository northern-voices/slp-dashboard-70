import { DYNAMIC_GOAL_SHEET_RATING_OPTIONS } from '@/constants/dynamicGoalSheet'
import type { DynamicGoalSheetSession } from '@/types/database'

interface DynamicGoalSheetSessionCardProps {
  session: DynamicGoalSheetSession
  index: number
  goalText: string
  onGoalTextChange: (value: string) => void
  onGoalTextBlur: () => void
}

const Checkbox = ({ label }: { label: string }) => (
  <div className='flex items-start gap-1.5 mb-1'>
    <div className='w-2.5 h-2.5 border border-gray-700 shrink-0 mt-0.5' />
    <span className='text-xs leading-tight'>{label}</span>
  </div>
)

const DynamicGoalSheetSessionCard = ({
  session,
  index,
  goalText,
  onGoalTextChange,
  onGoalTextBlur,
}: DynamicGoalSheetSessionCardProps) => {
  const isTan = index === 1

  return (
    <div className='border border-[#b7b7b7] mb-3'>
      <div className={`py-1.5 px-3 ${isTan ? 'bg-[#e9e2d9]' : 'bg-[#5b7a8b]'}`}>
        <p
          className={`font-['Montserrat'] font-bold text-center text-xs tracking-wide ${
            isTan ? 'text-[#4d4b4b]' : 'text-white'
          }`}>
          SESSION {session.session_number}
        </p>
      </div>
      <div
        className={`flex flex-col gap-4 p-3 sm:flex-row ${isTan ? 'bg-[#f9f7f4]' : 'bg-[#eff3f6]'}`}>
        <div className='border-gray-300 sm:w-[38%] sm:pr-3 sm:border-r'>
          <p className='mb-0.5 text-xs font-bold text-gray-900'>How did the student do?</p>
          <p className="font-['Montserrat'] mb-1.5 text-[11px] italic text-gray-500">
            Were they able to say the sound?
          </p>
          {DYNAMIC_GOAL_SHEET_RATING_OPTIONS.map(option => (
            <Checkbox key={option.value} label={option.label} />
          ))}
        </div>

        <div className='text-xs sm:w-[62%] sm:pl-3'>
          <div className='flex items-start gap-1 mb-2 leading-snug'>
            <span className="font-['Montserrat'] italic font-bold shrink-0">Goal:</span>
            <textarea
              value={goalText}
              onChange={e => onGoalTextChange(e.target.value)}
              onBlur={onGoalTextBlur}
              rows={2}
              placeholder='Describe the goal for this student...'
              className='flex-1 p-0 bg-transparent border-0 resize-none text-xs leading-snug focus:outline-none focus:ring-0'
            />
          </div>
          <p className='mb-3 text-gray-700'>Date: ______________________</p>

          <p className='mt-1 mb-1 font-bold text-gray-900'>Activities / Games</p>
          <div className='h-3.5 mb-1 border-b border-gray-400' />

          <p className='mt-1 mb-1 font-bold text-gray-900'>
            Progress / Improvement{' '}
            <span className="font-['Montserrat'] italic font-normal text-gray-500">
              (Speech, confidence, social skills, language, vocabulary, etc.)
            </span>
          </p>
          <div className='h-3.5 mb-1 border-b border-gray-400' />

          <p className='mt-1 mb-1 font-bold text-gray-900'>
            Additional comments, questions, or concerns
          </p>
          <div className='h-3.5 mb-1 border-b border-gray-400' />
        </div>
      </div>
    </div>
  )
}

export default DynamicGoalSheetSessionCard
