import { ArrowLeft, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useNavigate } from 'react-router-dom'
import { useCurrentSchool } from '@/hooks/school/useCurrentSchool'
import { useCustomizableGoalSheetsBySchool } from '@/hooks/goalSheets/use-customizable-goal-sheets'
import CustomizableGoalSheetsListContent from '@/components/features/goalSheets/CustomizableGoalSheetsListContent'

const CustomizableGoalSheets = () => {
  const navigate = useNavigate()
  const { currentSchool } = useCurrentSchool()
  const { data: sheets = [], isLoading } = useCustomizableGoalSheetsBySchool(currentSchool?.id)

  const handleCreateNew = () => {
    const path = currentSchool
      ? `/school/${currentSchool.id}/speech-screening-reports/customizable-goal-sheets/new`
      : '/speech-screening-reports/customizable-goal-sheets/new'
    navigate(path)
  }

  return (
    <div className='w-full min-h-screen overflow-hidden'>
      <div className='pb-8 space-y-6 sm:space-y-8'>
        <div className='flex flex-col gap-6 px-1 sm:px-0'>
          <div className='flex items-center gap-4'>
            <Button
              variant='outline'
              size='sm'
              onClick={() => navigate(-1)}
              className='flex items-center gap-2'>
              <ArrowLeft className='w-4 h-4' />
              Back
            </Button>
          </div>

          <div className='flex items-center justify-between'>
            <div className='space-y-1 sm:space-y-2'>
              <h1 className='text-xl font-semibold text-gray-900 sm:text-2xl lg:text-3xl'>
                Customizable Goal Sheets
              </h1>
              <p className='text-sm text-gray-600 sm:text-base'>
                Browse and manage free-form goal sheets for your students
              </p>
            </div>

            <Button onClick={handleCreateNew}>
              <Plus className='w-4 h-4 mr-2' />
              New Goal Sheet
            </Button>
          </div>
        </div>

        <div className='w-full max-w-full'>
          <CustomizableGoalSheetsListContent sheets={sheets} isLoading={isLoading} />
        </div>
      </div>
    </div>
  )
}

export default CustomizableGoalSheets
