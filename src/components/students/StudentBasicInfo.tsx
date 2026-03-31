import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { User, Edit, ArrowRightLeft } from 'lucide-react'
import type { Student } from '@/types/database'

interface StudentBasicInfoProps {
  student: Student
  hasConsentThisYear: boolean
  onEdit: () => void
  onTransfer: () => void
}

const StudentBasicInfo = ({
  student,
  hasConsentThisYear,
  onEdit,
  onTransfer,
}: StudentBasicInfoProps) => (
  <div className='flex flex-col mb-4 sm:flex-row sm:items-center sm:justify-between'>
    <div className='flex items-center mb-3 space-x-3 sm:mb-0'>
      <div className='flex items-center justify-center w-12 h-12 bg-blue-100 rounded-full'>
        <User className='w-6 h-6 text-blue-600' />
      </div>
      <div className='flex items-center gap-2 flex-wrap'>
        <h1 className='text-2xl font-semibold text-gray-900'>
          {student.first_name} {student.last_name}
        </h1>
        {hasConsentThisYear ? (
          <Badge className='bg-green-100 text-green-700 border-green-200'>Consent on File</Badge>
        ) : (
          <Badge variant='outline' className='text-gray-500 border-gray-300'>
            No Consent
          </Badge>
        )}
      </div>
    </div>
    <div className='flex flex-wrap items-center gap-2 space-x-2'>
      <Button variant='outline' size='sm' onClick={onTransfer}>
        <ArrowRightLeft className='w-4 h-4 mr-2' />
        Transfer
      </Button>
      <Button variant='outline' size='sm' onClick={onEdit}>
        <Edit className='w-4 h-4 mr-2' />
        Edit
      </Button>
    </div>
  </div>
)

export default StudentBasicInfo
