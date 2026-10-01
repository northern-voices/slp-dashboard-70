import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { parseDateSafely } from '@/utils/dateUtils'
import { Card, CardContent } from '@/components/ui/card'
import type { Student, ServiceStatus } from '@/types/database'
import LoadingSpinner from '@/components/common/LoadingSpinner'
import { useToast } from '@/hooks/use-toast'
import { studentsApi } from '@/api/students'
import { schoolGradesApi, type SchoolGrade } from '@/api/schoolGrades'
import { useQueryClient } from '@tanstack/react-query'
import { useUpdateStudent } from '@/hooks/students/use-students-mutations'
import { usePauseStudent } from '@/hooks/students/use-pause-student'
import PauseConfirmDialog from './PauseConfirmDialog'
import TransferStudentDialog from './TransferStudentDialog'
import { useConsentForms } from '@/hooks/students/use-consent-forms'
import StudentBasicInfo from './StudentBasicInfo'
import StudentDetailsGrid from './StudentDetailsGrid'
import StudentNotes from './StudentNotes'
import EditStudentDialog from '@/components/students/EditStudentDialog'
import { useSchoolDetails } from '@/hooks/school/useSchoolDetails'
import { useOrganization } from '@/contexts/OrganizationContext'
import { useStudentTransferHistory } from '@/hooks/students'
import TransferHistorySection from './TransferHistorySection'
import { getCurrentAcademicYear, getAcademicYearRange } from '@/lib/academicYear'

interface StudentInfoHeaderProps {
  student?: Student | null
  onEdit?: () => void
  isLoading?: boolean
}

