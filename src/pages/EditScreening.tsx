import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { Screening } from '@/types/database'
import { screeningsApi } from '@/api/screenings'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { useRedirectOnSchoolChange } from '@/hooks/use-redirect-on-school-change'
import { FileText, Calendar, Save, Edit } from 'lucide-react'
import { useOrganization } from '@/contexts/OrganizationContext'
import { useToast } from '@/hooks/use-toast'
import { useUpdateSpeechScreening } from '@/hooks/screenings/use-screening-mutations'
import { useUpdateStudent } from '@/hooks/students/use-students-mutations'
import LoadingSpinner from '@/components/common/LoadingSpinner'
import EnhancedSpeechScreeningFields from '@/components/screening/speech/EnhancedSpeechScreeningFields'
import { format } from 'date-fns'
import { schoolGradesApi, type SchoolGrade } from '@/api/schoolGrades'
import { studentsApi } from '@/api/students'
import { speechScreeningsApi } from '@/api/speechscreenings'
import { useQueryClient } from '@tanstack/react-query'

const EditScreeningContent = () => {
  const { screeningId } = useParams<{
    screeningId: string
  }>()
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
  const updateSpeechScreening = useUpdateSpeechScreening()
  const updateStudent = useUpdateStudent()
  const queryClient = useQueryClient()

  useRedirectOnSchoolChange('/screenings')

  const form = useForm<{
    screening_type: string
    screening_date: string
    clinical_notes: string
    referral_notes: string
    result: string
    vocabulary_support: boolean
    speech_screen_result: string
    vocabulary_support_recommended: boolean
    qualifies_for_speech_program: boolean
    sub: boolean
    graduated: boolean
    paused: boolean
    error_patterns: {
      attendance: {
        absent: boolean
        absence_notes: string
        priority_re_screen: boolean
      }
      articulation: {
        soundErrors: Array<{
          sound: string
          word: string
          errorPatterns: string[]
          stoppingSounds?: string[]
          notes: string
          otherNotes?: string
        }>
        articulationNotes: string
      }
      screening_metadata: {
        screening_date: string
        qualifies_for_speech_program: boolean
        vocabulary_support_recommended: boolean
        sub?: boolean
        graduated?: boolean
        paused?: boolean
      }
      add_areas_of_concern: Record<string, string | null>
      additional_observations: string
    }
    general_articulation_notes?: string
  }>({
    mode: 'onChange',
    defaultValues: {
      screening_type: '',
      screening_date: '',
      clinical_notes: '',
      referral_notes: '',
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
    if (screeningId) {
      const fetchScreening = async () => {
        setLoading(true)
        try {
          // Fetch the specific screening by ID, validating organization access
          const screeningData = await screeningsApi.getSpeechScreeningById(
            screeningId,
            userProfile?.organization_id
          )

          if (screeningData) {
            setScreening(screeningData)

            // Fetch student data first (needed for editing)
            let student = null
            if (screeningData.student_id) {
              try {
                student = await studentsApi.getStudent(screeningData.student_id)
                setStudentData(student) // Store student data for later use
              } catch (error) {
                console.error('Error fetching student:', error)
              }
            }

            // Fetch grades for the school
            if (currentSchool?.id) {
              try {
                const grades = await schoolGradesApi.getSchoolGradesBySchool(currentSchool.id)

                // Get the screening's grade from grade_id
                if (screeningData.grade_id) {
                  const screeningGradeObj = grades.find(g => g.id === screeningData.grade_id)
                  if (screeningGradeObj) {
                    setScreeningGrade(screeningGradeObj.grade_level)
                  }
                }

                // Fetch student's current grade to compare
                if (student?.current_grade_id) {
                  const studentGradeObj = grades.find(g => g.id === student.current_grade_id)
                  if (studentGradeObj) {
                    setStudentCurrentGrade(studentGradeObj.grade_level)

                    // Check if grades match
                    if (student.current_grade_id !== screeningData.grade_id) {
                      setGradesMatch(false)
                    }
                  }
                }
              } catch (error) {
                console.error('Error fetching grades:', error)
              }
            }
            // Create default error patterns structure
            const defaultErrorPatterns = {
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

            // Merge existing error patterns with defaults
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
                // Properly merge existing areas of concern, preserving non-null values
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

            // Populate form with existing data
            form.reset({
              screening_type: screeningData.screening_type || '',
              screening_date: screeningData.created_at
                ? format(new Date(screeningData.created_at), 'yyyy-MM-dd')
                : '',
              clinical_notes: screeningData.clinical_notes || '',
              referral_notes: screeningData.referral_notes || '',
              result: screeningData.result || '',
              vocabulary_support: screeningData.vocabulary_support || false,
              speech_screen_result: screeningData.result || '',
              vocabulary_support_recommended:
                screeningData.error_patterns?.screening_metadata?.vocabulary_support_recommended ||
                false,
              qualifies_for_speech_program:
                screeningData.error_patterns?.screening_metadata?.qualifies_for_speech_program ||
                false,
              sub: screeningData.error_patterns?.screening_metadata?.sub || false,
              graduated: screeningData.error_patterns?.screening_metadata?.graduated || false,
              paused: screeningData.error_patterns?.screening_metadata?.paused || false,
              general_articulation_notes:
                screeningData.error_patterns?.articulation?.articulationNotes || '',
              error_patterns: mergedErrorPatterns,
            })
          } else {
            throw new Error('Screening not found')
          }
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
    }
  }, [screeningId, toast, form, currentSchool?.id, userProfile?.organization_id])

  const handleGoBack = () => {
    navigate(-1)
  }

  const handleSave = async () => {
    if (!screening) return

    setSaving(true)
    try {
      const formData = form.getValues()

      // Update error_patterns with the latest form values
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

      // Check if this is the most recent screening for the student
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

      // Determine the program status from form data
      const determineProgramStatus = (): string => {
        if (formData.graduated) return 'graduated'
        if (formData.paused) return 'paused'
        if (formData.sub) return 'sub'
        if (formData.qualifies_for_speech_program) return 'qualified'
        if (formData.qualifies_for_speech_program === false) return 'not_in_program'
        return 'none'
      }

      await updateSpeechScreening.mutateAsync({
        id: screening.id,
        data: {
          screening_type: formData.screening_type,
          clinical_notes: formData.clinical_notes,
          referral_notes: formData.referral_notes,
          result: formData.speech_screen_result || formData.result,
          vocabulary_support: formData.vocabulary_support,
          error_patterns: updatedErrorPatterns,
        },
      })

      // Only update student's program_status if this is the latest screening
      if (isLatestScreening && studentData) {
        const programStatus = determineProgramStatus()
        try {
          await updateStudent.mutateAsync({
            id: studentData.id,
            studentData: { program_status: programStatus },
          })
        } catch (error) {
          console.error('Failed to update student program status:', error)
          // Don't fail the whole operation if student update fails
        }
      }

      // Invalidate React Query cache to refetch screenings
      // This will invalidate all screenings queries including useScreenings() and useScreeningsBySchool()
      queryClient.invalidateQueries({ queryKey: ['screenings'] })
      // Also invalidate speech screenings queries
      queryClient.invalidateQueries({ queryKey: ['speech-screenings'] })
      // Invalidate student-specific screenings if we have student data
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
        variant: 'default',
      })

      handleGoBack()
    } catch (error) {
      console.error('Failed to update screening:', error)
      toast({
        title: 'Error',
        description: 'Failed to update screening',
        variant: 'destructive',
      })
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

    // Fetch available grades for the student's school
    if (currentSchool?.id) {
      setIsLoadingGrades(true)
      schoolGradesApi
        .getSchoolGradesBySchool(currentSchool.id)
        .then(grades => {
          setAvailableGrades(grades)
        })
        .catch(error => {
          console.error('Error fetching grades:', error)
          toast({
            title: 'Error',
            description: 'Failed to load available grades.',
            variant: 'destructive',
          })
        })
        .finally(() => {
          setIsLoadingGrades(false)
        })
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

      // Update local student data
      const updatedStudent = {
        ...studentData,
        first_name: editedFirstName.trim(),
        last_name: editedLastName.trim(),
        current_grade_id: editedGradeId || null,
      }
      setStudentData(updatedStudent)

      // Update screening state to reflect new student name
      if (screening) {
        setScreening({
          ...screening,
          student_name: `${editedFirstName.trim()} ${editedLastName.trim()}`,
        })
      }

      // Update student current grade display
      if (editedGradeId) {
        const selectedGrade = availableGrades.find(g => g.id === editedGradeId)
        if (selectedGrade) {
          setStudentCurrentGrade(selectedGrade.grade_level)
          // Check if grades match
          if (screening?.grade_id !== editedGradeId) {
            setGradesMatch(false)
          } else {
            setGradesMatch(true)
          }
        }
      } else {
        setStudentCurrentGrade(null)
        setGradesMatch(screening?.grade_id ? false : true)
      }

      // Invalidate React Query cache
      queryClient.invalidateQueries({ queryKey: ['students'] })
      queryClient.invalidateQueries({ queryKey: ['students', studentData.id] })
      // Also invalidate screenings since student name/grade changed
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

  if (loading) {
    return <LoadingSpinner />
  }

  if (!screening) {
    return (
      <div className='flex items-center justify-center h-screen'>
        <div className='text-center'>
          <h2 className='text-2xl font-semibold text-gray-900'>Screening not found</h2>
          <p className='text-gray-600 mt-2'>The screening you're looking for doesn't exist.</p>
          <Button onClick={handleGoBack} className='mt-4'>
            Go Back
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className='flex-1 p-4 md:p-6 lg:p-8'>
      {/* <div className='flex items-center gap-4'>
            <Button variant='ghost' size='sm' onClick={handleGoBack} className='gap-2'>
              <ChevronLeft className='w-4 h-4' />
              Back
            </Button>
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbLink href='/students'>Students</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbLink href={`/students/${screening.student_id}`}>
                    {screening.student_name}
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbPage>Edit Screening</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div> */}

      <div className='flex items-center gap-3 mb-6'>
        <FileText className='w-6 h-6' />
        <div>
          <h1 className='text-2xl font-semibold'>Edit Screening</h1>
          <p className='text-gray-600'>
            Editing {screening.screening_type} screening for {screening.student_name}
          </p>
        </div>
      </div>

      <div className='space-y-6'>
        <Card>
          <CardHeader>
            <CardTitle className='flex items-center gap-2'>
              <Calendar className='w-5 h-5' />
              Screening Details
            </CardTitle>
          </CardHeader>
          <CardContent className='space-y-4'>
            <div className='mb-4 py-3 px-5 bg-blue-50 rounded-lg border border-blue-200'>
              <div className='flex items-center justify-between'>
                <div className='flex-1'>
                  <div className='flex items-center gap-2'>
                    <span className='text-sm font-medium text-blue-900'>Student Name:</span>
                    <span className='text-sm font-semibold text-blue-800'>
                      {screening.student_name}
                    </span>
                  </div>
                  <div className='flex items-center gap-2 mt-1'>
                    <span className='text-sm font-medium text-blue-900'>
                      {gradesMatch ? 'Grade:' : 'Screening Grade:'}
                    </span>
                    <span className='text-sm font-semibold text-blue-800'>{screeningGrade}</span>
                  </div>
                  {!gradesMatch && studentCurrentGrade && (
                    <div className='flex items-center gap-2 mt-1'>
                      <span className='text-sm font-medium text-blue-900'>
                        Student Current Grade:
                      </span>
                      <span className='text-sm font-semibold text-blue-800'>
                        {studentCurrentGrade}
                      </span>
                    </div>
                  )}
                </div>
                <Button variant='outline' size='sm' onClick={handleEditStudent} className='ml-4'>
                  <Edit className='w-4 h-4 mr-2' />
                  Edit Student
                </Button>
              </div>
            </div>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
              <div>
                <Label htmlFor='screening_type' className='mb-2 block'>
                  Screening Type <span className='text-red-500 text-lg'>*</span>
                </Label>
                <Select
                  value={form.watch('screening_type')}
                  onValueChange={value => form.setValue('screening_type', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder='Select screening type' />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='initial'>Initial</SelectItem>
                    <SelectItem value='progress'>Progress</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor='screening_date' className='mb-2 block'>
                  Screening Date <span className='text-red-500 text-lg'>*</span>
                </Label>
                <Input
                  type='text'
                  value={form.watch('screening_date')}
                  readOnly
                  className='bg-gray-50 cursor-not-allowed'
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <EnhancedSpeechScreeningFields form={form} />

        <Card>
          <CardHeader>
            <CardTitle>Clinical Notes (Private)</CardTitle>
          </CardHeader>
          <CardContent className='space-y-4'>
            <div>
              <Label htmlFor='clinical_notes'>Clinical Observations</Label>
              <Textarea
                {...form.register('clinical_notes')}
                placeholder='Enter clinical observations and notes...'
                rows={4}
                className='mt-2'
                onKeyDown={e => {
                  if (e.key === 'Enter' && e.ctrlKey) {
                    return
                  }
                  if (e.key === 'Enter') {
                    e.stopPropagation()
                  }
                }}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recommendations and referrals (Reports)</CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              {...form.register('referral_notes')}
              placeholder='Enter recommendations and referrals...'
              rows={4}
              className='-mt-2'
              onKeyDown={e => {
                if (e.key === 'Enter' && e.ctrlKey) {
                  return
                }
                if (e.key === 'Enter') {
                  e.stopPropagation()
                }
              }}
            />
          </CardContent>
        </Card>

        <div className='flex gap-2 pt-4'>
          <Button variant='outline' onClick={handleGoBack} disabled={saving}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            <Save className='w-4 h-4 mr-2' />
            {saving ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </div>

      {/* Edit Student Dialog */}
      <Dialog
        open={isEditingStudent}
        onOpenChange={open => {
          if (!open) {
            handleCancelEditStudent()
          }
        }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Student Information</DialogTitle>
            <DialogDescription>
              Update the student's first name, last name, and current grade below.
            </DialogDescription>
          </DialogHeader>
          <div className='space-y-4 py-4'>
            <div className='space-y-2'>
              <label className='text-sm font-medium text-gray-700'>First Name</label>
              <Input
                value={editedFirstName}
                onChange={e => setEditedFirstName(e.target.value)}
                placeholder='First Name'
              />
            </div>
            <div className='space-y-2'>
              <label className='text-sm font-medium text-gray-700'>Last Name</label>
              <Input
                value={editedLastName}
                onChange={e => setEditedLastName(e.target.value)}
                placeholder='Last Name'
              />
            </div>
            <div className='space-y-2'>
              <label className='text-sm font-medium text-gray-700'>Current Grade</label>
              {isLoadingGrades ? (
                <div className='flex items-center justify-center py-2'>
                  <LoadingSpinner size='sm' />
                </div>
              ) : (
                <Select value={editedGradeId || undefined} onValueChange={setEditedGradeId}>
                  <SelectTrigger>
                    <SelectValue placeholder='Select grade (optional)' />
                  </SelectTrigger>
                  <SelectContent>
                    {availableGrades.map(grade => (
                      <SelectItem key={grade.id} value={grade.id}>
                        {grade.grade_level} ({grade.academic_year})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button variant='outline' onClick={handleCancelEditStudent}>
              Cancel
            </Button>
            <Button onClick={handleSaveStudent}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

const EditScreening = () => <EditScreeningContent />

export default EditScreening
