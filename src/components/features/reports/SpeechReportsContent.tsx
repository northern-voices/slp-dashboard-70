import React from 'react'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useNavigate } from 'react-router-dom'
import SpeechStudentReports from '@/components/reports/SpeechStudentReports'

const SpeechReportsContent = () => {
  const navigate = useNavigate()

  return (
    <div className='min-h-screen w-full overflow-hidden'>
      <div className='space-y-6 sm:space-y-8 pb-8'>
        {/* Back Button and Header */}
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
            <h1 className='text-xl sm:text-2xl lg:text-3xl font-semibold text-gray-900'>
              Speech Reports
            </h1>
            <p className='text-sm sm:text-base text-gray-600'>
              Generate screening reports for specific students
            </p>
          </div>
        </div>

        {/* Speech Student Reports Form */}
        <div className='w-full max-w-full'>
          <SpeechStudentReports />
        </div>
      </div>
    </div>
  )
}

export default SpeechReportsContent
