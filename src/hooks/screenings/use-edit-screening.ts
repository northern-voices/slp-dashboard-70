import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { useOrganization } from '@/contexts/OrganizationContext'
import { useToast } from '@/hooks/use-toast'
import { useUpdateSpeechScreening } from '@/hooks/screenings/use-screening-mutations'
import { useUpdateStudent } from '@/hooks/students/use-students-mutations'
import { useRedirectOnSchoolChange } from '@/hooks/use-redirect-on-school-change'
import { useQueryClient } from '@tanstack/react-query'
import { screeningsApi } from '@/api/screenings'
import { schoolGradesApi, type SchoolGrade } from '@/api/schoolGrades'
import { studentsApi } from '@/api/students'
import { speechScreeningsApi } from '@/api/speechscreenings'
import { SpeechScreeningFormValues } from '@/types/screening-form'
import { Screening, ProgramStatus, ServiceStatus } from '@/types/database'
import { format } from 'date-fns'

export const useEditScreening = () => {
  const { screeningId } = useParams<{ screeningId: string }>()
  const navigate = useNavigate()
  const { toast } = useToast()
  const { userProfile, currentSchool } = useOrganization()

  const [screening, setScreening] = useState<Screening | null>(null)
  const [screeningGrade, setScreeningGrade] = useState<string>('N/A')
  const [studentCurrentGrade, setStudentCurrentGrade] = useState<string | null>(null)
  const [gradesMatch, setGradesMatch] = useState<boolean>(true)
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [studentData, setStudentData] = useState(null)
  const [isEditingStudent, setIsEditingStudent] = useState(false)
  const [editedFirstName, setEditedFirstName] = useState('')
  const [editedLastName, setEditedLastName] = useState('')
  const [editedGradeId, setEditedGradeId] = useState<string>('')
  const [availableGrades, setAvailableGrades] = useState<SchoolGrade[]>([])
  const [isLoadingGrades, setIsLoadingGrades] = useState(false)
  const [clinicalNotesOpen, setClinicalNotesOpen] = useState(false)
  const [referralNotesOpen, setReferralNotesOpen] = useState(false)
  const [progressNotesOpen, setProgressNotesOpen] = useState(false)

  const updateSpeechScreening = useUpdateSpeechScreening()
  const updateStudent = useUpdateStudent()
  const queryClient = useQueryClient()

  useRedirectOnSchoolChange('/screenings')

  const form = useForm<SpeechScreeningFormValues>({
    mode: 'onChange',
    defaultValues: {
      screening_type: '',
      screening_date: '',
      clinical_notes: '',
      referral_notes: '',
      progress_notes: '',
      result: '',
      vocabulary_support: false,
      speech_screen_result: '',
      vocabulary_support_recommended: false,
      qualifies_for_speech_program: false,
      sub: false,
      graduated: false,
      paused: false,
      general_articulation_notes: '',
      error_patterns: {
        attendance: {
          absent: false,
          absence_notes: '',
          priority_re_screen: false,
        },
        articulation: {
          soundErrors: [],
          articulationNotes: '',
        },
        screening_metadata: {
          screening_date: '',
          qualifies_for_speech_program: false,
          vocabulary_support_recommended: false,
          sub: false,
          graduated: false,
          paused: false,
        },
        add_areas_of_concern: {
          voice: null,
          fluency: null,
          literacy: null,
          suspected_cas: null,
          cleft_lip_palate: null,
          reluctant_speaking: null,
          language_expression: null,
          language_comprehension: null,
          known_pending_diagnoses: null,
          pragmatics_social_communication: null,
        },
        additional_observations: '',
      },
    },
  })

  useEffect(() => {
    if (!screeningId) return

    const fetchScreening = async () => {
      setLoading(true)
      try {
        const screeningData = await screeningsApi.getSpeechScreeningById(
          screeningId,
          userProfile?.organization_id
        )

        if (!screeningData) throw new Error('Screening not found')

        setScreening(screeningData)

        let student = null
        if (screeningData.student_id) {
          try {
            student = await studentsApi.getStudent(screeningData.student_id)
            setStudentData(student)
          } catch (error) {
            console.error('Error fetching student:', error)
          }
        }

        if (currentSchool?.id) {
          try {
            const grades = await schoolGradesApi.getSchoolGradesBySchool(currentSchool.id)

            if (screeningData.grade_id) {
              const screeningGradeObj = grades.find(g => g.id === screeningData.grade_id)
              if (screeningGradeObj) setScreeningGrade(screeningGradeObj.grade_level)
            }

            if (student?.current_grade_id) {
              const studentGradeObj = grades.find(g => g.id === student.current_grade_id)
              if (studentGradeObj) {
                setStudentCurrentGrade(studentGradeObj.grade_level)
                if (student.current_grade_id !== screeningData.grade_id) setGradesMatch(false)
              }
            }
          } catch (error) {
            console.error('Error fetching grades:', error)
          }
        }

        const defaultErrorPatterns = {
          attendance: { absent: false, absence_notes: '', priority_re_screen: false },
          articulation: { soundErrors: [], articulationNotes: '' },
          screening_metadata: {
            screening_date: '',
            qualifies_for_speech_program: false,
            vocabulary_support_recommended: false,
            sub: false,
            graduated: false,
          },
          add_areas_of_concern: {
            voice: null,
            fluency: null,
            literacy: null,
            suspected_cas: null,
            cleft_lip_palate: null,
            reluctant_speaking: null,
            language_expression: null,
            language_comprehension: null,
            known_pending_diagnoses: null,
            pragmatics_social_communication: null,
          },
          additional_observations: '',
        }

        const mergedErrorPatterns = {
          attendance: {
            ...defaultErrorPatterns.attendance,
            ...(screeningData.error_patterns?.attendance || {}),
          },
          articulation: {
            ...defaultErrorPatterns.articulation,
            ...(screeningData.error_patterns?.articulation || {}),
          },
          screening_metadata: {
            ...defaultErrorPatterns.screening_metadata,
            ...(screeningData.error_patterns?.screening_metadata || {}),
          },
          add_areas_of_concern: {
            ...defaultErrorPatterns.add_areas_of_concern,
            ...(screeningData.error_patterns?.add_areas_of_concern
              ? Object.fromEntries(
                  Object.entries(screeningData.error_patterns.add_areas_of_concern).filter(
                    ([_, value]) => value !== null
                  )
                )
              : {}),
          },
          additional_observations:
            screeningData.error_patterns?.additional_observations ||
            defaultErrorPatterns.additional_observations,
        }

        form.reset({
          screening_type: screeningData.screening_type || '',
          screening_date: screeningData.created_at
            ? format(new Date(screeningData.created_at), 'yyyy-MM-dd')
            : '',
          clinical_notes: screeningData.clinical_notes || '',
          referral_notes: screeningData.referral_notes || '',
          progress_notes: screeningData.progress_notes || '',
          result: screeningData.result || '',
          vocabulary_support: screeningData.vocabulary_support || false,
          speech_screen_result: screeningData.result || '',
          vocabulary_support_recommended:
            screeningData.error_patterns?.screening_metadata?.vocabulary_support_recommended ||
            false,
          qualifies_for_speech_program:
            screeningData.error_patterns?.screening_metadata?.qualifies_for_speech_program || false,
          sub: screeningData.error_patterns?.screening_metadata?.sub || false,
          graduated: screeningData.error_patterns?.screening_metadata?.graduated || false,
          paused: screeningData.error_patterns?.screening_metadata?.paused || false,
          general_articulation_notes:
            screeningData.error_patterns?.articulation?.articulationNotes || '',
          error_patterns: mergedErrorPatterns,
        })
      } catch (error) {
        console.error('Failed to fetch screening:', error)
        toast({
          title: 'Error',
          description: 'Failed to load screening data',
          variant: 'destructive',
        })
      } finally {
        setLoading(false)
      }
    }

    fetchScreening()
  }, [screeningId, currentSchool?.id, userProfile?.organization_id])

  const handleGoBack = () => navigate(-1)

  const handleSave = async () => {
    if (!screening) return
    setSaving(true)
    try {
      const formData = form.getValues()

      const updatedErrorPatterns = {
        ...formData.error_patterns,
        articulation: {
          ...formData.error_patterns.articulation,
          articulationNotes: formData.general_articulation_notes || '',
        },
        screening_metadata: {
          ...formData.error_patterns.screening_metadata,
          vocabulary_support_recommended: formData.vocabulary_support_recommended,
          qualifies_for_speech_program: formData.qualifies_for_speech_program,
          sub: formData.sub,
          graduated: formData.graduated,
          paused: formData.paused,
        },
      }

      let isLatestScreening = false
      if (studentData) {
        try {
          const studentScreenings = await speechScreeningsApi.getSpeechScreeningsByStudent(
            studentData.id
          )
          const mostRecentScreening = studentScreenings.sort(
            (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
          )[0]
          isLatestScreening = mostRecentScreening?.id === screening.id
        } catch (error) {
          console.error('Error checking if latest screening:', error)
        }
      }

      const determineProgramStatus = (): ProgramStatus => {
        if (formData.sub) return 'sub'
        if (formData.qualifies_for_speech_program) return 'qualified'
        if (formData.qualifies_for_speech_program === false) return 'not_in_program'
        return 'none'
      }

      const determineServiceStatus = (): ServiceStatus => {
        if (formData.graduated) return 'graduated'
        if (formData.paused) return 'paused'
        return 'none'
      }

      await updateSpeechScreening.mutateAsync({
        id: screening.id,
        data: {
          screening_type: formData.screening_type,
          clinical_notes: formData.clinical_notes,
          referral_notes: formData.referral_notes,
          progress_notes: formData.progress_notes,
          result: formData.speech_screen_result || formData.result,
          vocabulary_support: formData.vocabulary_support,
          error_patterns: updatedErrorPatterns,
        },
      })

      if (isLatestScreening && studentData) {
        try {
          await updateStudent.mutateAsync({
            id: studentData.id,
            studentData: {
              program_status: determineProgramStatus(),
              service_status: determineServiceStatus(),
            },
          })
        } catch (error) {
          console.error('Failed to update student program status:', error)
        }
      }

      queryClient.invalidateQueries({ queryKey: ['screenings'] })
      queryClient.invalidateQueries({ queryKey: ['speech-screenings'] })
      if (studentData?.id) {
        queryClient.invalidateQueries({ queryKey: ['screenings', 'by-student', studentData.id] })
        queryClient.invalidateQueries({
          queryKey: ['speech-screenings', 'by-student', studentData.id],
        })
      }

      toast({
        title: 'Success',
        description: isLatestScreening
          ? 'Screening updated successfully'
          : 'Screening updated successfully (historical record)',
      })

      handleGoBack()
    } catch (error) {
      console.error('Failed to update screening:', error)
      toast({ title: 'Error', description: 'Failed to update screening', variant: 'destructive' })
    } finally {
      setSaving(false)
    }
  }

  const handleEditStudent = () => {
    if (!studentData) {
      toast({
        title: 'Error',
        description: 'Student data not loaded yet. Please try again.',
        variant: 'destructive',
      })
      return
    }
    setEditedFirstName(studentData.first_name)
    setEditedLastName(studentData.last_name)
    setEditedGradeId(studentData.current_grade_id || '')
    setIsEditingStudent(true)

    if (currentSchool?.id) {
      setIsLoadingGrades(true)
      schoolGradesApi
        .getSchoolGradesBySchool(currentSchool.id)
        .then(grades => setAvailableGrades(grades))
        .catch(error => {
          console.error('Error fetching grades:', error)
          toast({
            title: 'Error',
            description: 'Failed to load available grades.',
            variant: 'destructive',
          })
        })
        .finally(() => setIsLoadingGrades(false))
    }
  }

  const handleSaveStudent = async () => {
    if (!studentData?.id || !editedFirstName.trim() || !editedLastName.trim()) {
      toast({
        title: 'Error',
        description: 'First name and last name are required.',
        variant: 'destructive',
      })
      return
    }

    try {
      await updateStudent.mutateAsync({
        id: studentData.id,
        studentData: {
          first_name: editedFirstName.trim(),
          last_name: editedLastName.trim(),
          current_grade_id: editedGradeId || undefined,
        },
      })

      const updatedStudent = {
        ...studentData,
        first_name: editedFirstName.trim(),
        last_name: editedLastName.trim(),
        current_grade_id: editedGradeId || null,
      }
      setStudentData(updatedStudent)

      if (screening) {
        setScreening({
          ...screening,
          student_name: `${editedFirstName.trim()} ${editedLastName.trim()}`,
        })
      }

      if (editedGradeId) {
        const selectedGrade = availableGrades.find(g => g.id === editedGradeId)
        if (selectedGrade) {
          setStudentCurrentGrade(selectedGrade.grade_level)
          setGradesMatch(screening?.grade_id === editedGradeId)
        }
      } else {
        setStudentCurrentGrade(null)
        setGradesMatch(screening?.grade_id ? false : true)
      }

      queryClient.invalidateQueries({ queryKey: ['students'] })
      queryClient.invalidateQueries({ queryKey: ['students', studentData.id] })
      queryClient.invalidateQueries({ queryKey: ['screenings'] })
      queryClient.invalidateQueries({ queryKey: ['speech-screenings'] })

      setIsEditingStudent(false)
      toast({
        title: 'Student updated',
        description: 'Student information has been successfully updated.',
      })
    } catch (error) {
      console.error('Error updating student:', error)
      toast({
        title: 'Error',
        description: 'Failed to update student information. Please try again.',
        variant: 'destructive',
      })
    }
  }

  const handleCancelEditStudent = () => {
    setIsEditingStudent(false)
    setEditedFirstName('')
    setEditedLastName('')
    setEditedGradeId('')
    setAvailableGrades([])
  }

  return {
    form,
    screening,
    screeningGrade,
    studentCurrentGrade,
    gradesMatch,
    loading,
    saving,
    studentData,
    isEditingStudent,
    editedFirstName,
    editedLastName,
    editedGradeId,
    availableGrades,
    isLoadingGrades,
    clinicalNotesOpen,
    referralNotesOpen,
    progressNotesOpen,
    setEditedFirstName,
    setEditedLastName,
    setEditedGradeId,
    setClinicalNotesOpen,
    setReferralNotesOpen,
    setProgressNotesOpen,
    handleGoBack,
    handleSave,
    handleEditStudent,
    handleSaveStudent,
    handleCancelEditStudent,
  }
}
