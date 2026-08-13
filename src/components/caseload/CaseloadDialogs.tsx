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

const CaseloadDialogs = ({
  schoolId,
  consentStudent,
  setConsentStudent,
  createEAForStudent,
  setCreateEAForStudent,
  onEACreated,
  eaToDelete,
  setEaToDelete,
  isDeletingEA,
  onConfirmDeleteEA,
  transferStudentTarget,
  setTransferStudentTarget,
  pauseConfirmStudent,
  setPauseConfirmStudent,
  pauseReason,
  setPauseReason,
  onConfirmPause,
}: CaseloadDialogsProps) => {
  const queryClient = useQueryClient()

  return (
    <>
      {consentStudent && (
        <ConsentFormModal
          isOpen={true}
          onClose={() => setConsentStudent(null)}
          student={consentStudent}
        />
      )}

      <CreateEADialog
        open={!!createEAForStudent}
        onOpenChange={open => {
          if (!open) setCreateEAForStudent(null)
        }}
        schoolId={schoolId}
        onCreated={onEACreated}
      />

      <DeleteEADialog
        open={!!eaToDelete}
        eaName={eaToDelete?.name ?? ''}
        isDeleting={isDeletingEA}
        onConfirm={onConfirmDeleteEA}
        onCancel={() => setEaToDelete(null)}
      />

      {transferStudentTarget && (
        <TransferStudentDialog
          student={transferStudentTarget}
          open={!!transferStudentTarget}
          onOpenChange={open => {
            if (!open) setTransferStudentTarget(null)
          }}
          onSuccess={() => {
            queryClient.invalidateQueries({ queryKey: ['students', 'by-school', schoolId] })
            setTransferStudentTarget(null)
          }}
        />
      )}

      <AlertDialog
        open={!!pauseConfirmStudent}
        onOpenChange={open => {
          if (!open) {
            setPauseConfirmStudent(null)
            setPauseReason('')
          }
        }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Pause / mark student away?</AlertDialogTitle>
            <AlertDialogDescription>
              This will pause services for {pauseConfirmStudent?.first_name}{' '}
              {pauseConfirmStudent?.last_name}. You can reactivate them later from this table.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <div className='py-2'>
            <Label htmlFor='pause-reason' className='text-sm font-medium text-gray-700'>
              Reason (optional)
            </Label>
            <Textarea
              id='pause-reason'
              value={pauseReason}
              onChange={e => setPauseReason(e.target.value)}
              placeholder='Why is this student being paused/away?'
              className='mt-2 min-h-[80px]'
            />
          </div>

          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setPauseConfirmStudent(null)}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction onClick={onConfirmPause}>Pause / Away</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}

export default CaseloadDialogs
