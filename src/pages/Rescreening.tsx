import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ScreeningFormData } from '@/types/screening'
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar'
import { Breadcrumb } from '@/components/ui/breadcrumb'
import { Button } from '@/components/ui/button'
import { ChevronLeft } from 'lucide-react'
import AppSidebar from '@/components/AppSidebar'
import Header from '@/components/Header'
import MultiStepSpeechScreeningForm from '@/components/screening/speech/MultiStepSpeechScreeningForm'
import { useOrganization } from '@/contexts/OrganizationContext'
import { useToast } from '@/hooks/use-toast'
import LoadingSpinner from '@/components/common/LoadingSpinner'
import { useStudent } from '@/hooks/students/use-students'
import { UserRole, Student } from '@/types/database'
import { useRedirectOnSchoolChange } from '@/hooks/use-redirect-on-school-change'
import { useSpeechScreeningsByStudent } from '@/hooks/screenings/use-screenings'
import ScreeningDetailsModal from '@/components/students/screening-history/ScreeningDetailsModal'
import { Badge } from '@/components/ui/badge'
import { FileText, ClipboardList } from 'lucide-react'
import { format } from 'date-fns'
import { parseDateSafely } from '@/utils/dateUtils'

const RescreeningContent = () => {
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null)
  const [showDetailsModal, setShowDetailsModal] = useState(false)
  const { studentId } = useParams<{ studentId: string }>()
  const navigate = useNavigate()
  const { toast } = useToast()
  const { userProfile } = useOrganization()

  useRedirectOnSchoolChange('/screenings')

  const { data: student = null, isLoading: loading } = useStudent(studentId)

  const { data: studentScreenings = [] } = useSpeechScreeningsByStudent(
    selectedStudent?.id || student?.id
  )
  const latestScreening = studentScreenings[0] ?? null

  const handleSubmit = (screeningData: ScreeningFormData) => {
    toast({
      title: 'Rescreening completed',
      description: 'Rescreening has been recorded successfully.',
    })

    if (studentId) {
      navigate(`/students/${studentId}`)
    } else {
      navigate('/screenings')
    }
  }

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
      <div className='min-h-screen flex w-full bg-gray-25'>
        <SidebarProvider>
          <AppSidebar userRole={userRole as UserRole} userName={userName} />
          <SidebarInset>
            <Header userRole={userRole as UserRole} userName={userName} />
            <main className='flex-1 p-4 md:p-6 lg:p-8'>
              <div className='flex justify-center items-center h-64'>
                <LoadingSpinner size='lg' />
              </div>
            </main>
          </SidebarInset>
        </SidebarProvider>
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
            <Button
              variant='outline'
              size='sm'
              onClick={() => setShowDetailsModal(true)}
              className='text-amber-700 border-amber-300 hover:bg-amber-100 text-sm'>
              <FileText className='w-3 h-3 mr-1' />
              View Full Details
            </Button>
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
    <div className='min-h-screen flex w-full bg-gray-25'>
      <SidebarProvider>
        <AppSidebar userRole={userRole as UserRole} userName={userName} />

        <SidebarInset>
          <Header userRole={userRole as UserRole} userName={userName} />

          <main className='flex-1 p-4 md:p-6 lg:p-8'>
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

              <div className='flex items-start justify-between'>
                <div className='space-y-1'>
                  <h1 className='text-2xl font-semibold text-gray-900'>Rescreening</h1>
                  {student ? (
                    <p className='text-gray-600'>
                      Creating rescreening for {student.first_name} {student.last_name}
                    </p>
                  ) : (
                    <p className='text-gray-600'>Creating new rescreening</p>
                  )}
                </div>
              </div>
            </div>

            <div className='bg-white rounded-lg border border-gray-200 shadow-sm'>
              <div className='p-6'>
                <MultiStepSpeechScreeningForm
                  onSubmit={handleSubmit}
                  onCancel={handleCancel}
                  existingStudent={student}
                  onStudentSelect={setSelectedStudent}
                  afterStudentContent={renderLatestScreening()}
                  initialScreeningData={latestScreening}
                />
              </div>
            </div>
          </main>

          <ScreeningDetailsModal
            isOpen={showDetailsModal}
            onClose={() => setShowDetailsModal(false)}
            screening={latestScreening}
          />
        </SidebarInset>
      </SidebarProvider>
    </div>
  )
}

const Rescreening = () => {
  return (
    <div className='min-h-screen bg-gray-50'>
      <RescreeningContent />
    </div>
  )
}

export default Rescreening
