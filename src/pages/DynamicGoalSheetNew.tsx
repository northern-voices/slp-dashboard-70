import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useNavigate, useSearchParams } from 'react-router-dom'
import DynamicGoalSheetCreateForm from '@/components/features/goalSheets/DynamicGoalSheetCreateForm'

const DynamicGoalSheetNew = () => {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const lockedStudentId = searchParams.get('studentId') ?? undefined

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

          <div className='space-y-1 sm:space-y-2'>
            <h1 className='text-xl font-semibold text-gray-900 sm:text-2xl lg:text-3xl'>
              New Dynamic Goal Sheet
            </h1>
            <p className='text-sm text-gray-600 sm:text-base'>
              Create a free-form goal sheet for a student
            </p>
          </div>
        </div>

        <div className='w-full max-w-full'>
          <DynamicGoalSheetCreateForm lockedStudentId={lockedStudentId} />
        </div>
      </div>
    </div>
  )
}

export default DynamicGoalSheetNew
