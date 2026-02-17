import React from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Calendar, FileText, Eye } from 'lucide-react'
import { Screening } from '@/types/database'
import { getStatusColor, getTypeDisplay } from './screeningUtils'
import { parseDateSafely } from '@/utils/dateUtils'

interface ScreeningTableRowProps {
  screening: Screening
}

const ScreeningTableRow = ({ screening }: ScreeningTableRowProps) => (
  <tr className='transition-colors border-b hover:bg-gray-50'>
    <td className='p-4'>
      <div className='flex items-center gap-2'>
        <Badge variant={getStatusColor(screening.status)} className='text-xs'>
          {screening.status}
        </Badge>
        <span className='text-sm font-medium'>{getTypeDisplay(screening.screening_type)}</span>
      </div>
    </td>
    <td className='p-4'>
      <div className='flex items-center gap-2 text-sm text-gray-600'>
        <Calendar className='w-4 h-4' />
        <span>{parseDateSafely(screening.screening_date).toLocaleDateString()}</span>
      </div>
    </td>
    <td className='p-4'>
      <p className='text-sm text-gray-700'>{screening.notes}</p>
    </td>
    <td className='p-4'>
      <div className='flex gap-1'>
        <Button variant='ghost' size='sm'>
          <Eye className='w-4 h-4' />
        </Button>
        <Button variant='ghost' size='sm'>
          <FileText className='w-4 h-4' />
        </Button>
      </div>
    </td>
  </tr>
)

export default ScreeningTableRow
