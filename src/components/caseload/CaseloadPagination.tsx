import { Dispatch, SetStateAction } from 'react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

interface CaseloadPaginationProps {
  itemsPerPage: number | 'all'
  setItemsPerPage: Dispatch<SetStateAction<number | 'all'>>
  currentPage: number
  setCurrentPage: Dispatch<SetStateAction<number>>
  totalPages: number
  startIndex: number
  effectiveItemsPerPage: number
  totalStudents: number
}

const CaseloadPagination = ({
  itemsPerPage,
  setItemsPerPage,
  currentPage,
  setCurrentPage,
  totalPages,
  startIndex,
  effectiveItemsPerPage,
  totalStudents,
}: CaseloadPaginationProps) => {
  return (
    <div className='flex items-center justify-between px-4 py-3 border-t border-gray-200'>
      <div className='flex items-center gap-2'>
        <Label className='text-sm text-gray-600'>Rows per page:</Label>
        <Select
          value={itemsPerPage.toString()}
          onValueChange={value => {
            setItemsPerPage(value === 'all' ? 'all' : Number(value))
            setCurrentPage(1)
          }}>
          <SelectTrigger className='w-[80px] h-9'>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value='10'>10</SelectItem>
            <SelectItem value='25'>25</SelectItem>
            <SelectItem value='50'>50</SelectItem>
            <SelectItem value='all'>All</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className='flex items-center gap-2'>
        <span className='text-sm text-gray-600'>
          {startIndex + 1}–{Math.min(startIndex + effectiveItemsPerPage, totalStudents)} of{' '}
          {totalStudents}
        </span>
        <div className='flex gap-1'>
          <Button
            variant='outline'
            size='sm'
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className='p-0 h-9 w-9'>
            &larr;
          </Button>
          <Button
            variant='outline'
            size='sm'
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className='p-0 h-9 w-9'>
            &rarr;
          </Button>
        </div>
      </div>
    </div>
  )
}

export default CaseloadPagination
