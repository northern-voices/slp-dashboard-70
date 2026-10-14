import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import StudentSearchSelector from '@/components/screening/StudentSearchSelector'
import { useOrganization } from '@/contexts/OrganizationContext'
import { useStudent } from '@/hooks/students/use-students'
import { useCreateDynamicGoalSheet } from '@/hooks/goalSheets/use-dynamic-goal-sheets-mutations'
import { useToast } from '@/hooks/use-toast'
import type { Student } from '@/types/database'

interface DynamicGoalSheetCreateFormProps {
  lockedStudentId?: string
}

const DynamicGoalSheetCreateForm = ({ lockedStudentId }: DynamicGoalSheetCreateFormProps) => {
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null)
  const [goalText, setGoalText] = useState('')

  const navigate = useNavigate()
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
          const path = currentSchool
            ? `/school/${currentSchool.id}/speech-screening-reports/dynamic-goal-sheets/${newSheet.id}`
            : `/speech-screening-reports/dynamic-goal-sheets/${newSheet.id}`

          navigate(path)
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

  return (
    <div className='space-y-4'>
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

      <div className='space-y-2'>
        <label className='text-xl font-medium text-gray-700'>Goal</label>
        <Textarea
          value={goalText}
          onChange={e => setGoalText(e.target.value)}
          placeholder='Describe the goal for this student...'
          rows={4}
        />

        <Button
          onClick={handleSubmit}
          disabled={!student || !goalText.trim() || createGoalSheet.isPending}>
          {createGoalSheet.isPending ? 'Creating...' : 'Create Goal Sheet'}
        </Button>
      </div>
    </div>
  )
}

export default DynamicGoalSheetCreateForm
