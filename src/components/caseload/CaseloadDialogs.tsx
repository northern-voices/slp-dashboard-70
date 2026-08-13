import { Dispatch, SetStateAction } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Student } from '@/types/database'
import ConsentFormModal from '../students/ConsentFormModal'
import TransferStudentDialog from '../students/TransferStudentDialog'
import CreateEADialog from './CreateEADialog'
import DeleteEADialog from './DeleteEADialog'
import { SpeechEA } from './caseloadUtils'

interface CaseloadDialogsProps {
  schoolId?: string
  consentStudent: Student | null
  setConsentStudent: Dispatch<SetStateAction<Student | null>>
  createEAForStudent: Student | null
  setCreateEAForStudent: Dispatch<SetStateAction<Student | null>>
  onEACreated: (newEaId: string) => void
  eaToDelete: SpeechEA | null
  setEaToDelete: Dispatch<SetStateAction<SpeechEA | null>>
  isDeletingEA: boolean
  onConfirmDeleteEA: () => void
  transferStudentTarget: Student | null
  setTransferStudentTarget: Dispatch<SetStateAction<Student | null>>
  pauseConfirmStudent: Student | null
  setPauseConfirmStudent: Dispatch<SetStateAction<Student | null>>
  pauseReason: string
  setPauseReason: Dispatch<SetStateAction<string>>
  onConfirmPause: () => void
}
