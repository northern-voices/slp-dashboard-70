import { useNavigate } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import { useCurrentSchool } from '@/hooks/school/useCurrentSchool'
import { useCustomizableGoalSheetsByStudent } from '@/hooks/goalSheets/use-customizable-goal-sheets'
import CustomizableGoalSheetsListContent from './CustomizableGoalSheetsListContent'

interface StudentPageCustomizableGoalSheetsTableProps {
  studentId?: string
}

const StudentPageCustomizableGoalSheetsTable = ({
  studentId,
}: StudentPageCustomizableGoalSheetsTableProps) => {
  const navigate = useNavigate()
  const { currentSchool } = useCurrentSchool()
  const { data: sheets = [], isLoading } = useCustomizableGoalSheetsByStudent(studentId)

  const handleCreateNew = () => {
    const path = currentSchool
      ? `/school/${currentSchool.id}/speech-screening-reports/customizable-goal-sheets/new?studentId=${studentId}`
      : `/speech-screening-reports/customizable-goal-sheets/new?studentId=${studentId}`

    navigate(path)
  }

  return (
    <Card>
      <CardHeader>
        <div className='flex items-center justify-between'>
          <CardTitle className='text-2xl font-semibold'>Customizable Goal Sheets</CardTitle>

          <Button size='sm' onClick={handleCreateNew}>
            <Plus className='w-4 h-4 mr-2' />
            New Goal Sheet
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <CustomizableGoalSheetsListContent sheets={sheets} isLoading={isLoading} hideStudentColumn />
      </CardContent>
    </Card>
  )
}

export default StudentPageCustomizableGoalSheetsTable
