import React, { useState } from 'react'
import { FileText, User, Ear } from 'lucide-react'
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

          {/* Generate Individual Reports Section */}
          <div className='space-y-4'>
            <h2 className='text-md sm:text-lg text-gray-700 font-semibold'>
              Generate Individual Reports
            </h2>
            <div className='grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6'>
              {/* Speech Reports Button */}
              <Card
                className='bg-white border border-gray-100 shadow-sm rounded-xl hover:shadow-md transition-shadow cursor-pointer'
                onClick={() => navigate('individual')}>
                <CardContent className='px-6 py-3'>
                  <div className='flex items-center gap-4'>
                    <div className='w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0'>
                      <User className='w-6 h-6 text-purple-600' />
                    </div>
                    <div className='flex-1'>
                      <h3 className='text-lg font-semibold text-gray-900 mb'>Speech Reports</h3>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Hearing Reports Button */}
              <Card
                className='bg-white border border-gray-100 shadow-sm rounded-xl hover:shadow-md transition-shadow cursor-pointer'
                onClick={() => navigate('hearing')}>
                <CardContent className='px-6 py-3'>
                  <div className='flex items-center gap-4'>
                    <div className='w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0'>
                      <Ear className='w-6 h-6 text-blue-600' />
                    </div>
                    <div className='flex-1'>
                      <h3 className='text-lg font-semibold text-gray-900 mb'>Hearing Reports</h3>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Generate School Wide Reports Section */}
          <div className='space-y-4'>
            <h2 className='text-md sm:text-lg text-gray-700 font-semibold'>
              Generate School Wide Reports
            </h2>
            <div className='grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6'>
              {/* School Wide Reports Button */}
              <Card
                className='bg-white border border-gray-100 shadow-sm rounded-xl hover:shadow-md transition-shadow cursor-pointer'
                onClick={() => navigate('school-wide')}>
                <CardContent className='px-6 py-3'>
                  <div className='flex items-center gap-4'>
                    <div className='w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0'>
                      <FileText className='w-6 h-6 text-green-600' />
                    </div>
                    <div className='flex-1'>
                      <h3 className='text-lg font-semibold text-gray-900'>School Wide Reports</h3>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>

        {/* Generated Reports Section */}
        {/* //TODO: Brainstorm with team what can be placed here instead */}
        {/* <div className='w-full max-w-full'>
          <GeneratedReportsList />
        </div> */}
      </div>
    </div>
  )
}

export default ReportsPageContent
