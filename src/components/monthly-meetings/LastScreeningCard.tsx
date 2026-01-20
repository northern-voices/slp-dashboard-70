import { Calendar, Eye, User } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

interface LastScreeningCardProps {
  screening: {
    source_table: 'speech' | 'hearing'
    screening_date?: string
    created_at: string
    screener?: string
    result?: string
  }
  onViewDetails: () => void
}

const LastScreeningCard = ({ screening, onViewDetails }: LastScreeningCardProps) => {
  if (!screening) return null

  const isSpeech = screening.source_table === 'speech'

  return (
    <div
      className='mt-3 p-4 bg-gradient-to-br from-gray-50 to-white rounded-xl border border-gray-200
  shadow-sm'>
      {/* Header row */}
      <div className='flex items-center justify-between mb-3'>
        <div className='flex items-center gap-2'>
          <div className={cn('w-2 h-2 rounded-full', isSpeech ? 'bg-blue-500' : 'bg-purple-500')} />
          <span className='text-sm font-semibold text-gray-800'>Last Screening</span>
          <Badge
            className={cn(
              'text-xs font-medium',
              isSpeech
                ? 'bg-blue-100 text-blue-700 border border-blue-200'
                : 'bg-purple-100 text-purple-700 border border-purple-200',
            )}>
            {isSpeech ? 'Speech' : 'Hearing'}
          </Badge>
        </div>
        <Button
          variant='ghost'
          size='sm'
          className='h-8 text-xs text-blue-600 hover:text-blue-700 hover:bg-blue-50'
          onClick={onViewDetails}>
          <Eye className='w-3.5 h-3.5 mr-1.5' />
          View Details
        </Button>
      </div>

      {/* Metadata grid */}
      <div className='grid grid-cols-2 gap-3 text-sm'>
        <div className='flex items-center gap-2 p-2 bg-white rounded-lg border border-gray-100'>
          <Calendar className='w-4 h-4 text-gray-400' />
          <div>
            <p className='text-xs text-gray-500'>Date</p>
            <p className='font-medium text-gray-700'>
              {new Date(screening.screening_date || screening.created_at).toLocaleDateString(
                'en-US',
                {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                },
              )}
            </p>
          </div>
        </div>
        <div className='flex items-center gap-2 p-2 bg-white rounded-lg border border-gray-100'>
          <User className='w-4 h-4 text-gray-400' />
          <div>
            <p className='text-xs text-gray-500'>Screener</p>
            <p className='font-medium text-gray-700'>{screening.screener || 'Unknown'}</p>
          </div>
        </div>
      </div>

      {/* Result section for speech screenings */}
      {isSpeech && screening.result && (
        <div className='mt-3 pt-3 border-t border-gray-100'>
          <div className='flex items-center gap-2'>
            <span className='text-xs text-gray-500'>Result:</span>
            <Badge
              className={cn(
                'text-xs font-medium',
                screening.result.includes('pass')
                  ? 'bg-green-100 text-green-700 border border-green-200'
                  : 'bg-amber-100 text-amber-700 border border-amber-200',
              )}>
              {screening.result
                .split('_')
                .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                .join(' ')}
            </Badge>
          </div>
        </div>
      )}
    </div>
  )
}

export default LastScreeningCard
