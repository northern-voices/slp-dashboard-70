import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'
import ReportGenerationForm from '@/components/reports/ReportGenerationForm'

const SchoolWideReports = () => {
  const navigate = useNavigate()

  return (
    <div className='space-y-6'>
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
          School Wide Speech Reports
        </h1>
        <p className='text-sm sm:text-base text-gray-600'>
          Generate comprehensive school-wide speech reports for students
        </p>
      </div>
      <div className='w-full max-w-full'>
        <ReportGenerationForm />
      </div>
    </div>
  )
}

export default SchoolWideReports
