import { useEffect, useRef } from 'react'
import { CUSTOMIZABLE_GOAL_SHEET_RATING_OPTIONS } from '@/constants/customizableGoalSheet'
import type { CustomizableGoalSheetSession } from '@/types/database'

interface CustomizableGoalSheetSessionCardProps {
  session: CustomizableGoalSheetSession
  index: number
  goalText: string
  onGoalTextChange: (value: string) => void
  onGoalTextBlur: () => void
}

const Checkbox = ({ label }: { label: string }) => (
  <div className='flex items-start gap-1.5 mb-1'>
    <div className='w-2.5 h-2.5 border border-gray-700 shrink-0 mt-0.5' />
    <span className='text-[11px] leading-tight'>{label}</span>
  </div>
)

const CustomizableGoalSheetSessionCard = ({
  session,
  index,
  goalText,
  onGoalTextChange,
  onGoalTextBlur,
}: CustomizableGoalSheetSessionCardProps) => {
  const isTan = index === 1
  const goalTextareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    const el = goalTextareaRef.current
    if (!el) return
    el.style.height = 'auto'
    el.style.height = `${el.scrollHeight}px`
  }, [goalText])

  return (
    <div className='border border-[#b7b7b7] mb-3'>
      <div
        className={`flex items-center gap-3 py-2 px-4 ${isTan ? 'bg-[#e9e2d9]' : 'bg-[#5b7a8b]'}`}>
        <p
          className={`font-['Montserrat'] font-bold shrink-0 text-xs tracking-wide ${
            isTan ? 'text-[#4d4b4b]' : 'text-white'
          }`}>
          SESSION {session.session_number}
        </p>
        <div className='flex items-start flex-1 min-w-0 gap-1 leading-snug'>
          <span
            className={`font-['Montserrat'] italic font-bold shrink-0 text-xs ${
              isTan ? 'text-[#4d4b4b]' : 'text-white'
            }`}>
            Goal:
          </span>
          <textarea
            ref={goalTextareaRef}
            value={goalText}
            onChange={e => onGoalTextChange(e.target.value)}
            onBlur={onGoalTextBlur}
            rows={1}
            placeholder='Describe the goal for this student...'
            className={`flex-1 p-0 overflow-hidden bg-transparent border-0 resize-none text-xs leading-snug focus:outline-none focus:ring-0 ${
              isTan
                ? 'text-[#4d4b4b] placeholder:text-[#4d4b4b]/60'
                : 'text-white placeholder:text-white/70'
            }`}
          />
        </div>
      </div>
      <div
        className={`flex flex-col gap-4 p-4 sm:flex-row sm:gap-0 ${isTan ? 'bg-[#f9f7f4]' : 'bg-[#eff3f6]'}`}>
        <div className='border-gray-300 sm:w-[38%] sm:pr-4 sm:border-r'>
          <p className='mb-1.5 text-xs font-bold text-gray-900'>How did the student do?</p>
          {CUSTOMIZABLE_GOAL_SHEET_RATING_OPTIONS.map(option => (
            <Checkbox key={option.value} label={option.label} />
          ))}
        </div>

        <div className='text-xs sm:w-[62%] sm:pl-4'>
          <p className='mb-3 text-gray-700'>Date: ______________________</p>

          <p className='mb-1 font-bold text-gray-900'>Activities / Games</p>
          <div className='h-6 mb-3 border-b border-gray-400' />

          <p className='mb-1 font-bold text-gray-900'>
            Progress / Improvement{' '}
            <span className="font-['Montserrat'] italic font-normal text-gray-500">
              (Speech, confidence, social skills, language, vocabulary, etc.)
            </span>
          </p>
          <div className='h-6 mb-3 border-b border-gray-400' />

          <p className='mb-1 font-bold text-gray-900'>
            Additional comments, questions, or concerns
          </p>
          <div className='h-6 mb-1 border-b border-gray-400' />
        </div>
      </div>
    </div>
  )
}

export default CustomizableGoalSheetSessionCard
