import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useNavigate, useParams } from 'react-router-dom'
import DynamicGoalSheetBuilder from '@/components/features/goalSheets/DynamicGoalSheetBuilder'

const DynamicGoalSheet = () => {
  const navigate = useNavigate()
  const { sheetId } = useParams<{ sheetId: string }>()

  if (!sheetId) return null

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
        </div>

        <div className='w-full max-w-full'>
          <DynamicGoalSheetBuilder sheetId={sheetId} />
        </div>
      </div>
    </div>
  )
}

export default DynamicGoalSheet
