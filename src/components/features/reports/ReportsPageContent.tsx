import React, { useState } from 'react'
import { FileText, User } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { useNavigate } from 'react-router-dom'
import GeneratedReportsList from '@/components/reports/GeneratedReportsList'

const ReportsPageContent = () => {
  const navigate = useNavigate()

  return (
    <div className='min-h-screen w-full overflow-hidden'>
      <div className='space-y-6 sm:space-y-8 pb-8'>
        {/* Page Header */}
        <div className='flex flex-col gap-6 px-1 sm:px-0'>
          <h1 className='text-xl sm:text-2xl lg:text-3xl font-semibold text-gray-900'>Reports</h1>

          <h2 className='text-md sm:text-lg text-gray-700'>Generate Reports</h2>
          {/* Action Buttons */}
          <div className='grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6'>
            {/* Individual Student Reports Button */}
            <Card
              className='bg-white border border-gray-100 shadow-sm rounded-xl hover:shadow-md transition-shadow cursor-pointer'
              onClick={() => navigate('individual')}>
              <CardContent className='px-6 py-3'>
                <div className='flex items-center gap-4'>
                  <div className='w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0'>
                    <User className='w-6 h-6 text-purple-600' />
                  </div>
                  <div className='flex-1'>
                    <h3 className='text-lg font-semibold text-gray-900 mb'>
                      Individual Speech Reports
                    </h3>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Generate Class-Wide Report Button */}
            <Card
              className='bg-white border border-gray-100 shadow-sm rounded-xl hover:shadow-md transition-shadow cursor-pointer'
              onClick={() => navigate('class-wide')}>
              <CardContent className='px-6 py-3'>
                <div className='flex items-center gap-4'>
                  <div className='w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0'>
                    <FileText className='w-6 h-6 text-green-600' />
                  </div>
                  <div className='flex-1'>
                    <h3 className='text-lg font-semibold text-gray-900'>Class-Wide Report</h3>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Generated Reports Section */}
        <div className='w-full max-w-full'>
          <GeneratedReportsList />
        </div>
      </div>
    </div>
  )
}

export default ReportsPageContent
