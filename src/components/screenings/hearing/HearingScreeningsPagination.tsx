import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

interface HearingScreeningsPaginationProps {
  currentPage: number
  totalCount: number
  totalPages: number
  pageSize: number
  onPageChange: (page: number) => void
  onPageSizeChange: (size: number) => void
}

const HearingScreeningsPagination = ({
  currentPage,
  totalCount,
  totalPages,
  pageSize,
  onPageChange,
  onPageSizeChange,
}: HearingScreeningsPaginationProps) => {
  if (totalCount === 0 || totalPages <= 1) return null

  return (
    <div className='flex items-center justify-between px-4 py-3 border-t border-gray-200 bg-white rounded-b-lg'>
      <div className='flex items-center gap-2'>
        <span className='text-sm text-gray-600'>Rows per page:</span>
        <Select
          value={String(pageSize)}
          onValueChange={val => {
            onPageSizeChange(Number(val))
            onPageChange(1)
          }}>
          <SelectTrigger className='w-[70px] h-8'>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value='25'>25</SelectItem>
            <SelectItem value='50'>50</SelectItem>
            <SelectItem value='100'>100</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className='flex items-center gap-4'>
        <span className='text-sm text-gray-600'>
          {(currentPage - 1) * pageSize + 1}-{Math.min(currentPage * pageSize, totalCount)} of{' '}
          {totalCount}
        </span>
        <div className='flex gap-1'>
          <Button
            variant='outline'
            size='sm'
            onClick={() => onPageChange(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}>
            Previous
          </Button>
          <Button
            variant='outline'
            size='sm'
            onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
            disabled={currentPage === totalPages}>
            Next
          </Button>
        </div>
      </div>
    </div>
  )
}

export default HearingScreeningsPagination
