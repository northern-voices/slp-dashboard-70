import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Eye, Trash2, MoreHorizontal, Loader2, Mail, User, RefreshCw } from 'lucide-react'
import type { Screening } from '@/types/database'

interface ScreeningRowDropdownProps {
  screening: Screening
  isDeleting: boolean
  isRescreenApplicable: boolean
  onViewDetails: (screening: Screening) => void
  onViewStudent: (screening: Screening) => void
  onEmailReport: (screening: Screening) => void
  onRescreen: (screening: Screening) => void
  onDelete: (screening: Screening) => void
}

const ScreeningRowDropdown = ({
  screening,
  isDeleting,
  isRescreenApplicable,
  onViewDetails,
  onViewStudent,
  onEmailReport,
  onRescreen,
  onDelete,
}: ScreeningRowDropdownProps) => (
  <DropdownMenu>
    <DropdownMenuTrigger asChild>
      <Button variant='ghost' size='sm'>
        <MoreHorizontal className='w-4 h-4' />
      </Button>
    </DropdownMenuTrigger>
    <DropdownMenuContent align='end' className='bg-white'>
      <DropdownMenuItem onClick={() => onViewDetails(screening)}>
        <Eye className='w-4 h-4 mr-2' />
        View Details
      </DropdownMenuItem>
      <DropdownMenuItem onClick={() => onViewStudent(screening)}>
        <User className='w-4 h-4 mr-2' />
        View Student
      </DropdownMenuItem>
      <DropdownMenuItem onClick={() => onEmailReport(screening)}>
        <Mail className='w-4 h-4 mr-2' />
        Send Report
      </DropdownMenuItem>
      <DropdownMenuItem onClick={() => onRescreen(screening)} disabled={!isRescreenApplicable}>
        <RefreshCw className='w-4 h-4 mr-2' />
        Rescreening
      </DropdownMenuItem>
      <DropdownMenuItem
        className='text-red-600'
        onClick={() => onDelete(screening)}
        disabled={isDeleting}>
        {isDeleting ? (
          <Loader2 className='w-4 h-4 mr-2 animate-spin' />
        ) : (
          <Trash2 className='w-4 h-4 mr-2' />
        )}
        {isDeleting ? 'Deleting...' : 'Delete'}
      </DropdownMenuItem>
    </DropdownMenuContent>
  </DropdownMenu>
)

export default ScreeningRowDropdown
