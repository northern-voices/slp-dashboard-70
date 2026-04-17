import { Checkbox } from '@/components/ui/checkbox'
import { ResponsiveTableRow, TableCell } from '@/components/ui/responsive-table'
import { format } from 'date-fns'
import { parseDateSafely } from '@/utils/dateUtils'
import { Loader2 } from 'lucide-react'
import type { Screening } from '@/types/database'
import ScreeningRowDropdown from './ScreeningRowDropdown'

interface ScreeningTableRowProps {
  screening: Screening
  isSelected: boolean
  isDeleting: boolean
  onSelect: (screening: Screening, checked: boolean) => void
  onViewDetails: (screening: Screening) => void
  onViewStudent: (screening: Screening) => void
  onEmailReport: (screening: Screening) => void
  onDelete: (screening: Screening) => void
  getScreeningGrade: (screening: Screening) => string
  getResultSelector: (screening: Screening) => React.ReactNode
  getProgramSelector: (screening: Screening) => React.ReactNode
}

const ScreeningTableRow = ({
  screening,
  isSelected,
  isDeleting,
  onSelect,
  onViewDetails,
  onViewStudent,
  onEmailReport,
  onDelete,
  getScreeningGrade,
  getResultSelector,
  getProgramSelector,
}: ScreeningTableRowProps) => {
  const grade = getScreeningGrade(screening)
  const isLoadingGrade = grade === '...'

  return (
    <ResponsiveTableRow
      mobileCardContent={
        <div className='space-y-3'>
          <div className='flex items-center justify-between'>
            <div className='flex items-center gap-2'>
              <Checkbox
                checked={isSelected}
                onCheckedChange={checked => onSelect(screening, checked as boolean)}
              />
              <h3 className='font-medium'>{screening.student_name}</h3>
            </div>
            <ScreeningRowDropdown
              screening={screening}
              isDeleting={isDeleting}
              onViewDetails={onViewDetails}
              onViewStudent={onViewStudent}
              onEmailReport={onEmailReport}
              onDelete={onDelete}
            />
          </div>
          <div className='flex items-center gap-2'>{getResultSelector(screening)}</div>
          <div className='flex items-center gap-2'>{getProgramSelector(screening)}</div>
          <div className='space-y-1 text-sm text-gray-600'>
            <p>
              <span className='font-medium'>Date:</span>{' '}
              {new Date(screening.created_at).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
              })}
            </p>
            <p>
              <span className='font-medium'>Screener:</span> {screening.screener}
            </p>
            <p>
              <span className='font-medium'>Student ID:</span> {screening.student_id}
            </p>
            {!isLoadingGrade && grade !== 'N/A' && (
              <p>
                <span className='font-medium'>Grade:</span> {grade}
              </p>
            )}
          </div>
        </div>
      }>
      <TableCell>
        <Checkbox
          className='mt-1.5'
          checked={isSelected}
          onCheckedChange={checked => onSelect(screening, checked as boolean)}
        />
      </TableCell>
      <TableCell className='max-w-0'>
        <div className='truncate'>
          <div className='text-base font-medium truncate' title={screening.student_name}>
            {screening.student_name}
          </div>
        </div>
      </TableCell>
      <TableCell className='max-w-0'>
        <div className='w-full min-w-[120px]'>{getResultSelector(screening)}</div>
      </TableCell>
      <TableCell className='max-w-0'>
        <div className='w-full min-w-[120px]'>{getProgramSelector(screening)}</div>
      </TableCell>
      <TableCell className='max-w-0'>
        <div className='truncate' title={isLoadingGrade ? '' : grade}>
          {isLoadingGrade ? (
            <Loader2 className='inline w-3 h-3 text-gray-400 animate-spin' />
          ) : grade === 'N/A' ? (
            '-'
          ) : (
            grade
          )}
        </div>
      </TableCell>
      <TableCell className='max-w-0'>
        <div className='truncate' title={format(parseDateSafely(screening.date), 'MMM d, yyyy')}>
          {format(parseDateSafely(screening.date), 'MMM d, yyyy')}
        </div>
      </TableCell>
      <TableCell className='max-w-0'>
        <div className='truncate' title={screening.screener}>
          {screening.screener}
        </div>
      </TableCell>
      <TableCell>
        <ScreeningRowDropdown
          screening={screening}
          isDeleting={isDeleting}
          onViewDetails={onViewDetails}
          onViewStudent={onViewStudent}
          onEmailReport={onEmailReport}
          onDelete={onDelete}
        />
      </TableCell>
    </ResponsiveTableRow>
  )
}

export default ScreeningTableRow