const StudentInfoHeader = ({ student, onEdit, isLoading = false }: StudentInfoHeaderProps) => {
  const [localStudent, setLocalStudent] = useState<Student | null>(null)
  const [isEditingName, setIsEditingName] = useState(false)
  const [editedFirstName, setEditedFirstName] = useState('')
  const [editedLastName, setEditedLastName] = useState('')
  const [editedGradeLevel, setEditedGradeLevel] = useState('')
  const [isTransferDialogOpen, setIsTransferDialogOpen] = useState(false)
  const [currentGrade, setCurrentGrade] = useState<SchoolGrade | null>(null)
  const [isLoadingCurrentGrade, setIsLoadingCurrentGrade] = useState(false)

  const { toast } = useToast()
  const { currentSchool } = useOrganization()
  const queryClient = useQueryClient()
  const navigate = useNavigate()

  const { data: consentForms = [] } = useConsentForms(localStudent?.id || '')
  const { data: schoolDetails } = useSchoolDetails(currentSchool ?? null)
  const { data: transferHistory = [] } = useStudentTransferHistory(localStudent?.id || '')

  const transferredOutRecord = transferHistory.find(
    transfer => transfer.from_school_id === currentSchool?.id
  )

  const transferredInRecord = transferHistory.find(
    transfer => transfer.to_school_id === currentSchool?.id
  )

  const isViewingFromOldSchool = localStudent?.school_id !== currentSchool?.id

  const speechEAs = (schoolDetails?.schoolTeam ?? []).filter(m => m.roles.includes('speech_ea'))

  const handleAssignEA = async (staffId: string | null) => {
    if (!localStudent?.id) return

    try {
      await studentsApi.updateStudent(localStudent.id, { speech_ea_id: staffId })
      setLocalStudent({ ...localStudent, speech_ea_id: staffId })
      queryClient.invalidateQueries({ queryKey: ['students'] })
      toast({ title: 'Speech EA updated' })
    } catch {
      toast({ title: 'Error', description: 'Failed to update Speech EA.', variant: 'destructive' })
    }
  }

  const { mutate: updateStudent } = useUpdateStudent()

  const handleStatusChange = (student: Student, newStatus: ServiceStatus) => {
    const resolvedStatus = newStatus === 'none' ? null : newStatus

    updateStudent(
      { id: student.id, studentData: { service_status: resolvedStatus } },
      {
        onSuccess: () => {
          setLocalStudent(prev =>
            prev && prev.id === student.id ? { ...prev, service_status: resolvedStatus } : prev
          )
          toast({ title: 'Status updated' })
        },
        onError: () => {
          toast({ title: 'Error', description: 'Failed to update status.', variant: 'destructive' })
        },
      }
    )
  }

  const {
    pauseTarget: pauseConfirmStudent,
    pauseStudentName,
    pauseReason,
    setPauseReason,
    requestPause: handlePause,
    resumeItem: handleResume,
    confirmPause: handleConfirmPause,
    cancelPause: handleCancelPause,
    isSaving: isSavingPause,
  } = usePauseStudent<Student>({
    getStudentId: s => s.id,
    getStudentName: s => `${s.first_name} ${s.last_name}`,
    onStatusChange: handleStatusChange,
  })

  const hasConsentThisYear = (() => {
    const { start, end } = getAcademicYearRange(getCurrentAcademicYear())

    return consentForms.some(form => {
      const date = new Date(form.consent_date)
      return date >= start && date <= end
    })
  })()

  useEffect(() => {
    setLocalStudent(student || null)
  }, [student])

  // Update local student when prop changes
  useEffect(() => {
    if (!localStudent?.current_grade_id || !localStudent?.school_id) {
      setCurrentGrade(null)
      return
    }

    setIsLoadingCurrentGrade(true)
    schoolGradesApi
      .getSchoolGradesBySchool(localStudent.school_id)
      .then(grades => {
        setCurrentGrade(grades.find(g => g.id === localStudent.current_grade_id) || null)
      })
      .catch(error => {
        console.error('Error fetching current grade:', error)
        setCurrentGrade(null)
      })
      .finally(() => {
        setIsLoadingCurrentGrade(false)
      })
  }, [localStudent?.id, localStudent?.current_grade_id, localStudent?.school_id])

  const getAge = (birthDate: string) => {
    const today = new Date()
    const birth = parseDateSafely(birthDate)
    let age = today.getFullYear() - birth.getFullYear()
    const monthDiff = today.getMonth() - birth.getMonth()

    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--
    }

    return age
  }

  const formatDate = (dateString: string) => {
    return parseDateSafely(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  const handleEditName = () => {
    if (!localStudent) return
    setEditedFirstName(localStudent.first_name)
    setEditedLastName(localStudent.last_name)
    setEditedGradeLevel(currentGrade?.grade_level || '')
    setIsEditingName(true)
  }

  const handleSaveName = async () => {
    if (!localStudent?.id || !editedFirstName.trim() || !editedLastName.trim()) {
      toast({
        title: 'Error',
        description: 'First name and last name are required.',
        variant: 'destructive',
      })
      return
    }

    try {
      let resolvedGrade: SchoolGrade | null = null

      if (editedGradeLevel && localStudent.school_id) {
        resolvedGrade = await schoolGradesApi.getOrCreateGrade(
          localStudent.school_id,
          editedGradeLevel,
          getCurrentAcademicYear()
        )
      }

      await studentsApi.updateStudent(localStudent.id, {
        first_name: editedFirstName.trim(),
        last_name: editedLastName.trim(),
        current_grade_id: resolvedGrade?.id,
      })

      // Invalidate React Query cache to refetch student data
      queryClient.invalidateQueries({ queryKey: ['students'] })
      queryClient.invalidateQueries({ queryKey: ['students', localStudent.id] })

      // Update local student state immediately for instant UI feedback
      setLocalStudent({
        ...localStudent,
        first_name: editedFirstName.trim(),
        last_name: editedLastName.trim(),
        current_grade_id: resolvedGrade?.id || null,
      })

      setCurrentGrade(resolvedGrade)

      setIsEditingName(false)
      toast({
        title: 'Student updated',
        description: 'Student information has been successfully updated.',
      })

      if (onEdit) {
        onEdit()
      }
    } catch (error) {
      console.error('Error updating student:', error)
      toast({
        title: 'Error',
        description: 'Failed to update student information. Please try again.',
        variant: 'destructive',
      })
    }
  }

  const handleCancelEditName = () => {
    setIsEditingName(false)
    setEditedFirstName('')
    setEditedLastName('')
    setEditedGradeLevel('')
  }

  if (isLoading) {
    return (
      <Card className='mb-6'>
        <CardContent className='p-6'>
          <div className='flex items-center justify-center py-8'>
            <div className='text-center'>
              <LoadingSpinner size='md' className='mx-auto mb-2' />
              <p className='text-gray-600'>Loading student information...</p>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!localStudent) {
    return (
      <Card className='mb-6'>
        <CardContent className='p-6'>
          <div className='py-8 text-center'>
            <p className='text-gray-600'>Student information not available</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className='mb-6'>
      <CardContent className='p-6'>
        <div className='flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between'>
          <div className='flex-1'>
            {/* {isViewingFromOldSchool && transferredOutRecord && (
              <div className='px-4 py-3 mb-4 text-sm text-orange-800 border border-orange-200 rounded-md bg-orange-50'>
                This student transferred to{' '}
                <span className='font-semibold'>{transferredOutRecord.to_school?.name}</span> on{' '}
                {new Date(transferredOutRecord.transfer_date).toLocaleDateString('en-US', {
                  month: 'long',
                  day: 'numeric',
                  year: 'numeric',
                })}
                . Their profile is now managed there.
              </div>
            )}

            {!isViewingFromOldSchool && transferredInRecord && (
              <div className='px-4 py-3 mb-4 text-sm text-blue-800 border border-blue-200 rounded-md bg-blue-50'>
                Transferred in from{' '}
                <span className='font-semibold'>{transferredInRecord.from_school?.name} </span> on{' '}
                {new Date(transferredInRecord.transfer_date).toLocaleDateString('en-US', {
                  month: 'long',
                  day: 'numeric',
                  year: 'numeric',
                })}
                .
              </div>
            )} */}

            <StudentBasicInfo
              student={localStudent}
              hasConsentThisYear={hasConsentThisYear}
              onEdit={handleEditName}
              onTransfer={() => setIsTransferDialogOpen(true)}
              onResume={() => handleResume(localStudent)}
              onPause={() => handlePause(localStudent)}
            />
            <StudentDetailsGrid
              student={localStudent}
              currentGrade={currentGrade}
              isLoadingCurrentGrade={isLoadingCurrentGrade}
              formatDate={formatDate}
              getAge={getAge}
              speechEAs={speechEAs}
              onAssignEA={handleAssignEA}
            />
            <StudentNotes studentId={localStudent.id} formatDate={formatDate} />

            {/* <TransferHistorySection studentId={localStudent.id} /> */}
          </div>
        </div>

        <EditStudentDialog
          open={isEditingName}
          firstName={editedFirstName}
          lastName={editedLastName}
          gradeLevel={editedGradeLevel}
          onFirstNameChange={setEditedFirstName}
          onLastNameChange={setEditedLastName}
          onGradeLevelChange={setEditedGradeLevel}
          onSave={handleSaveName}
          onCancel={handleCancelEditName}
        />

        <TransferStudentDialog
          student={localStudent}
          open={isTransferDialogOpen}
          onOpenChange={setIsTransferDialogOpen}
          onSuccess={() => navigate('/students')}
        />

        <PauseConfirmDialog
          open={!!pauseConfirmStudent}
          studentName={pauseStudentName}
          reason={pauseReason}
          onReasonChange={setPauseReason}
          onConfirm={handleConfirmPause}
          onCancel={handleCancelPause}
          isSaving={isSavingPause}
        />
      </CardContent>
    </Card>
  )
}

export default StudentInfoHeader
