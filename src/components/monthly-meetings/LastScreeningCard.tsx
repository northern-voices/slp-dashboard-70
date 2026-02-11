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
      <div className='mb-3'>
        <Badge className={cn('text-xs font-medium', getResultBadgeStyle(screening.result))}>
          {formatResult(screening.result)}
        </Badge>
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
