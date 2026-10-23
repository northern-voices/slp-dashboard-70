import { useNavigate } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import { useCurrentSchool } from '@/hooks/school/useCurrentSchool'
import { useDynamicGoalSheetsByStudent } from '@/hooks/goalSheets/use-dynamic-goal-sheets'
import DynamicGoalSheetsListContent from './DynamicGoalSheetsListContent'

interface StudentPageDynamicGoalSheetsTableProps {
  studentId?: string
}

const StudentPageDynamicGoalSheetsTable = ({
  studentId,
}: StudentPageDynamicGoalSheetsTableProps) => {
  const navigate = useNavigate()
  const { currentSchool } = useCurrentSchool()
  const { data: sheets = [], isLoading } = useDynamicGoalSheetsByStudent(studentId)

  const handleCreateNew = () => {
    const path = currentSchool
      ? `/school/${currentSchool.id}/speech-screening-reports/dynamic-goal-sheets/new?studentId=${studentId}`
      : `/speech-screening-reports/dynamic-goal-sheets/new?studentId=${studentId}`

    navigate(path)
  }

  return (
    <Card>
      <CardHeader>
        <div className='flex items-center justify-between'>
          <CardTitle className='text-2xl font-semibold'>Dynamic Goal Sheets</CardTitle>

          <Button size='sm' onClick={handleCreateNew}>
            <Plus className='w-4 h-4 mr-2' />
            New Goal Sheet
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <DynamicGoalSheetsListContent sheets={sheets} isLoading={isLoading} hideStudentColumn />
      </CardContent>
    </Card>
  )
}

export default StudentPageDynamicGoalSheetsTable
