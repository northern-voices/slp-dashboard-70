import { Dispatch, SetStateAction } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { Student } from '@/types/database'
import ConsentFormModal from '../students/ConsentFormModal'
import TransferStudentDialog from '../students/TransferStudentDialog'
import PauseConfirmDialog from '../students/PauseConfirmDialog'
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
  pauseStudentName: string
  pauseReason: string
  setPauseReason: (value: string) => void
  onConfirmPause: () => void
  onCancelPause: () => void
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
  pauseStudentName,
  pauseReason,
  setPauseReason,
  onConfirmPause,
  onCancelPause,
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

      <PauseConfirmDialog
        open={!!pauseConfirmStudent}
        studentName={pauseStudentName}
        reason={pauseReason}
        onReasonChange={setPauseReason}
        onConfirm={onConfirmPause}
        onCancel={onCancelPause}
      />
    </>
  )
}

export default CaseloadDialogs
