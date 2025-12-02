import React from 'react'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useNavigate } from 'react-router-dom'

interface ReportDetailContentProps {
  reportId?: string
}

const ReportDetailContent = ({ reportId }: ReportDetailContentProps) => {
  const navigate = useNavigate()

  return (
    <div className='min-h-screen w-full overflow-hidden'>
      <div className='space-y-6 sm:space-y-8 pb-8'>
        {/* Back Button and Header */}
        <div className='flex flex-col gap-6 px-1 sm:px-0'>
          <div className='space-y-1 sm:space-y-2'>
            <h1 className='text-xl sm:text-2xl lg:text-3xl font-semibold text-gray-900'>
              Hearing Reports
            </h1>
            <p className='text-sm sm:text-base text-gray-600'>
              Generate hearing screening reports for specific students
            </p>
          </div>
        </div>

        {/* Main Content Area */}
        <div className='w-full max-w-full'>
          {/* Report content will go here */}
          <p className='text-gray-500'>Hearing reports functionality coming soon...</p>
        </div>
      </div>
    </div>
  )
}

export default ReportDetailContent
