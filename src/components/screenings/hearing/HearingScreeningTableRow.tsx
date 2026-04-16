import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Eye, Mail, Trash2, MoreHorizontal, User } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { ResponsiveTableRow, TableCell } from '@/components/ui/responsive-table'
import { Screening } from '@/types/database'
import HearingEarCell from '@/components/screenings/hearing/HearingEarCell'

interface HearingScreeningTableRowProps {
  screening: Screening
  isSelected: boolean
  onSelect: (screening: Screening, checked: boolean) => void
  onViewDetails: (screening: Screening) => void
  onViewStudent: (screening: Screening) => void
  onSendReport: (screening: Screening) => void
  onDelete: (screening: Screening) => void
}

const HearingScreeningTableRow = ({
  screening,
  isSelected,
  onSelect,
  onViewDetails,
  onViewStudent,
  onSendReport,
  onDelete,
}: HearingScreeningTableRowProps) => {
  return (
    <ResponsiveTableRow>
      <TableCell>
        <Checkbox
          checked={isSelected}
          onCheckedChange={checked => onSelect(screening, checked as boolean)}
        />
      </TableCell>

      <TableCell className='py-4'>
        <div className='space-y-1'>
          <div className='font-semibold text-sm text-gray-900'>
            {screening.student_name || 'Unknown Student'}
          </div>
          <div className='text-xs text-gray-600'>Grade: {screening.grade || 'N/A'}</div>
          {screening.result && (
            <Badge variant='secondary' className='text-xs mt-1'>
              {screening.result === 'absent' && 'Absent'}
              {screening.result === 'non_compliant' && 'Non Compliant'}
              {screening.result === 'complex_needs' && 'Complex Needs'}
              {screening.result === 'results_uncertain' && 'Results Uncertain'}
            </Badge>
          )}
        </div>
      </TableCell>

      <TableCell className='py-4 px-4'>
        <HearingEarCell
          volumeDb={screening.right_volume_db}
          volumeResult={screening.right_ear_volume_result}
          compliance={screening.right_compliance}
          complianceResult={screening.right_ear_compliance_result}
          pressure={screening.right_pressure}
          pressureResult={screening.right_ear_pressure_result}
          screeningResult={screening.result}
        />
      </TableCell>

      <TableCell className='py-4 px-4'>
        <HearingEarCell
          volumeDb={screening.left_volume_db}
          volumeResult={screening.left_ear_volume_result}
          compliance={screening.left_compliance}
          complianceResult={screening.left_ear_compliance_result}
          pressure={screening.left_pressure}
          pressureResult={screening.left_ear_pressure_result}
          screeningResult={screening.result}
        />
      </TableCell>

      <TableCell className='py-4 px-3'>
        <div className='space-y-3'>
          <div className='border-l-2 border-gray-300 pl-2 py-1'>
            <div className='flex items-center gap-1.5 mb-1'>
              <span className='text-xs font-semibold text-gray-700'>R</span>
              <span className='text-xs text-gray-500'>Right</span>
            </div>
            <div className='text-xs text-gray-600 leading-relaxed'>
              {screening.right_ear_result || '-'}
            </div>
          </div>
          <div className='border-l-2 border-gray-300 pl-2 py-1'>
            <div className='flex items-center gap-1.5 mb-1'>
              <span className='text-xs font-semibold text-gray-700'>L</span>
              <span className='text-xs text-gray-500'>Left</span>
            </div>
            <div className='text-xs text-gray-600 leading-relaxed'>
              {screening.left_ear_result || '-'}
            </div>
          </div>
        </div>
      </TableCell>

      <TableCell className='text-right'>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant='ghost' size='sm'>
              <MoreHorizontal className='w-4 h-4' />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align='end'>
            <DropdownMenuItem onClick={() => onViewDetails(screening)}>
              <Eye className='w-4 h-4 mr-2' />
              View Details
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onViewStudent(screening)}>
              <User className='w-4 h-4 mr-2' />
              View Student
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onSendReport(screening)}>
              <Mail className='w-4 h-4 mr-2' />
              Send Report
            </DropdownMenuItem>
            <DropdownMenuItem className='text-red-600' onClick={() => onDelete(screening)}>
              <Trash2 className='w-4 h-4 mr-2' />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </TableCell>
    </ResponsiveTableRow>
  )
}

export default HearingScreeningTableRow
