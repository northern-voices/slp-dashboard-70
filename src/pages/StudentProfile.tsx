import { useParams, useNavigate, useLocation } from 'react-router-dom'
import { useRedirectOnSchoolChange } from '@/hooks/use-redirect-on-school-change'
import LoadingSpinner from '@/components/common/LoadingSpinner'
import ErrorMessage from '@/components/common/ErrorMessage'
import StudentInfoHeader from '@/components/students/StudentInfoHeader'
import StudentScreeningHistory from '@/components/students/StudentScreeningHistory'
import StudentDetailPagination from '@/components/students/StudentDetailPagination'
import { useOrganization } from '@/contexts/OrganizationContext'
import { useToast } from '@/hooks/use-toast'
import { useStudentsBySchool } from '@/hooks/students/use-students'
import { useDeleteStudent, useUpdateStudent } from '@/hooks/students/use-students-mutations'
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

  // Use mutation hooks
  const deleteStudentMutation = useDeleteStudent()
  const updateStudentMutation = useUpdateStudent()

  // Find current student in the list
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
      // Otherwise, go to students list
      if (schoolId) {
        navigate(`/school/${schoolId}/students`)
      } else {
        navigate('/students')
      }
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

  const handleDeleteStudent = () => {
    if (!student) return

    deleteStudentMutation.mutate(student.id, {
      onSuccess: () => {
        toast({
          title: 'Student deleted',
          description: 'The student has been successfully deleted.',
          variant: 'destructive',
        })
        navigate('/students')
      },
      onError: () => {
        toast({
          title: 'Error',
          description: 'Failed to delete student. Please try again.',
          variant: 'destructive',
        })
      },
    })
  }

  const handleMoveUpGrade = () => {
    if (!student) return

    const gradeMap: { [key: string]: string } = {
      'Pre-K': 'K',
      K: '1st',
      '1st': '2nd',
      '2nd': '3rd',
      '3rd': '4th',
      '4th': '5th',
      '5th': '6th',
      '6th': '7th',
      '7th': '8th',
      '8th': '9th',
      '9th': '10th',
      '10th': '11th',
      '11th': '12th',
    }

    const nextGrade = gradeMap[student.grade || '']
    if (!nextGrade) return

    updateStudentMutation.mutate(
      {
        id: student.id,
        studentData: {
          grade: nextGrade,
        },
      },
      {
        onSuccess: () => {
          toast({
            title: 'Grade updated',
            description: `${student.first_name} has been moved to ${nextGrade}.`,
          })
        },
        onError: () => {
          toast({
            title: 'Error',
            description: 'Failed to update student grade. Please try again.',
            variant: 'destructive',
          })
        },
      }
    )
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
        <StudentInfoHeader
          student={student}
          isLoading={loading}
          onDelete={handleDeleteStudent}
          onMoveUpGrade={handleMoveUpGrade}
        />
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
