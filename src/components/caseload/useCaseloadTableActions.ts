import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { studentsApi } from '@/api/students'
import { useUpdateStudent } from '@/hooks/students'
import { useUpdateSpeechScreening } from '@/hooks/screenings'
import { useToast } from '@/hooks/use-toast'
import { ProgramStatus, ServiceStatus, Screening, Student } from '@/types/database'
import { ErrorPatterns } from '@/types/screening-form'
import { SpeechEA } from './caseloadUtils'

export const useCaseloadTableActions = (
  latestScreeningByStudent: Map<string, Screening>,
  refetchSchoolDetails: () => void
) => {
  const { mutate: updateStudent } = useUpdateStudent()
  const { mutate: updateSpeechScreening } = useUpdateSpeechScreening()
  const { toast } = useToast()

  const [updatingStudentId, setUpdatingStudentId] = useState<string | null>(null)

  const [consentStudent, setConsentStudent] = useState<Student | null>(null)
  const [pauseConfirmStudent, setPauseConfirmStudent] = useState<Student | null>(null)
  const [pauseReason, setPauseReason] = useState('')
  const [createEAForStudent, setCreateEAForStudent] = useState<Student | null>(null)
  const [eaToDelete, setEaToDelete] = useState<SpeechEA | null>(null)
  const [isDeletingEA, setIsDeletingEA] = useState(false)
  const [transferStudentTarget, setTransferStudentTarget] = useState<Student | null>(null)

  const handleAssignEA = (student: Student, staffId: string) => {
    const newEaId = staffId === 'none' ? null : staffId

    updateStudent(
      { id: student.id, studentData: { speech_ea_id: newEaId } },
      {
        onSuccess: () => toast({ title: 'Speech EA updated' }),
        onError: () => {
          toast({
            title: 'Error',
            description: 'Failed to update Speech EA.',
            variant: 'destructive',
          })
        },
      }
    )
  }

  const handleEACreated = (newEaId: string) => {
    if (createEAForStudent) handleAssignEA(createEAForStudent, newEaId)
    setCreateEAForStudent(null)
  }

  const handleConfirmDeleteEA = async () => {
    if (!eaToDelete) return
    setIsDeletingEA(true)

    const { error } = await supabase.from('school_staff').delete().eq('id', eaToDelete.id)

    setIsDeletingEA(false)

    if (error) {
      toast({
        title: 'Error',
        description: 'Failed to remove Speech EA.',
        variant: 'destructive',
      })
      return
    }

    refetchSchoolDetails()
    toast({ title: 'Speech EA removed' })
    setEaToDelete(null)
  }

  const handleResultChange = (student: Student, newResult: string) => {
    const screening = latestScreeningByStudent.get(student.id)
    if (!screening) return

    setUpdatingStudentId(student.id)
    updateSpeechScreening(
      { id: screening.id, data: { result: newResult } },
      {
        onSuccess: () => {
          setUpdatingStudentId(null)
          toast({ title: 'Result updated' })
        },
        onError: error => {
          setUpdatingStudentId(null)
          toast({
            title: 'Error updating result',
            description: error.message,
            variant: 'destructive',
          })
        },
      }
    )
  }

  const handleProgramChange = (student: Student, newProgram: ProgramStatus) => {
    const screening = latestScreeningByStudent.get(student.id)

    setUpdatingStudentId(student.id)

    const doStudentUpdate = () => {
      updateStudent(
        {
          id: student.id,
          studentData: { program_status: newProgram, service_status: null },
        },
        {
          onSuccess: () => {
            setUpdatingStudentId(null)
            toast({ title: 'Program updated' })
          },
          onError: () => {
            setUpdatingStudentId(null)
            toast({
              title: 'Warning',
              description: 'Failed to update the student',
              variant: 'destructive',
            })
          },
        }
      )
    }

    if (!screening) {
      doStudentUpdate()
      return
    }

    const currentErrorPatterns = screening.error_patterns || ({} as ErrorPatterns)

    const cleanErrorPatterns: Partial<ErrorPatterns> = {
      articulation: currentErrorPatterns.articulation || ({} as ErrorPatterns['articulation']),
      add_areas_of_concern:
        currentErrorPatterns.add_areas_of_concern || ({} as ErrorPatterns['add_areas_of_concern']),
      attendance: currentErrorPatterns.attendance || ({} as ErrorPatterns['attendance']),
      additional_observations: currentErrorPatterns.additional_observations || '',
      consent: {
        ...(currentErrorPatterns.consent || {}),
        no_consent: newProgram === 'no_consent',
      },
      screening_metadata: {
        ...(currentErrorPatterns.screening_metadata || {}),
        qualifies_for_speech_program: newProgram === 'qualified',
        sub: newProgram === 'sub',
        graduated: newProgram === 'graduated',
      } as ErrorPatterns['screening_metadata'],
    }

    updateSpeechScreening(
      {
        id: screening.id,
        data: { error_patterns: cleanErrorPatterns as ErrorPatterns },
      },
      {
        onSuccess: () => {
          updateStudent(
            { id: student.id, studentData: { program_status: newProgram, service_status: null } },
            {
              onSuccess: () => {
                setUpdatingStudentId(null)
                toast({ title: 'Program updated' })
              },
              onError: () => {
                setUpdatingStudentId(null)
                toast({
                  title: 'Warning',
                  description: 'Failed to update the student',
                  variant: 'destructive',
                })
              },
            }
          )
        },
        onError: error => {
          setUpdatingStudentId(null)
          toast({
            title: 'Error updating program',
            description: error.message,
            variant: 'destructive',
          })
        },
      }
    )
  }

  const handleStatusChange = (student: Student, newStatus: ServiceStatus) => {
    setUpdatingStudentId(student.id)

    updateStudent(
      {
        id: student.id,
        studentData: { service_status: newStatus === 'none' ? null : newStatus },
      },
      {
        onSuccess: () => {
          setUpdatingStudentId(null)
          toast({ title: 'Status updated' })
        },
        onError: () => {
          setUpdatingStudentId(null)
          toast({
            title: 'Error updating status',
            description: 'Failed to update student status',
            variant: 'destructive',
          })
        },
      }
    )
  }

  const handleConfirmPause = async () => {
    if (!pauseConfirmStudent) return
    handleStatusChange(pauseConfirmStudent, 'paused')

    if (pauseReason.trim()) {
      try {
        await studentsApi.createStudentNote(
          pauseConfirmStudent.id,
          `Paused / Away: ${pauseReason.trim()}`
        )
      } catch {
        toast({
          title: 'Error',
          description: 'Status updated, but the note failed to save.',
          variant: 'destructive',
        })
      }
    }

    setPauseConfirmStudent(null)
    setPauseReason('')
  }

  return {
    updatingStudentId,

    consentStudent,
    setConsentStudent,
    pauseConfirmStudent,
    setPauseConfirmStudent,
    pauseReason,
    setPauseReason,
    createEAForStudent,
    setCreateEAForStudent,
    eaToDelete,
    setEaToDelete,
    isDeletingEA,
    transferStudentTarget,
    setTransferStudentTarget,

    handleAssignEA,
    handleEACreated,
    handleConfirmDeleteEA,
    handleResultChange,
    handleProgramChange,
    handleStatusChange,
    handleConfirmPause,
  }
}
