import { useState } from 'react'
import { Button } from '@/components/ui/button'
import StudentSearchSelector from '@/components/screening/StudentSearchSelector'
import { useOrganization } from '@/contexts/OrganizationContext'
import { useStudent } from '@/hooks/students/use-students'
import { useCreateDynamicGoalSheet } from '@/hooks/goalSheets/use-dynamic-goal-sheets-mutations'
import { useToast } from '@/hooks/use-toast'
import DynamicGoalSheetBuilder from './DynamicGoalSheetBuilder'
import DynamicGoalSheetPage from './DynamicGoalSheetPage'
import type { DynamicGoalSheetSession, Student } from '@/types/database'

interface DynamicGoalSheetCreateFormProps {
  lockedStudentId?: string
}

const PREVIEW_SESSIONS: DynamicGoalSheetSession[] = [1, 2, 3].map(session_number => ({
  id: `preview-${session_number}`,
  goal_sheet_id: 'preview',
  session_number,
  session_date: null,
  sound_rating: null,
  activities: null,
  progress_notes: null,
  additional_comments: null,
  created_at: '',
  updated_at: '',
}))

const DynamicGoalSheetCreateForm = ({ lockedStudentId }: DynamicGoalSheetCreateFormProps) => {
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null)
  const [goalText, setGoalText] = useState('')
  const [createdSheetId, setCreatedSheetId] = useState<string | null>(null)

  const { currentSchool } = useOrganization()
  const { toast } = useToast()

  const { data: lockedStudent, isLoading: isLoadingLockedStudent } = useStudent(lockedStudentId)
  const createGoalSheet = useCreateDynamicGoalSheet()

  const student = lockedStudentId ? lockedStudent : selectedStudent

  const handleSubmit = () => {
    if (!student || !currentSchool || !goalText.trim()) return

    createGoalSheet.mutate(
      {
        studentId: student.id,
        schoolId: currentSchool.id,
        goalText: goalText.trim(),
      },
      {
        onSuccess: newSheet => {
          setCreatedSheetId(newSheet.id)
        },
        onError: () => {
          toast({
            title: 'Error',
            description: 'Failed to create goal sheet. Please try again.',
            variant: 'destructive',
          })
        },
      }
    )
  }

  if (createdSheetId) {
    return <DynamicGoalSheetBuilder sheetId={createdSheetId} />
  }

  const studentName = student
    ? `${student.first_name} ${student.last_name}`
    : lockedStudentId && isLoadingLockedStudent
      ? 'Loading student...'
      : 'Select a student'

  return (
    <div className='space-y-6'>
      <div className='space-y-2'>
        <label className='text-xl font-medium text-gray-700'>Student</label>
        {lockedStudentId ? (
          <div className='p-3 border border-blue-200 rounded-lg bg-blue-50'>
            {isLoadingLockedStudent ? (
              <span className='text-sm text-blue-700'>Loading student...</span>
            ) : (
              <span className='font-medium text-blue-900'>
                {lockedStudent?.first_name} {lockedStudent?.last_name}
              </span>
            )}
          </div>
        ) : (
          <StudentSearchSelector
            selectedStudent={selectedStudent}
            onStudentSelect={setSelectedStudent}
            isStudentCreatable={false}
          />
        )}
      </div>

      <DynamicGoalSheetPage
        studentName={studentName}
        sessions={PREVIEW_SESSIONS}
        goalText={goalText}
        onGoalTextChange={setGoalText}
        onGoalTextBlur={() => {}}
      />

      <Button
        onClick={handleSubmit}
        disabled={!student || !goalText.trim() || createGoalSheet.isPending}>
        {createGoalSheet.isPending ? 'Creating...' : 'Create Goal Sheet'}
      </Button>
    </div>
  )
}

export default DynamicGoalSheetCreateForm
