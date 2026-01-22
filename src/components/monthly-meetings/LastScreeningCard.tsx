import { Calendar, Eye, User } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

interface LastScreeningCardProps {
  screening: {
    screening_date?: string
    created_at: string
    screener?: string
    result?: string
  }
  onViewDetails: () => void
}

const LastScreeningCard = ({ screening, onViewDetails }: LastScreeningCardProps) => {
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
      className='mt-3 p-4 bg-gradient-to-br from-gray-50 to-white rounded-xl border border-gray-200
  shadow-sm'>
      {/* Header row */}
      <div className='flex items-center justify-between'>
        <div className='flex items-center gap-2'>
          <div className='w-2 h-2 rounded-full bg-blue-500' />
          <span className='text-sm font-semibold text-gray-800'>Last Screening</span>
          <Badge className={cn('text-xs font-medium', getResultBadgeStyle(screening.result))}>
            {formatResult(screening.result)}
          </Badge>
        </div>
        <Button
          variant='ghost'
          size='sm'
          className='h-8 text-xs text-blue-600 hover:text-blue-700 hover:bg-blue-50'
          onClick={onViewDetails}>
          <Eye className='w-3.5 h-3.5 mr-1.5' />
          View More Details
        </Button>
      </div>
    </div>
  )
}

export default LastScreeningCard
