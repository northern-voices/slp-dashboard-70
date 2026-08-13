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
