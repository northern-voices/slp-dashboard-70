import React from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Eye, Edit, Trash2, Copy, MoreVertical, User, Clock, Volume2, Mic } from 'lucide-react'
import { Draft } from '@/types/draft'
import { formatDistanceToNow } from 'date-fns'
import { parseDateSafely } from '@/utils/dateUtils'

interface DraftCardProps {
  draft: Draft
  onView: (draft: Draft) => void
  onEdit: (draft: Draft) => void
  onDelete: (draft: Draft) => void
  onDuplicate: (draft: Draft) => void
  canEdit: boolean
  canDelete: boolean
}

const DraftCard = ({
  draft,
  onView,
  onEdit,
  onDelete,
  onDuplicate,
  canEdit,
  canDelete,
}: DraftCardProps) => {
  const getCompletionColor = (percentage: number) => {
    if (percentage < 30) return 'bg-red-500'
    if (percentage < 70) return 'bg-yellow-500'
    return 'bg-green-500'
  }

  const getScreeningIcon = (type: string) => {
    return type === 'speech' ? Mic : Volume2
  }

  const ScreeningIcon = getScreeningIcon(draft.screening_type)

  return (
    <Card className='transition-shadow hover:shadow-md'>
      <CardContent className='p-4'>
        <div className='flex items-start justify-between mb-3'>
          <div className='flex items-center gap-2'>
            <div className='flex items-center justify-center w-8 h-8 bg-blue-100 rounded-lg'>
              <ScreeningIcon className='w-4 h-4 text-blue-600' />
            </div>
            <div>
              <h3 className='font-medium text-gray-900 truncate max-w-48'>{draft.title}</h3>
              <p className='text-sm text-gray-500'>{draft.student_name || 'No student selected'}</p>
            </div>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant='ghost' size='sm' className='w-8 h-8 p-0'>
                <MoreVertical className='w-4 h-4' />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align='end'>
              <DropdownMenuItem onClick={() => onView(draft)}>
                <Eye className='w-4 h-4 mr-2' />
                View
              </DropdownMenuItem>
              {canEdit && (
                <DropdownMenuItem onClick={() => onEdit(draft)}>
                  <Edit className='w-4 h-4 mr-2' />
                  Edit
                </DropdownMenuItem>
              )}
              <DropdownMenuItem onClick={() => onDuplicate(draft)}>
                <Copy className='w-4 h-4 mr-2' />
                Duplicate
              </DropdownMenuItem>
              {canDelete && (
                <DropdownMenuItem
                  onClick={() => onDelete(draft)}
                  className='text-red-600 focus:text-red-600'>
                  <Trash2 className='w-4 h-4 mr-2' />
                  Delete
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className='space-y-3'>
          <div className='flex items-center justify-between'>
            <div className='flex items-center gap-2'>
              <Badge variant='outline' className='text-xs'>
                {draft.screening_type === 'speech' ? 'Speech' : 'Hearing'}
              </Badge>
              <span className='text-xs text-gray-500'>{draft.completion_percentage}% complete</span>
            </div>
          </div>

          <div className='w-full h-2 bg-gray-200 rounded-full'>
            <div
              className={`h-2 rounded-full transition-all ${getCompletionColor(draft.completion_percentage)}`}
              style={{ width: `${draft.completion_percentage}%` }}
            />
          </div>

          <div className='flex items-center justify-between text-xs text-gray-500'>
            <div className='flex items-center gap-1'>
              <User className='w-3 h-3' />
              <span>{draft.user_name}</span>
            </div>
            <div className='flex items-center gap-1'>
              <Clock className='w-3 h-3' />
              <span>
                {formatDistanceToNow(parseDateSafely(draft.updated_at), { addSuffix: true })}
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default DraftCard
