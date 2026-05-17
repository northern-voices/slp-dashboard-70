import { FileText, User, Ear, Building2, Target } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { useNavigate } from 'react-router-dom'
import GeneratedReportsList from '@/components/reports/GeneratedReportsList'

const ReportsPageContent = () => {
  const navigate = useNavigate()

  return (
    <div className='w-full min-h-screen overflow-hidden'>
      <div className='pb-8 space-y-6 sm:space-y-8'>
        {/* Page Header */}
        <div className='flex flex-col gap-6 px-1 sm:px-0'>
          <h1 className='text-xl font-semibold text-gray-900 sm:text-2xl lg:text-3xl'>Reports</h1>
          {/* Speech Reports Section */}
          <div className='space-y-4'>
            <h2 className='font-semibold text-gray-700 text-md sm:text-lg'>Speech Reports</h2>
            <div className='grid grid-cols-1 gap-4 lg:grid-cols-2 lg:gap-6'>
              {/* Individual Speech Reports */}
              <Card
                className='transition-shadow bg-white border border-gray-100 shadow-sm cursor-pointer rounded-xl hover:shadow-md'
                onClick={() => navigate('speech')}>
                <CardContent className='px-6 py-3'>
                  <div className='flex items-center gap-4'>
                    <div className='flex items-center justify-center flex-shrink-0 w-12 h-12 bg-purple-100 rounded-lg'>
                      <User className='w-6 h-6 text-purple-600' />
                    </div>
                    <div className='flex-1'>
                      <h3 className='text-lg font-semibold text-gray-900'>
                        Individual Speech Reports
                      </h3>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* School Wide Speech Reports */}
              <Card
                className='transition-shadow bg-white border border-gray-100 shadow-sm cursor-pointer rounded-xl hover:shadow-md'
                onClick={() => navigate('school-wide-speech')}>
                <CardContent className='px-6 py-3'>
                  <div className='flex items-center gap-4'>
                    <div className='flex items-center justify-center flex-shrink-0 w-12 h-12 bg-green-100 rounded-lg'>
                      <FileText className='w-6 h-6 text-green-600' />
                    </div>
                    <div className='flex-1'>
                      <h3 className='text-lg font-semibold text-gray-900'>
                        School Wide Speech Reports
                      </h3>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Hearing Reports Section */}
          <div className='space-y-4'>
            <h2 className='font-semibold text-gray-700 text-md sm:text-lg'>Hearing Reports</h2>
            <div className='grid grid-cols-1 gap-4 lg:grid-cols-2 lg:gap-6'>
              {/* Individual Hearing Reports */}
              <Card
                className='transition-shadow bg-white border border-gray-100 shadow-sm cursor-pointer rounded-xl hover:shadow-md'
                onClick={() => navigate('hearing')}>
                <CardContent className='px-6 py-3'>
                  <div className='flex items-center gap-4'>
                    <div className='flex items-center justify-center flex-shrink-0 w-12 h-12 bg-blue-100 rounded-lg'>
                      <Ear className='w-6 h-6 text-blue-600' />
                    </div>
                    <div className='flex-1'>
                      <h3 className='text-lg font-semibold text-gray-900'>
                        Individual Hearing Reports
                      </h3>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* School Wide Hearing Reports */}
              <Card
                className='transition-shadow bg-white border border-gray-100 shadow-sm cursor-pointer rounded-xl hover:shadow-md'
                onClick={() => navigate('school-wide-hearing')}>
                <CardContent className='px-6 py-3'>
                  <div className='flex items-center gap-4'>
                    <div className='flex items-center justify-center flex-shrink-0 w-12 h-12 bg-teal-100 rounded-lg'>
                      <Building2 className='w-6 h-6 text-teal-600' />
                    </div>
                    <div className='flex-1'>
                      <h3 className='text-lg font-semibold text-gray-900'>
                        School Wide Hearing Reports
                      </h3>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
          {/* Generated Reports Section */}
          {/* //TODO: Brainstorm with team what can be placed here instead
          <div className='w-full max-w-full'>
            <GeneratedReportsList />
          </div> */}
        </div>
      </div>
    </div>
  )
}

export default ReportsPageContent
