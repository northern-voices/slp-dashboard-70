import { Calendar, Eye } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { parseDateSafely } from '@/utils/dateUtils'

interface LastScreeningCardProps {
  screening: {
    screening_date?: string
    created_at: string
    screener?: string
    result?: string
  }
  wasAbsentMoreRecently?: boolean
  onViewDetails: () => void
}

const LastScreeningCard = ({
  screening,
  wasAbsentMoreRecently,
  onViewDetails,
}: LastScreeningCardProps) => {
  if (!screening) return null

  const getResultBadgeStyle = (result?: string) => {
    if (!result) return 'bg-gray-100 text-gray-700 border border-gray-200'
    if (result.includes('pass')) return 'bg-green-100 text-green-700 border border-green-200'
    return 'bg-amber-100 text-amber-700 border border-amber-200'
  }

  const formatResult = (result?: string) => {
    if (!result) return 'No Result'
    return result
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ')
  }

  return (
    <div
      className='flex flex-col h-full p-4 bg-white border border-gray-200 rounded-xl shadow-sm
  overflow-hidden relative'>
      <div className='flex items-center gap-2 mb-3'>
        <div className='flex items-center justify-center w-6 h-6 rounded-full bg-blue-50'>
          <Eye className='w-3 h-3 text-blue-600' />
        </div>
        <span className='text-xs font-semibold uppercase tracking-wide text-gray-500'>
          Last Screening
        </span>
      </div>
      <div className='space-y-2 mb-3'>
        <div className='flex items-center gap-1.5 flex-wrap'>
          <Badge className={cn('text-xs font-medium', getResultBadgeStyle(screening.result))}>
            {formatResult(screening.result)}
          </Badge>

          {wasAbsentMoreRecently && (
            <Badge className='text-xs font-medium bg-red-100 text-red-700 border border-red-200'>
              Recently Absent
            </Badge>
          )}
        </div>

        {screening.screening_date && (
          <div className='flex items-center gap-1.5 text-xs text-gray-500'>
            <Calendar className='w-3 h-3' />
            <span>
              {parseDateSafely(screening.screening_date).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
              })}
            </span>
          </div>
        )}
      </div>
      <div className='mt-auto'>
        <Button
          variant='outline'
          size='sm'
          className='w-full h-8 text-xs hover:text-blue-600 hover:border-blue-200 hover:bg-blue-50'
          onClick={onViewDetails}>
          <Eye className='w-3.5 h-3.5 mr-1.5' />
          View Details
        </Button>
      </div>
    </div>
  )
}

export default LastScreeningCard
