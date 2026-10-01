import { GraduationCap, Calendar, User } from 'lucide-react'
import type { SchoolGrade } from '@/api/schoolGrades'
import type { Student } from '@/types/database'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

interface SpeechEA {
  id: string
  name: string
  roles: string[]
}

interface StudentDetailsGridProps {
  student: Student
  currentGrade: SchoolGrade | null
  isLoadingCurrentGrade: boolean
  formatDate: (dateString: string) => string
  getAge: (dateString: string) => number
  speechEAs: SpeechEA[]
  onAssignEA: (staffId: string | null) => void
}

const StudentDetailsGrid = ({
  student,
  currentGrade,
  isLoadingCurrentGrade,
  formatDate,
  getAge,
  speechEAs,
  onAssignEA,
}: StudentDetailsGridProps) => (
  <div className='grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4'>
    <div className='flex items-start gap-2'>
      <GraduationCap className='w-4 h-4 mt-1 text-gray-400' />
      <div>
        <span className='text-sm font-medium text-gray-700'>Current Grade</span>
        {isLoadingCurrentGrade ? (
          <div className='w-32 h-5 mt-1 bg-gray-200 rounded animate-pulse' />
        ) : (
          <p className='text-sm text-gray-600'>
            {currentGrade
              ? `${currentGrade.grade_level} (${currentGrade.academic_year})`
              : 'No grade assigned'}
          </p>
        )}
      </div>
    </div>

    {student.date_of_birth && (
      <div className='flex items-start gap-2'>
        <Calendar className='w-4 h-4 mt-1 text-gray-400' />
        <div>
          <span className='text-sm font-medium text-gray-700'>Date of Birth</span>
          <p className='text-sm text-gray-600'>{formatDate(student.date_of_birth)}</p>
          <p className='text-xs text-gray-500'>{getAge(student.date_of_birth)} years old</p>
        </div>
      </div>
    )}

    <div className='flex items-start gap-2'>
      <User className='w-4 h-4 mt-1 text-gray-400' />

      <div>
        <span className='text-sm font-medium text-gray-700'>Speech EA</span>
        <Select
          value={student.speech_ea_id ?? 'none'}
          onValueChange={value => onAssignEA(value === 'none' ? null : value)}>
          <SelectTrigger className='h-7 text-sm text-gray-600 border-none shadow-none p-0 w-auto focus:ring-0'>
            <SelectValue placeholder='None assigned' />
          </SelectTrigger>

          <SelectContent>
            <SelectItem value='none'>None assigned</SelectItem>
            {speechEAs.map(ea => (
              <SelectItem key={ea.id} value={ea.id}>
                {ea.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  </div>
)

export default StudentDetailsGrid
