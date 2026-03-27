import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ScreeningFormData } from '@/types/screening'
import { Breadcrumb } from '@/components/ui/breadcrumb'
import { Button } from '@/components/ui/button'
import { ChevronLeft, ClipboardList, Info, RefreshCw } from 'lucide-react'
import MultiStepSpeechScreeningForm from '@/components/screening/speech/MultiStepSpeechScreeningForm'
import { useOrganization } from '@/contexts/OrganizationContext'
import { useToast } from '@/hooks/use-toast'
import LoadingSpinner from '@/components/common/LoadingSpinner'
import { useStudent } from '@/hooks/students/use-students'
import { Student } from '@/types/database'
import { useRedirectOnSchoolChange } from '@/hooks/use-redirect-on-school-change'
import { useSpeechScreeningsByStudent } from '@/hooks/screenings/use-screenings'
import ScreeningDetailsModal from '@/components/students/screening-history/ScreeningDetailsModal'
import { Badge } from '@/components/ui/badge'
import { format } from 'date-fns'
import { parseDateSafely } from '@/utils/dateUtils'

const SpeechScreeningContent = () => {
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null)
  const [showDetailsModal, setShowDetailsModal] = useState(false)

  const { studentId } = useParams<{
    studentId: string
  }>()
  const navigate = useNavigate()
  const { toast } = useToast()
  const { userProfile } = useOrganization()

  useRedirectOnSchoolChange('/screenings')

  // Use React Query hook to fetch student
  const { data: student = null, isLoading: loading } = useStudent(studentId)
  const handleSubmit = (screeningData: ScreeningFormData) => {
    toast({
      title: 'Speech Screening completed',
      description: 'Speech screening has been recorded successfully.',
    })

    // Navigate back to appropriate page
    if (studentId) {
      navigate(`/students/${studentId}`)
    } else {
      navigate('/screenings')
    }
  }

  const { data: studentScreenings = [] } = useSpeechScreeningsByStudent(
    selectedStudent?.id || student?.id
  )
  const latestScreening = studentScreenings[0] ?? null

  const getCurrentAcademicYearStart = () => {
    const now = new Date()
    const month = now.getMonth()
    const year = now.getFullYear()
    return new Date(month < 7 ? year - 1 : year, 7, 1)
  }

  const getPreviousAcademicYearStart = () => {
    const now = new Date()
    const month = now.getMonth()
    const year = now.getFullYear()
    const currentYearStart = month < 7 ? year - 1 : year
    return new Date(currentYearStart - 1, 7, 1)
  }

  const isPreviousYearScreening = latestScreening
    ? new Date(latestScreening.created_at) >= getPreviousAcademicYearStart() &&
      new Date(latestScreening.created_at) < getCurrentAcademicYearStart()
    : false

  const handleCancel = () => {
    if (studentId) {
      navigate(`/students/${studentId}`)
    } else {
      navigate('/screenings')
    }
  }

  const userName = userProfile
    ? `${userProfile.first_name} ${userProfile.last_name}`
    : 'Dr. Sarah Johnson'

  const userRole = userProfile?.role || 'slp'

  if (loading) {
    return (
      <div className='flex justify-center items-center h-64'>
        <LoadingSpinner size='lg' />
      </div>
    )
  }

  const renderLatestScreening = () => {
    if (!selectedStudent && !student) return null
    const programStatus = selectedStudent?.program_status || student?.program_status

    return (
      <div className='mt-4 p-4 bg-amber-50 border border-amber-200 rounded-lg'>
        <div className='flex items-center justify-between mb-3'>
          <div className='flex items-center gap-2'>
            <ClipboardList className='w-4 h-4 text-amber-600' />
            <h2 className='text-sm font-semibold text-amber-800'>Latest Screening</h2>
          </div>
          {latestScreening && (
            <div className={`flex items-center gap-2`}>
              {isPreviousYearScreening ? (
                <div className='flex items-center gap-2 px-3 py-1.5 bg-green-50 border border-green-200 rounded-full'>
                  <RefreshCw className='w-3 h-3 text-green-600' />
                  <p className='text-xs font-medium text-green-700'>
                    Previous school year — will be treated as a rescreening
                  </p>
                </div>
              ) : (
                <div className='flex items-center gap-2 px-3 py-1.5 bg-blue-50 border border-blue-200 rounded-full'>
                  <Info className='w-3 h-3 text-blue-600' />
                  <p className='text-xs font-medium text-blue-700'>
                    Not from the previous school year — will be treated as a new screening
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {latestScreening ? (
          <div className='grid grid-cols-2 md:grid-cols-5 gap-3 text-sm'>
            <div>
              <p className='text-xs text-amber-600 font-medium'>Program Status</p>
              <Badge
                className={`text-xs mt-0.5 ${
                  programStatus === 'qualified'
                    ? 'bg-green-100 text-green-800'
                    : programStatus === 'sub'
                      ? 'bg-blue-100 text-blue-800'
                      : programStatus === 'no_consent'
                        ? 'bg-gray-100 text-gray-800'
                        : 'bg-amber-100 text-amber-800'
                }`}>
                {programStatus === 'no_consent'
                  ? 'No Consent'
                  : programStatus?.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()) || '-'}
              </Badge>
            </div>
            <div>
              <p className='text-xs text-amber-600 font-medium'>Date</p>
              <p className='text-amber-900'>
                {format(parseDateSafely(latestScreening.created_at), 'MMM d, yyyy')}
              </p>
            </div>
            <div>
              <p className='text-xs text-amber-600 font-medium'>Type</p>
              <p className='text-amber-900 capitalize'>{latestScreening.screening_type || '-'}</p>
            </div>
            <div>
              <p className='text-xs text-amber-600 font-medium'>Result</p>
              <Badge className='bg-amber-100 text-amber-800 text-xs mt-0.5'>
                {latestScreening.result
                  ?.replace(/_/g, ' ')
                  .replace(/\b\w/g, c => c.toUpperCase()) || '-'}
              </Badge>
            </div>
            <div>
              <p className='text-xs text-amber-600 font-medium'>Screener</p>
              <p className='text-amber-900'>{latestScreening.screener || '-'}</p>
            </div>
          </div>
        ) : (
          <p className='text-sm text-amber-700'>No previous screenings found for this student.</p>
        )}
      </div>
    )
  }

  return (
    <main className='flex-1 p-4 md:p-6 lg:p-8'>
      {/* Breadcrumb Navigation */}
      <div className='mb-6'>
        <div className='flex items-center gap-4 mb-4'>
          <Button
            variant='ghost'
            size='sm'
            onClick={handleCancel}
            className='text-gray-600 hover:text-gray-900 hover:bg-gray-100 px-2'>
            <ChevronLeft className='w-4 h-4 mr-1' />
            Back
          </Button>

          <Breadcrumb></Breadcrumb>
        </div>

        {/* Title and View Drafts Button */}
        <div className='flex items-start justify-between'>
          <div className='space-y-1'>
            <h1 className='text-2xl font-semibold text-gray-900'>Speech Screening</h1>
            {student ? (
              <p className='text-gray-600'>
                Creating speech screening for {student.first_name} {student.last_name}
              </p>
            ) : (
              <p className='text-gray-600'>Creating new speech screening</p>
            )}
          </div>

          {/* //TODO: Work on view drafts functionality */}
          {/* <Button
                  variant='outline'
                  size='sm'
                  onClick={handleViewDrafts}
                  className='flex items-center gap-2 text-gray-700 hover:text-gray-900 hover:bg-gray-50'>
                  <FileText className='w-4 h-4' />
                  View Drafts
                </Button> */}
        </div>
      </div>

      {/* Screening Form */}
      <div className='bg-white rounded-lg border border-gray-200 shadow-sm'>
        <div className='p-6'>
          <MultiStepSpeechScreeningForm
            onSubmit={handleSubmit}
            onCancel={handleCancel}
            existingStudent={student}
            onStudentSelect={setSelectedStudent}
            afterStudentContent={renderLatestScreening()}
            initialScreeningData={isPreviousYearScreening ? latestScreening : null}
          />
        </div>
      </div>

      <ScreeningDetailsModal
        isOpen={showDetailsModal}
        onClose={() => setShowDetailsModal(false)}
        screening={latestScreening}
      />
    </main>
  )
}

const SpeechScreening = () => <SpeechScreeningContent />

export default SpeechScreening
