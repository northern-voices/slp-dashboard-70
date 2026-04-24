import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { parseDateSafely } from '@/utils/dateUtils'
import { Card, CardContent } from '@/components/ui/card'
import type { Student } from '@/types/database'
import LoadingSpinner from '@/components/common/LoadingSpinner'
import { useToast } from '@/hooks/use-toast'
import { studentsApi } from '@/api/students'
import { schoolGradesApi, type SchoolGrade } from '@/api/schoolGrades'
import { useQueryClient } from '@tanstack/react-query'
import TransferStudentDialog from './TransferStudentDialog'
import { useConsentForms } from '@/hooks/students/use-consent-forms'
import StudentBasicInfo from './StudentBasicInfo'
import StudentDetailsGrid from './StudentDetailsGrid'
import StudentNotes from './StudentNotes'
import EditStudentDialog from './EditStudentDialog'
import { useSchoolDetails } from '@/hooks/school/useSchoolDetails'
import { useOrganization } from '@/contexts/OrganizationContext'

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
  const [editedGradeId, setEditedGradeId] = useState('')
  const [availableGrades, setAvailableGrades] = useState<SchoolGrade[]>([])
  const [isLoadingGrades, setIsLoadingGrades] = useState(false)
  const [isTransferDialogOpen, setIsTransferDialogOpen] = useState(false)
  const [currentGrade, setCurrentGrade] = useState<SchoolGrade | null>(null)
  const [isLoadingCurrentGrade, setIsLoadingCurrentGrade] = useState(false)
  const { toast } = useToast()
  const queryClient = useQueryClient()

  const { data: consentForms = [] } = useConsentForms(localStudent?.id || '')

  const { currentSchool } = useOrganization()
  const { data: schoolDetails } = useSchoolDetails(currentSchool ?? null)
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

  const hasConsentThisYear = (() => {
    const now = new Date()
    const year = now.getFullYear()
    const month = now.getMonth()
    const academicYearStart = month < 7 ? year - 1 : year
    const start = new Date(`${academicYearStart}-08-01`)
    const end = new Date(`${academicYearStart + 1}-07-31`)

    return consentForms.some(form => {
      const date = new Date(form.consent_date)
      return date >= start && date <= end
    })
  })()

  const navigate = useNavigate()

  // Update local student when prop changes
  useEffect(() => {
    setLocalStudent(student || null)
  }, [student])

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
    setEditedGradeId(localStudent.current_grade_id || '')
    setIsEditingName(true)

    // Fetch available grades for the student's school in the background
    if (localStudent.school_id) {
      setIsLoadingGrades(true)
      schoolGradesApi
        .getSchoolGradesBySchool(localStudent.school_id)
        .then(grades => {
          setAvailableGrades(grades)
        })
        .catch(error => {
          console.error('Error fetching grades:', error)
          toast({
            title: 'Error',
            description: 'Failed to load available grades.',
            variant: 'destructive',
          })
        })
        .finally(() => {
          setIsLoadingGrades(false)
        })
    }
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
      await studentsApi.updateStudent(localStudent.id, {
        first_name: editedFirstName.trim(),
        last_name: editedLastName.trim(),
        current_grade_id: editedGradeId || undefined,
      })

      // Invalidate React Query cache to refetch student data
      queryClient.invalidateQueries({ queryKey: ['students'] })
      queryClient.invalidateQueries({ queryKey: ['students', localStudent.id] })

      // Update local student state immediately for instant UI feedback
      setLocalStudent({
        ...localStudent,
        first_name: editedFirstName.trim(),
        last_name: editedLastName.trim(),
        current_grade_id: editedGradeId || null,
      })

      // Update current grade display
      if (editedGradeId) {
        const selectedGrade = availableGrades.find(g => g.id === editedGradeId)
        setCurrentGrade(selectedGrade || null)
      } else {
        setCurrentGrade(null)
      }

      setIsEditingName(false)
      toast({
        title: 'Student updated',
        description: 'Student information has been successfully updated.',
      })

      // Trigger a refresh of the student data if onEdit is provided
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
    setEditedGradeId('')
    setAvailableGrades([])
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
            <StudentBasicInfo
              student={localStudent}
              hasConsentThisYear={hasConsentThisYear}
              onEdit={handleEditName}
              onTransfer={() => setIsTransferDialogOpen(true)}
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
          </div>
        </div>

        <EditStudentDialog
          open={isEditingName}
          onOpenChange={open => {
            if (!open) handleCancelEditName()
          }}
          firstName={editedFirstName}
          lastName={editedLastName}
          gradeId={editedGradeId}
          availableGrades={availableGrades}
          isLoadingGrades={isLoadingGrades}
          onFirstNameChange={setEditedFirstName}
          onLastNameChange={setEditedLastName}
          onGradeChange={setEditedGradeId}
          onSave={handleSaveName}
          onCancel={handleCancelEditName}
        />

        <TransferStudentDialog
          student={localStudent}
          open={isTransferDialogOpen}
          onOpenChange={setIsTransferDialogOpen}
          onSuccess={() => navigate('/students')}
        />
      </CardContent>
    </Card>
  )
}

export default StudentInfoHeader
