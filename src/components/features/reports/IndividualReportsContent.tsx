import React from 'react'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useNavigate } from 'react-router-dom'
import IndividualStudentReports from '@/components/reports/IndividualStudentReports'

const IndividualReportsContent = () => {
  const navigate = useNavigate()

  return (
    <div className='min-h-screen w-full overflow-hidden'>
      <div className='space-y-6 sm:space-y-8 pb-8'>
        {/* Back Button and Header */}
        <div className='flex flex-col gap-6 px-1 sm:px-0'>
          <Button
            variant='ghost'
            onClick={() => navigate('/speech-screening-reports')}
            className='w-fit px-0 text-gray-600 hover:text-gray-900'>
            <ArrowLeft className='w-4 h-4 mr-2' />
            Back to Reports
          </Button>

          <div className='space-y-1 sm:space-y-2'>
            <h1 className='text-xl sm:text-2xl lg:text-3xl font-semibold text-gray-900'>
              Individual Student Reports
            </h1>
            <p className='text-sm sm:text-base text-gray-600'>
              Generate reports and tools for specific students including progress checks, goal
              sheets, and assessment reports
            </p>
          </div>
        </div>

        {/* Individual Student Reports Form */}
        <div className='w-full max-w-full'>
          <IndividualStudentReports />
        </div>
      </div>
    </div>
  )
}

export default IndividualReportsContent
