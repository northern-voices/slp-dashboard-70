import { useParams, useNavigate, useLocation } from 'react-router-dom'
import { useRedirectOnSchoolChange } from '@/hooks/use-redirect-on-school-change'
import ErrorMessage from '@/components/common/ErrorMessage'
import StudentInfoHeader from '@/components/students/StudentInfoHeader'
import StudentScreeningHistory from '@/components/students/StudentScreeningHistory'
import StudentDetailPagination from '@/components/students/StudentDetailPagination'
import { useOrganization } from '@/contexts/OrganizationContext'
import { useToast } from '@/hooks/use-toast'
import { useStudentsBySchool } from '@/hooks/students/use-students'
import StudentPageMonthlyMeetingsTable from '@/components/monthly-meetings/StudentPageMonthlyMeetingsTable'
import ConsentFormsSection from '@/components/students/ConsentFormsSection'
import StudentProfileSkeleton from '@/components/skeletons/StudentProfileSkeleton'

const StudentProfileContent = () => {
  const { studentId, schoolId } = useParams<{ studentId: string; schoolId: string }>()
  const navigate = useNavigate()
  const location = useLocation()
  const { userProfile, currentSchool } = useOrganization()
  const { toast } = useToast()

  useRedirectOnSchoolChange('/students')

  // Check if we came from screenings
  const fromScreenings = location.state?.from === 'screenings'
  const fromHearingScreenings = location.state?.from === 'hearing-screenings'

  // Determine which school to fetch students from
  const targetSchoolId = schoolId || currentSchool?.id

  const {
    data: allStudents = [],
    isLoading: loading,
    error: queryError,
  } = useStudentsBySchool(targetSchoolId)

  const currentStudentIndex = allStudents.findIndex(s => s.id === studentId)
  const student = currentStudentIndex >= 0 ? allStudents[currentStudentIndex] : null

  // Handle errors
  const error = queryError
    ? 'Failed to load students.'
    : !targetSchoolId
      ? 'No school context available.'
      : !studentId
        ? 'Student ID is required.'
        : currentStudentIndex === -1 && allStudents.length > 0
          ? 'Student not found in this school.'
          : null

  const handleNavigatePrevious = () => {
    if (currentStudentIndex > 0) {
      const previousStudent = allStudents[currentStudentIndex - 1]
      if (schoolId) {
        navigate(`/school/${schoolId}/students/${previousStudent.id}`)
      } else {
        navigate(`/students/${previousStudent.id}`)
      }
    }
  }

  const handleNavigateNext = () => {
    if (currentStudentIndex < allStudents.length - 1) {
      const nextStudent = allStudents[currentStudentIndex + 1]
      if (schoolId) {
        navigate(`/school/${schoolId}/students/${nextStudent.id}`)
      } else {
        navigate(`/students/${nextStudent.id}`)
      }
    }
  }

  const handleNavigateBack = () => {
    // If user came from hearing screenings, go back to hearing screenings
    if (fromHearingScreenings) {
      if (schoolId) {
        navigate(`/school/${schoolId}/screenings/hearing`)
      } else {
        navigate('/screenings/hearing')
      }
    } else if (fromScreenings) {
      // If user came from speech screenings, go back to screenings
      if (schoolId) {
        navigate(`/school/${schoolId}/screenings`)
      } else {
        navigate('/screenings')
      }
    } else {
      navigate(-1)
    }
  }

  const handleAddHearingScreening = () => {
    if (schoolId) {
      navigate(`/school/${schoolId}/screening/hearing/${studentId}`)
    } else {
      navigate(`/screening/hearing/${studentId}`)
    }
  }

  const handleAddSpeechScreening = () => {
    if (schoolId) {
      navigate(`/school/${schoolId}/screening/speech/${studentId}`)
    } else {
      navigate(`/screening/speech/${studentId}`)
    }
  }

  if (loading) return <StudentProfileSkeleton />
  if (error) return <ErrorMessage message={error} />
  if (!student) return <div className='p-8 text-center'>Student not found</div>

  const userName = userProfile
    ? `${userProfile.first_name} ${userProfile.last_name}`
    : 'Dr. Sarah Johnson'
  const userRole = userProfile?.role || 'slp'

  const hasPrevious = currentStudentIndex > 0
  const hasNext = currentStudentIndex < allStudents.length - 1

  return (
    <main className='flex-1 p-4 md:p-6 lg:p-8 pb-8'>
      <StudentDetailPagination
        currentStudent={`${student.first_name} ${student.last_name}`}
        currentIndex={currentStudentIndex}
        totalStudents={allStudents.length}
        onNavigateBack={handleNavigateBack}
        onNavigatePrevious={handleNavigatePrevious}
        onNavigateNext={handleNavigateNext}
        hasPrevious={hasPrevious}
        hasNext={hasNext}
      />

      <div className='space-y-6'>
        <StudentInfoHeader student={student} isLoading={loading} />
        <StudentScreeningHistory
          studentId={studentId}
          student={student}
          onAddHearingScreening={handleAddHearingScreening}
          onAddSpeechScreening={handleAddSpeechScreening}
        />
        <StudentPageMonthlyMeetingsTable studentId={studentId} />
        <ConsentFormsSection student={student} />
      </div>
    </main>
  )
}

const StudentProfile = () => {
  return <StudentProfileContent />
}

export default StudentProfile
