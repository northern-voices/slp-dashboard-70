import { Dispatch, SetStateAction } from 'react'
import { MoreHorizontal, Loader2, Info, PauseCircle, User, FilePlus, X } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { ResponsiveTableRow, TableCell } from '@/components/ui/responsive-table'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { Button } from '@/components/ui/button'
import { RESULT_OPTIONS, PROGRAM_OPTIONS } from '@/constants/screeningOptions'
import { Student, Screening, ProgramStatus } from '@/types/database'
import { SchoolGrade } from '@/api/schoolGrades'
import { ResultBadge, ProgramBadge, ServiceStatusTag, ConsentBadge } from './CaseloadBadges'
import {
  getStudentGrade,
  getSpeechEAName,
  isCurrentSchoolYear,
  getSchoolYearLabel,
  SpeechEA,
} from './caseloadUtils'

interface CaseloadTableRowProps {
  student: Student
  gradesMap: Map<string, SchoolGrade>
  speechEAs: SpeechEA[]
  screening: Screening | undefined
  hasConsent: boolean
  updatingStudentId: string | null
  onResultChange: (student: Student, newResult: string) => void
  onProgramChange: (student: Student, newProgram: ProgramStatus) => void
  onAssignEA: (student: Student, staffId: string) => void
  onViewStudent: (studentId: string) => void
  setConsentStudent: Dispatch<SetStateAction<Student | null>>
  setCreateEAForStudent: Dispatch<SetStateAction<Student | null>>
  setEaToDelete: Dispatch<SetStateAction<SpeechEA | null>>
  setPauseConfirmStudent: Dispatch<SetStateAction<Student | null>>
}

const CaseloadTableRow = ({
  student,
  gradesMap,
  speechEAs,
  screening,
  hasConsent,
  updatingStudentId,
  onResultChange,
  onProgramChange,
  onAssignEA,
  onViewStudent,
  setConsentStudent,
  setCreateEAForStudent,
  setEaToDelete,
  setPauseConfirmStudent,
}: CaseloadTableRowProps) => {
  const isUpdating = updatingStudentId === student.id

  return (
    <ResponsiveTableRow>
      <TableCell className='font-medium'>
        <div className='flex flex-col gap-1 items-start'>
          <span>
            {student.first_name} {student.last_name}
          </span>
          <ServiceStatusTag status={student.service_status} />
        </div>
      </TableCell>

      <TableCell>{getStudentGrade(student, gradesMap)}</TableCell>

      <TableCell>
        {screening ? (
          <Select
            value={screening.result ?? ''}
            onValueChange={value => onResultChange(student, value)}
            disabled={isUpdating}>
            <SelectTrigger className='w-full h-8 p-0 border-none hover:bg-transparent focus:ring-0'>
              <SelectValue>
                <div className='flex items-center gap-1.5'>
                  {isUpdating && <Loader2 className='w-3 h-3 text-blue-600 animate-spin' />}
                  <ResultBadge result={screening.result} />
                  {!isCurrentSchoolYear(screening.created_at) && (
                    <span className='text-[10px] text-gray-400 whitespace-nowrap'>
                      {getSchoolYearLabel(screening.created_at)}
                    </span>
                  )}
                </div>
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              {RESULT_OPTIONS.map(option => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        ) : (
          <div className='flex items-center gap-1.5'>
            <span className='text-sm text-gray-400 italic'>No Screening Recorded</span>
            <Tooltip>
              <TooltipTrigger asChild>
                <Info className='w-3.5 h-3.5 text-gray-400 cursor-help shrink-0' />
              </TooltipTrigger>
              <TooltipContent className='max-w-[220px] text-center'>
                No screening on record. This can happen if the student transferred from another
                school or if a previous screening was removed.
              </TooltipContent>
            </Tooltip>
          </div>
        )}
      </TableCell>

      <TableCell>
        <Select
          value={student.program_status ?? 'none'}
          onValueChange={value => onProgramChange(student, value as ProgramStatus)}
          disabled={isUpdating}>
          <SelectTrigger className='w-full h-8 p-0 border-none hover:bg-transparent focus:ring-0'>
            <SelectValue>
              <div className='flex items-center gap-2'>
                {isUpdating && <Loader2 className='w-3 h-3 text-blue-600 animate-spin' />}
                <ProgramBadge status={student.program_status} />
              </div>
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            {PROGRAM_OPTIONS.filter(
              option => option.value !== 'none' && option.value !== 'no_consent'
            ).map(option => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </TableCell>

      <TableCell className='text-center'>
        <button
          onClick={() => setConsentStudent(student)}
          className='cursor-pointer hover:opacity-70 transition-opacity'
          title='Add consent'>
          <ConsentBadge hasConsent={hasConsent} />
        </button>
      </TableCell>

      <TableCell>
        <Select
          value={student.speech_ea_id ?? 'none'}
          onValueChange={value => {
            if (value === '__create_new__') {
              setCreateEAForStudent(student)
              return
            }
            onAssignEA(student, value)
          }}>
          <SelectTrigger className='w-full h-8 p-0 truncate border-none hover:bg-transparent focus:ring-0'>
            <SelectValue placeholder='Assign EA'>
              {student.speech_ea_id ? (
                getSpeechEAName(student, speechEAs)
              ) : (
                <span className='text-sm text-gray-400 italic'>No Speech EA assigned</span>
              )}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value='none'>-</SelectItem>
            {speechEAs.map(ea => (
              <SelectItem key={ea.id} value={ea.id} className='pr-8'>
                <div className='flex items-center justify-between w-full gap-2'>
                  <span className='truncate'>{ea.name}</span>
                  <button
                    onPointerDown={e => e.stopPropagation()}
                    onPointerUp={e => e.stopPropagation()}
                    onClick={e => {
                      e.stopPropagation()
                      e.preventDefault()
                      setEaToDelete(ea)
                    }}
                    className='shrink-0 text-gray-400 hover:text-red-500 transition-colors'
                    title={`Remove ${ea.name}`}>
                    <X className='w-3.5 h-3.5' />
                  </button>
                </div>
              </SelectItem>
            ))}
            <SelectSeparator />
            <SelectItem value='__create_new__' className='font-medium text-blue-600'>
              + Create new EA
            </SelectItem>
          </SelectContent>
        </Select>
      </TableCell>

      <TableCell className='text-center'>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant='ghost' size='sm' className='w-8 h-8 p-0'>
              <MoreHorizontal className='w-4 h-4' />
            </Button>
          </DropdownMenuTrigger>

          <DropdownMenuContent align='end'>
            <DropdownMenuItem onClick={() => onViewStudent(student.id)}>
              <User className='w-4 h-4 mr-2' />
              View Student
            </DropdownMenuItem>

            <DropdownMenuItem onClick={() => setConsentStudent(student)}>
              <FilePlus className='w-4 h-4 mr-2' />
              Add Consent
            </DropdownMenuItem>

            {student.service_status !== 'paused' && (
              <DropdownMenuItem onClick={() => setPauseConfirmStudent(student)}>
                <PauseCircle className='w-4 h-4 mr-2' />
                Pause / Away
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </TableCell>
    </ResponsiveTableRow>
  )
}

export default CaseloadTableRow
