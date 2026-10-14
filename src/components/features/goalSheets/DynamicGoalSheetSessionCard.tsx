import { useEffect, useState } from 'react'
import { format } from 'date-fns'
import { Card } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Button } from '@/components/ui/button'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Calendar } from '@/components/ui/calendar'
import { CalendarIcon } from 'lucide-react'
import { cn } from '@/lib/utils'
import { DYNAMIC_GOAL_SHEET_RATING_OPTIONS } from '@/constants/dynamicGoalSheet'
import { useUpdateSession } from '@/hooks/goalSheets/use-dynamic-goal-sheets-mutations'
import type { DynamicGoalSheetSession, DynamicGoalSheetRating } from '@/types/database'

interface DynamicGoalSheetSessionCardProps {
  session: DynamicGoalSheetSession
}

const DynamicGoalSheetSessionCard = ({ session }: DynamicGoalSheetSessionCardProps) => {
  const updateSession = useUpdateSession()

  const [activities, setActivities] = useState(session.activities ?? '')
  const [progressNotes, setProgressNotes] = useState(session.progress_notes ?? '')
  const [additionalComments, setAdditionalComments] = useState(session.additional_comments ?? '')

  useEffect(() => {
    setActivities(session.activities ?? '')
    setProgressNotes(session.progress_notes ?? '')
    setAdditionalComments(session.additional_comments ?? '')
  }, [session.id, session.activities, session.progress_notes, session.additional_comments])

  const handleRatingChange = (value: DynamicGoalSheetRating) => {
    updateSession.mutate({ sessionId: session.id, data: { sound_rating: value } })
  }

  const handleDateSelect = (date: Date | undefined) => {
    updateSession.mutate({
      sessionId: session.id,
      data: { session_date: date ? format(date, 'yyyy-MM-dd') : null },
    })
  }

  const handleBlurField = (
    field: 'activities' | 'progress_notes' | 'additional_comments',
    value: string,
    original: string | null
  ) => {
    if (value === (original ?? '')) return
    updateSession.mutate({ sessionId: session.id, data: { [field]: value } })
  }

  const sessionDate = session.session_date ? new Date(session.session_date) : undefined

  return (
    <Card className='overflow-hidden'>
      <div className='px-4 py-2 font-semibold text-white bg-slate-600'>
        SESSION {session.session_number}
      </div>

      <div className='grid grid-cols-1 gap-6 p-4 md:grid-cols-2'>
        <div className='space-y-2'>
          <p className='text-sm font-medium text-gray-900'>How did the student do?</p>
          <p className='text-xs italic text-gray-500'>Were they able to say the sound?</p>

          <RadioGroup
            value={session.sound_rating ?? undefined}
            onValueChange={value => handleRatingChange(value as DynamicGoalSheetRating)}
            className='space-y-2'>
            {DYNAMIC_GOAL_SHEET_RATING_OPTIONS.map(option => (
              <div key={option.value} className='flex items-start space-x-2'>
                <RadioGroupItem value={option.value} id={`${session.id}-${option.value}`} />
                <label htmlFor={`${session.id}-${option.value}`} className='text-sm text-gray-700'>
                  {option.label}
                </label>
              </div>
            ))}
          </RadioGroup>
        </div>

        <div className='space-y-4'>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant='outline'
                size='sm'
                className={cn('w-full md:w-48 justify-start text-left font-normal')}>
                <CalendarIcon className='w-4 h-4 mr-2' />
                {sessionDate ? format(sessionDate, 'PPP') : <span>Pick a date</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className='w-auto p-0' align='start'>
              <Calendar
                mode='single'
                selected={sessionDate}
                onSelect={handleDateSelect}
                initialFocus
                className='p-3 pointer-events-auto'
              />
            </PopoverContent>
          </Popover>

          <div className='space-y-1'>
            <label className='text-sm font-medium text-gray-700'>Activities</label>
            <Textarea
              value={activities}
              onChange={e => setActivities(e.target.value)}
              onBlur={() => handleBlurField('activities', activities, session.activities)}
              rows={2}
            />
          </div>

          <div className='space-y-1'>
            <label className='text-sm font-medium text-gray-700'>
              Progress / Improvement{' '}
              <span className='text-xs font-normal text-gray-400'>
                (Speech, confidence, social skills, language, vocabulary)
              </span>
            </label>
            <Textarea
              value={progressNotes}
              onChange={e => setProgressNotes(e.target.value)}
              onBlur={() => handleBlurField('progress_notes', progressNotes, session.progress_notes)}
              rows={2}
            />
          </div>

          <div className='space-y-1'>
            <label className='text-sm font-medium text-gray-700'>
              Additional comments, questions, or concerns
            </label>
            <Textarea
              value={additionalComments}
              onChange={e => setAdditionalComments(e.target.value)}
              onBlur={() =>
                handleBlurField('additional_comments', additionalComments, session.additional_comments)
              }
              rows={2}
            />
          </div>
        </div>
      </div>
    </Card>
  )
}

export default DynamicGoalSheetSessionCard
