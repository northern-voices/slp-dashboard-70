import React from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ScreeningFormData } from '@/types/screening'
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar'
import { Breadcrumb } from '@/components/ui/breadcrumb'
import { Button } from '@/components/ui/button'
import { ChevronLeft, FileText } from 'lucide-react'
import AppSidebar from '@/components/AppSidebar'
import Header from '@/components/Header'
import MultiStepHearingScreeningForm from '@/components/screening/hearing/MultiStepHearingScreeningForm'
import { useOrganization } from '@/contexts/OrganizationContext'
import { useToast } from '@/hooks/use-toast'
import LoadingSpinner from '@/components/common/LoadingSpinner'
import { useStudent } from '@/hooks/students/use-students'
import { useCreateHearingScreening } from '@/hooks/screenings/use-screening-hearing-mutations'
import { useAuth } from '@/contexts/AuthContext'
import { schoolGradesApi } from '@/api/schoolGrades'
import { UserRole } from '@/types/database'
import { useRedirectOnSchoolChange } from '@/hooks/use-redirect-on-school-change'

const HearingScreeningContent = () => {
  const { studentId } = useParams<{
    studentId: string
  }>()
  const navigate = useNavigate()
  const { toast } = useToast()
  const { userProfile, currentSchool } = useOrganization()
  const { user } = useAuth()

  useRedirectOnSchoolChange('/screenings/hearing')

  // Use React Query hook to fetch student
  const { data: student = null, isLoading: loading } = useStudent(studentId)

  // Mutation hook for creating hearing screening
  const createHearingScreening = useCreateHearingScreening()

  const handleSubmit = async (screeningData: ScreeningFormData) => {
    // Validate required data
    // If a result is selected (absent, non_compliant, etc.), we don't need tympanometry data
    const hasResult = screeningData.result && screeningData.result !== ''

    if (!screeningData.student_id || !user?.id) {
      toast({
        title: 'Error',
        description: 'Missing required screening data',
        variant: 'destructive',
      })
      return
    }

    // Only require tympanometry data if no result is selected
    if (!hasResult && !screeningData.hearing_data?.tympanometry_results) {
      toast({
        title: 'Error',
        description: 'Please either select a screening result or enter tympanometry data',
        variant: 'destructive',
      })
      return
    }

    // Validate that grade was selected
    if (!screeningData.selected_grade) {
      toast({
        title: 'Error',
        description: 'Please select a grade level',
        variant: 'destructive',
      })
      return
    }

    // Validate grade availability and get/create grade_id (same pattern as speech screening)
    let gradeId = ''

    if (screeningData.selected_grade && currentSchool) {
      try {
        const currentYear = new Date().getFullYear()
        const academicYear = `${currentYear}-${currentYear + 1}`

        const gradeAvailability = await schoolGradesApi.checkGradeAvailability(
          currentSchool.id,
          screeningData.selected_grade,
          academicYear
        )

        if (!gradeAvailability.exists) {
          // Create new school grade since it doesn't exist
          try {
            const newGrade = await schoolGradesApi.createSchoolGrade({
              school_id: currentSchool.id,
              grade_level: screeningData.selected_grade,
              academic_year: academicYear,
            })
            gradeId = newGrade.id
          } catch (createError) {
            console.error('Failed to create new grade:', createError)
            toast({
              title: 'Error',
              description: 'Failed to create grade record. Please try again.',
              variant: 'destructive',
            })
            return
          }
        } else {
          // Use existing grade
          if (gradeAvailability.grade?.id) {
            gradeId = gradeAvailability.grade.id
          } else {
            toast({
              title: 'Error',
              description: 'Grade record exists but ID is missing',
              variant: 'destructive',
            })
            return
          }
        }
      } catch (error) {
        console.error('Grade validation error:', error)
        toast({
          title: 'Error',
          description: 'Failed to validate grade. Please try again.',
          variant: 'destructive',
        })
        return
      }
    } else {
      toast({
        title: 'Error',
        description: 'School information is missing',
        variant: 'destructive',
      })
      return
    }

    // Transform form data to API format
    let tympData = null

    // Only process tympanometry data if it exists
    if (screeningData.hearing_data?.tympanometry_results) {
      tympData =
        typeof screeningData.hearing_data.tympanometry_results === 'string'
          ? null
          : screeningData.hearing_data.tympanometry_results
    }

    const apiData = {
      student_id: screeningData.student_id,
      screener_id: user.id,
      grade_id: gradeId,
      // Use tympanometry data if available, otherwise use null
      right_volume_db: tympData?.right_ear.vol ?? null,
      right_compliance: tympData?.right_ear.comp ?? null,
      right_pressure: tympData?.right_ear.press ?? null,
      left_volume_db: tympData?.left_ear.vol ?? null,
      left_compliance: tympData?.left_ear.comp ?? null,
      left_pressure: tympData?.left_ear.press ?? null,
      clinical_notes: screeningData.clinical_notes || null,
      referral_notes: screeningData.referral_notes || null,
      result: screeningData.result || null,
    }

    try {
      await createHearingScreening.mutateAsync(apiData)

      toast({
        title: 'Hearing Screening completed',
        description: 'Hearing screening has been recorded successfully.',
      })
    } catch (error) {
      console.error('Error creating hearing screening:', error)
      toast({
        title: 'Error',
        description: 'Failed to save hearing screening. Please try again.',
        variant: 'destructive',
      })
      throw error
    }
  }
  const handleCancel = () => {
    if (studentId) {
      navigate(`/students/${studentId}`)
    } else if (currentSchool) {
      navigate(`/school/${currentSchool.id}/screenings/hearing`)
    } else {
      navigate('/screenings/hearing')
    }
  }
  const handleViewDrafts = () => {
    navigate('/drafts')
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
  return (
    <div className='min-h-screen flex w-full bg-gray-25'>
      <SidebarProvider>
        <AppSidebar userRole={userRole as UserRole} userName={userName} />
        <SidebarInset>
          <Header userRole={userRole as UserRole} userName={userName} />
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
              </div>

              {/* Title and View Drafts Button */}
              <div className='flex items-start justify-between'>
                <div className='space-y-1'>
                  <h1 className='text-2xl font-semibold text-gray-900'>Hearing Screening</h1>
                  {student ? (
                    <p className='text-gray-600'>
                      Creating hearing screening for {student.first_name} {student.last_name}
                    </p>
                  ) : (
                    <p className='text-gray-600'>Creating new hearing screening</p>
                  )}
                </div>
                {/* // TODO: Fix drafts functionality */}
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
                <MultiStepHearingScreeningForm
                  onSubmit={handleSubmit}
                  onCancel={handleCancel}
                  existingStudent={student}
                  onNewScreening={() => {}}
                  onGoToDashboard={() => {
                    if (currentSchool) {
                      navigate(`/school/${currentSchool.id}/screenings/hearing`)
                    } else {
                      navigate('/screenings/hearing')
                    }
                  }}
                />
              </div>
            </div>
          </main>
        </SidebarInset>
      </SidebarProvider>
    </div>
  )
}
const HearingScreening = () => {
  return <HearingScreeningContent />
}
export default HearingScreening
