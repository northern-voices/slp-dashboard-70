import React, { useState, useEffect, useRef, useCallback } from 'react'
import { useForm, UseFormReturn } from 'react-hook-form'
import { Button } from '@/components/ui/button'
import { Student } from '@/types/database'
import { useCreateSpeechScreening } from '@/hooks/screenings'
import { useUpdateStudent } from '@/hooks/students/use-students-mutations'
import { useAuth } from '@/contexts/AuthContext'
import { useOrganization } from '@/contexts/OrganizationContext'
import { useToast } from '@/hooks/use-toast'
import { schoolGradesApi } from '@/api/schoolGrades'
import { Screening } from '@/types/database'
import ProgressIndicator from '../shared/ProgressIndicator'
import SpeechScreeningStep1 from './steps/SpeechScreeningStep1'
import SpeechScreeningStep2 from './steps/SpeechScreeningStep2'
import SubmissionConfirmationModal from '../SubmissionConfirmationModal'
import { useOnlineStatus } from '@/hooks/use-online-status'
import { ErrorPatterns, SpeechScreeningFormValues } from '@/types/screening-form'
import { offlineQueue } from '@/services/offline-queue'

interface MultiStepSpeechScreeningFormProps {
  onSubmit?: (data: unknown) => void
  onCancel: () => void
  existingStudent?: Student | null
  onStudentSelect?: (student: Student | null) => void
  afterStudentContent?: React.ReactNode
  initialScreeningData?: Screening | null
}

const MultiStepSpeechScreeningForm = ({
  onSubmit,
  onCancel,
  existingStudent,
  onStudentSelect,
  afterStudentContent,
  initialScreeningData,
}: MultiStepSpeechScreeningFormProps) => {
  const [currentStep, setCurrentStep] = useState(1)
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(existingStudent || null)
  const [selectedGrade, setSelectedGrade] = useState<string>('')
  const [selectedGradeId, setSelectedGradeId] = useState<string>('')
  const [gradeSchoolId, setGradeSchoolId] = useState<string>('')
  const [isAbsent, setIsAbsent] = useState(false)
  const [isNoConsent, setIsNoConsent] = useState(false)
  const [isComplexNeeds, setIsComplexNeeds] = useState(false)
  const [isUnableToScreen, setIsUnableToScreen] = useState(false)
  const [showSubmissionModal, setShowSubmissionModal] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [resetKey, setResetKey] = useState(0)

  const isSubmittingRef = useRef(false)
  const { user } = useAuth()
  const { currentSchool } = useOrganization()
  const { toast } = useToast()
  const createScreening = useCreateSpeechScreening()
  const updateStudent = useUpdateStudent()
  const isOnline = useOnlineStatus()

  const form = useForm<SpeechScreeningFormValues>({
    mode: 'onSubmit',
    reValidateMode: 'onSubmit',
    defaultValues: {
      academic_year: (() => {
        const currentDate = new Date()
        const currentYear = currentDate.getFullYear()
        const currentMonth = currentDate.getMonth()
        const academicYearStart = currentMonth < 7 ? currentYear - 1 : currentYear
        return `${academicYearStart}-${academicYearStart + 1}`
      })(),
      absent: {
        isAbsent: false,
        notes: '',
      },
      no_consent: {
        isNoConsent: false,
        notes: '',
      },
      priority_re_screen: false,

      // Step 2 fields
      screening_type: 'initial',
      screening_date: new Date().toLocaleDateString('en-CA'), // YYYY-MM-DD format in local timezone
      speech_screen_result: '',
      vocabulary_support_recommended: false,
      qualifies_for_speech_program: false,
      sub: false,
      graduated: false,
      general_articulation_notes: '',
      clinical_notes: '',
      referral_notes: '',
      progress_notes: '',
      other_notes: '',

      // Enhanced Speech Screening Fields - match the structure expected by EnhancedSpeechScreeningFields
      error_patterns: {
        articulation: {
          soundErrors: [],
          articulationNotes: '',
        },
        add_areas_of_concern: {
          language_comprehension: null,
          language_expression: null,
          pragmatics_social_communication: null,
          fluency: null,
          suspected_cas: null,
          reluctant_speaking: null,
          voice: null,
          literacy: null,
          cleft_lip_palate: null,
          known_pending_diagnoses: null,
        },
        attendance: {
          absent: false,
          absence_notes: '',
          priority_re_screen: false,
        },
        screening_metadata: {
          screening_date: '',
          qualifies_for_speech_program: false,
          vocabulary_support_recommended: false,
          sub: false,
          graduated: false,
        },
        additional_observations: '',
      },
    },
  })

  const initializeFromScreeningData = useCallback(() => {
    if (!initialScreeningData) return

    const errorPatterns = initialScreeningData.error_patterns
    const articulation = errorPatterns?.articulation
    const areasOfConcern = errorPatterns?.add_areas_of_concern || {
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
    }

    const screeningMetadata = errorPatterns?.screening_metadata

    form.setValue('screening_type', 'progress')
    form.setValue('screening_date', new Date().toLocaleDateString('en-CA'))
    form.setValue('speech_screen_result', initialScreeningData.result || '')
    form.setValue('sub', screeningMetadata?.sub || false)
    form.setValue(
      'qualifies_for_speech_program',
      screeningMetadata?.qualifies_for_speech_program || false
    )
    form.setValue('graduated', screeningMetadata?.graduated || false)
    form.setValue('paused', screeningMetadata?.paused || false)
    form.setValue('clinical_notes', '')
    form.setValue('referral_notes', '')
    form.setValue('progress_notes', '')
    form.setValue(
      'vocabulary_support_recommended',
      initialScreeningData.vocabulary_support || false
    )
    form.setValue('error_patterns', {
      articulation: {
        soundErrors: articulation.soundErrors || [],
        articulationNotes: articulation.articulationNotes || '',
      },
      add_areas_of_concern: areasOfConcern,
      attendance: { absent: false, absence_notes: '', priority_re_screen: false },
      additional_observations: errorPatterns.additional_observations || '',
      screening_metadata: {
        screening_date: new Date().toLocaleDateString('en-CA'),
        qualifies_for_speech_program: screeningMetadata?.qualifies_for_speech_program || false,
        vocabulary_support_recommended: initialScreeningData.vocabulary_support || false,
        sub: screeningMetadata?.sub || false,
        graduated: screeningMetadata?.graduated || false,
        paused: screeningMetadata?.paused || false,
      },
    })
  }, [initialScreeningData, form])

  useEffect(() => {
    initializeFromScreeningData()
  }, [initialScreeningData]) // eslint-disable-line

  // Initialize states from form data if available
  useEffect(() => {
    const formAbsentValue = form.getValues('absent.isAbsent')
    const formNoConsentValue = form.getValues('no_consent.isNoConsent')
    if (formAbsentValue !== isAbsent) {
      setIsAbsent(formAbsentValue || false)
    }
    if (formNoConsentValue !== isNoConsent) {
      setIsNoConsent(formNoConsentValue || false)
    }
  }, [form, isAbsent, isNoConsent])

  const stepTitles = ['Student Info', 'Screening Details & Results']

  const handleNext = () => {
    if (currentStep < 2) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleSaveDraft = () => {
    console.log('Saving draft...', form.getValues())
    // TODO: Implement draft saving functionality
  }

  const handleStudentSelect = (student: Student | null) => {
    setSelectedStudent(student)
    onStudentSelect?.(student)
  }

  const handleReset = () => {
    initializeFromScreeningData()
    setResetKey(prev => prev + 1)
  }

  const validateRequiredFields = (formData: Record<string, unknown>): string[] => {
    const errors: string[] = []

    // Only validate these fields if we're on step 2 (not absent or no consent submission)
    if (currentStep === 2 && !isAbsent && !isNoConsent) {
      if (!formData.screening_type || formData.screening_type === '') {
        errors.push('Screening type is required')
      }

      if (!formData.screening_date || formData.screening_date === '') {
        errors.push('Screening date is required')
      }

      const hasSpecialResult = formData.complex_needs || formData.unable_to_screen
      if (
        !hasSpecialResult &&
        (!formData.speech_screen_result || formData.speech_screen_result === '')
      ) {
        errors.push('Speech screen result is required')
      }
    }

    return errors
  }

  // Helper function to determine program_status from form data
  const determineProgramStatus = (formData: Record<string, unknown>): Student['program_status'] => {
    const noConsent = (formData.no_consent as { isNoConsent?: boolean })?.isNoConsent || false
    const sub = (formData.sub as boolean) || false
    const qualifies = (formData.qualifies_for_speech_program as boolean) || false

    if (noConsent) return 'no_consent'
    if (sub) return 'sub'
    if (qualifies) return 'qualified'

    // If none of the above are true, check if they explicitly don't qualify
    // For now, default to 'none' if nothing is selected
    return 'none'
  }

  const determineServiceStatus = (formData): Student['service_status'] => {
    const graduated = (formData.graduated as boolean) || false
    const paused = (formData.paused as boolean) || false

    if (graduated) return 'graduated'
    if (paused) return 'paused'
    return 'none'
  }

  const handleSubmit = async (data: unknown) => {
    if (isSubmittingRef.current) {
      return
    }
    isSubmittingRef.current = true
    setIsSubmitting(true)

    const formData = data as Record<string, unknown>
    const absentData = (formData.absent as Record<string, unknown>) || {}
    const noConsentData = (formData.no_consent as Record<string, unknown>) || {}
    const formAbsent = (absentData.isAbsent as boolean) || false
    const formNoConsent = (noConsentData.isNoConsent as boolean) || false
    const formComplexNeeds = (formData.complex_needs as boolean) || false
    const formUnableToScreen = (formData.unable_to_screen as boolean) || false

    try {
      // Allow submission from step 1 if absent or no consent is checked, otherwise require step 2
      if (
        currentStep === 1 &&
        !formAbsent &&
        !formNoConsent &&
        !formComplexNeeds &&
        !formUnableToScreen
      ) {
        return
      }
      if (
        currentStep === 2 &&
        (formAbsent || formNoConsent || formComplexNeeds || formUnableToScreen)
      ) {
        // If we're on step 2 but absent or no consent is checked, we should have submitted from step 1
        return
      }

      // Validate required fields
      const validationErrors = validateRequiredFields(formData)
      if (validationErrors.length > 0) {
        console.error('Validation errors:', validationErrors)
        toast({
          title: 'Required Fields Missing',
          description: validationErrors.join(', '),
          variant: 'destructive',
        })
        return
      }

      // For offline submissions, skip grade validation and use existing selectedGradeId
      // For online submissions, validate/create grade as before
      let validatedGradeId = selectedGradeId
      let validatedSchoolId = gradeSchoolId

      // Only do grade validation if online
      if (isOnline && selectedStudent && selectedGrade && currentSchool) {
        try {
          const academicYear =
            (formData.academic_year as string) ||
            (() => {
              const currentDate = new Date()
              const currentYear = currentDate.getFullYear()
              const currentMonth = currentDate.getMonth()
              const academicYearStart = currentMonth < 7 ? currentYear - 1 : currentYear
              return `${academicYearStart}-${academicYearStart + 1}`
            })()

          const gradeAvailability = await schoolGradesApi.checkGradeAvailability(
            currentSchool.id,
            selectedGrade,
            academicYear
          )

          if (!gradeAvailability.exists) {
            try {
              const newGrade = await schoolGradesApi.createSchoolGrade({
                school_id: currentSchool.id,
                grade_level: selectedGrade,
                academic_year: academicYear,
              })

              validatedGradeId = newGrade.id
              validatedSchoolId = newGrade.school_id
              setSelectedGradeId(newGrade.id)
              setGradeSchoolId(newGrade.school_id)
            } catch (createError) {
              console.error('Failed to create new grade:', createError)
            }
          } else {
            if (gradeAvailability.grade?.id && gradeAvailability.grade?.school_id) {
              validatedGradeId = gradeAvailability.grade.id
              validatedSchoolId = gradeAvailability.grade.school_id
              setSelectedGradeId(gradeAvailability.grade.id)
              setGradeSchoolId(gradeAvailability.grade.school_id)
            }
          }
        } catch (error) {
          console.error('Grade validation error:', error)
        }
      }

      const errorPatterns = (formData.error_patterns as Record<string, unknown>) || {}
      const areasOfConcern = (errorPatterns.add_areas_of_concern as Record<string, unknown>) || {}
      const articulation = (errorPatterns.articulation as Record<string, unknown>) || {}
      const absent = (formData.absent as Record<string, unknown>) || {}
      const noConsent = (formData.no_consent as Record<string, unknown>) || {}

      const screeningData = {
        student_id: selectedStudent?.id || '',
        grade_id: validatedGradeId,
        screener_id: user?.id || '',
        result: formAbsent
          ? 'absent'
          : formNoConsent
            ? 'non_registered_no_consent'
            : formData.complex_needs
              ? 'complex_needs'
              : formData.unable_to_screen
                ? 'unable_to_screen'
                : (formData.speech_screen_result as string) || '',
        vocabulary_support: (formData.vocabulary_support_recommended as boolean) || false,
        clinical_notes: (formData.clinical_notes as string) || '',
        referral_notes: (formData.referral_notes as string) || '',
        progress_notes: (formData.progress_notes as string) || '',

        error_patterns: {
          additional_observations: (formData.other_notes as string) || '',
          articulation: {
            soundErrors:
              (articulation.soundErrors as Array<{
                notes: string
                otherNotes?: string
                sound: string
                word: string
                errorPatterns: string[]
                stoppingSounds?: string[]
                stimulabilityOptions?: string[]
              }>) || [],
            articulationNotes:
              (articulation.articulationNotes as string) ||
              (formData.general_articulation_notes as string) ||
              '',
          },
          attendance: {
            absent: formAbsent,
            absence_notes: (absent.notes as string) || '',
            priority_re_screen: (formData.priority_re_screen as boolean) || false,
          },
          consent: {
            no_consent: formNoConsent,
            no_consent_notes: (noConsent.notes as string) || '',
          },
          screening_metadata: {
            academic_year:
              (formData.academic_year as string) ||
              (() => {
                const currentDate = new Date()
                const currentYear = currentDate.getFullYear()
                const currentMonth = currentDate.getMonth()
                const academicYearStart = currentMonth < 7 ? currentYear - 1 : currentYear
                return `${academicYearStart}-${academicYearStart + 1}`
              })(),
            screening_type: (formData.screening_type as string) || 'initial',
            screening_date:
              (formData.screening_date as string) || new Date().toISOString().split('T')[0],
            qualifies_for_speech_program:
              (formData.qualifies_for_speech_program as boolean) || false,
            vocabulary_support_recommended:
              (formData.vocabulary_support_recommended as boolean) || false,
            sub: (formData.sub as boolean) || false,
            graduated: (formData.graduated as boolean) || false,
          },
          add_areas_of_concern: {
            language_comprehension: (areasOfConcern.language_comprehension as string) || null,
            language_expression: (areasOfConcern.language_expression as string) || null,
            pragmatics_social_communication:
              (areasOfConcern.pragmatics_social_communication as string) || null,
            fluency: (areasOfConcern.fluency as string) || null,
            suspected_cas: (areasOfConcern.suspected_cas as string) || null,
            reluctant_speaking: (areasOfConcern.reluctant_speaking as boolean) || null,
            voice: (areasOfConcern.voice as string) || null,
            literacy: (areasOfConcern.literacy as string) || null,
            cleft_lip_palate: (areasOfConcern.cleft_lip_palate as boolean) || null,
            known_pending_diagnoses: (areasOfConcern.known_pending_diagnoses as string) || null,
          },
        },
      }

      // If offline, queue the submission
      if (!isOnline) {
        // Validate we have required fields before queuing
        if (!screeningData.student_id || !screeningData.screener_id) {
          toast({
            title: 'Cannot save offline',
            description: 'Missing required data. Please ensure student is selected.',
            variant: 'destructive',
          })
          return
        }

        if (!screeningData.grade_id && (!currentSchool?.id || !selectedGrade)) {
          toast({
            title: 'Cannot save offline',
            description: 'Missing grade information. Please ensure grade is selected.',
            variant: 'destructive',
          })
          return
        }

        const academicYear =
          (formData.academic_year as string) ||
          (() => {
            const currentDate = new Date()
            const currentYear = currentDate.getFullYear()
            const currentMonth = currentDate.getMonth()
            const academicYearStart = currentMonth < 7 ? currentYear - 1 : currentYear
            return `${academicYearStart}-${academicYearStart + 1}`
          })()

        offlineQueue.add(
          formData,
          {
            student_id: screeningData.student_id,
            screener_id: screeningData.screener_id,
            grade_id: screeningData.grade_id,
            error_patterns: screeningData.error_patterns,
            result: screeningData.result,
            vocabulary_support: screeningData.vocabulary_support,
            clinical_notes: screeningData.clinical_notes,
            referral_notes: screeningData.referral_notes,
          },
          selectedStudent?.id,
          // Pass grade info for creating grade when syncing
          !screeningData.grade_id
            ? {
                school_id: currentSchool!.id,
                grade_level: selectedGrade,
                academic_year: academicYear,
              }
            : undefined
        )

        toast({
          title: 'Saved offline',
          description: 'Screening will be submitted when you go back online.',
        })

        setShowSubmissionModal(true)
        return
      }

      // Online - submit normally
      createScreening.mutate(screeningData, {
        onSuccess: () => {
          // After creating the screening, update the student's program_status
          if (selectedStudent?.id) {
            updateStudent.mutate(
              {
                id: selectedStudent.id,
                studentData: {
                  program_status: determineProgramStatus(formData),
                  service_status: determineServiceStatus(formData),
                },
              },
              {
                onSuccess: () => {
                  setShowSubmissionModal(true)
                },
                onError: error => {
                  console.error('Failed to update student program status:', error)
                  setShowSubmissionModal(true)
                  toast({
                    title: 'Warning',
                    description: 'Screening created but failed to update program status',
                    variant: 'destructive',
                  })
                },
              }
            )
          } else {
            setShowSubmissionModal(true)
          }
        },
        onError: error => {
          // If online submission fails, queue it for later
          console.error('Submission failed, queuing for later:', error)

          // Validate submission before queing
          if (!screeningData.student_id || !screeningData.screener_id) {
            toast({
              title: 'Submission failed',
              description: 'Missing required data. Please try again.',
              variant: 'destructive',
            })
            return
          }

          if (!screeningData.grade_id && (!currentSchool?.id || !selectedGrade)) {
            toast({
              title: 'Submission failed',
              description: 'Missing grade information. Please try again.',
              variant: 'destructive',
            })
            return
          }

          const academicYear =
            (formData.academic_year as string) ||
            (() => {
              const currentDate = new Date()
              const currentYear = currentDate.getFullYear()
              const currentMonth = currentDate.getMonth()
              const academicYearStart = currentMonth < 7 ? currentYear - 1 : currentYear
              return `${academicYearStart}-${academicYearStart + 1}`
            })()

          offlineQueue.add(
            formData,
            {
              student_id: screeningData.student_id,
              screener_id: screeningData.screener_id,
              grade_id: screeningData.grade_id,
              error_patterns: screeningData.error_patterns,
              result: screeningData.result,
              vocabulary_support: screeningData.vocabulary_support,
              clinical_notes: screeningData.clinical_notes,
              referral_notes: screeningData.referral_notes,
            },
            selectedStudent?.id,
            // Pass gradeInfo for creating grade when syncing
            !screeningData.grade_id
              ? {
                  school_id: currentSchool!.id,
                  grade_level: selectedGrade,
                  academic_year: academicYear,
                }
              : undefined
          )

          toast({
            title: 'Saved for later',
            description: 'Submission failed. Will retry when connection improves.',
          })

          setShowSubmissionModal(true)
        },
      })
    } finally {
      setTimeout(() => {
        isSubmittingRef.current = false
        setIsSubmitting(false)
      }, 50)
    }
  }

  const canProceedToNext = () => {
    if (currentStep === 1) {
      // The grade ID will be resolved when the form is submitted
      return selectedGrade && selectedStudent
    }
    if (currentStep === 2) {
      return form.watch('screening_type') && form.watch('screening_date')
    }
    return true
  }

  const canSubmitFromStep1 = () => {
    // Can submit from step 1 if absent or no consent is checked and we have required fields
    return (
      (isAbsent || isNoConsent || isComplexNeeds || isUnableToScreen) &&
      selectedGrade &&
      selectedStudent
    )
  }

  const canSubmitFromStep2 = () => {
    // Can submit from step 2 if we have all required fields
    const formValues = form.getValues()
    return (
      selectedGrade &&
      selectedStudent &&
      formValues.screening_type &&
      formValues.screening_date &&
      formValues.speech_screen_result
    )
  }

  const handleNewScreening = () => {
    setShowSubmissionModal(false)
    // Reset form for new screening
    form.reset()
    setCurrentStep(1)
    setSelectedStudent(null)
    setSelectedGrade('')
    setSelectedGradeId('')
    setGradeSchoolId('')
    setIsAbsent(false)
    setIsNoConsent(false)
    setIsComplexNeeds(false)
    setIsUnableToScreen(false)
  }

  const handleGoToDashboard = () => {
    setShowSubmissionModal(false)
    if (onSubmit) {
      onSubmit({})
    }
  }

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <SpeechScreeningStep1
            form={form as unknown as UseFormReturn<Record<string, unknown>>}
            selectedStudent={selectedStudent}
            selectedGrade={selectedGrade}
            onStudentSelect={handleStudentSelect}
            onGradeChange={setSelectedGrade}
            onGradeIdChange={setSelectedGradeId}
            onAbsentChange={setIsAbsent}
            onNoConsentChange={setIsNoConsent}
            onComplexNeedsChange={setIsComplexNeeds}
            onUnableToScreenChange={setIsUnableToScreen}
            afterStudentContent={afterStudentContent}
          />
        )
      case 2:
        return (
          <SpeechScreeningStep2
            key={resetKey}
            form={form}
            selectedStudent={selectedStudent}
            initialScreeningData={initialScreeningData}
          />
        )
      default:
        return null
    }
  }

  return (
    <div className='space-y-6'>
      <ProgressIndicator currentStep={currentStep} totalSteps={2} stepTitles={stepTitles} />

      <form
        onSubmit={e => {
          // ALWAYS prevent the default form submission behavior
          e.preventDefault()
          e.stopPropagation()
          return false
        }}
        className='space-y-6'>
        {renderCurrentStep()}

        {/* Action Buttons */}
        <div className='flex justify-between items-center pt-6 border-t'>
          <div className='flex space-x-3'>
            <Button type='button' variant='destructive' onClick={onCancel}>
              Cancel
            </Button>

            {currentStep > 1 && (
              <Button type='button' variant='default' onClick={handlePrevious}>
                Previous
              </Button>
            )}

            {currentStep === 2 && initialScreeningData && (
              <Button type='button' variant='outline' onClick={handleReset}>
                Reset to Previous Screening
              </Button>
            )}
          </div>

          <div className='flex space-x-3'>
            {/* // TODO: Fix draft functionality */}
            {/* <Button type='button' variant='secondary' onClick={handleSaveDraft}>
              Save Draft
            </Button> */}

            {currentStep === 1 ? (
              // Step 1: Show Submit if absent or no consent, Next if not
              isAbsent || isNoConsent || isComplexNeeds || isUnableToScreen ? (
                <Button
                  type='button'
                  onClick={async () => {
                    const formData = form.getValues()
                    const formErrors = Object.keys(form.formState.errors)

                    if (formErrors.length > 0) {
                      return
                    }

                    await handleSubmit(formData)
                  }}
                  disabled={createScreening.isPending || isSubmitting || !canSubmitFromStep1()}
                  className='bg-primary hover:bg-primary/90 text-primary-foreground'>
                  {createScreening.isPending || isSubmitting
                    ? 'Submitting...'
                    : isAbsent
                      ? 'Submit Absent Screening'
                      : isNoConsent
                        ? 'Submit No Consent Screening'
                        : isComplexNeeds
                          ? 'Submit Complex Needs Screening'
                          : 'Submit Unable to Screen Screening'}
                </Button>
              ) : (
                <Button
                  type='button'
                  onClick={handleNext}
                  disabled={!canProceedToNext()}
                  className='bg-primary hover:bg-primary/90 text-primary-foreground'>
                  Next
                </Button>
              )
            ) : (
              // Step 2: Always show Submit
              <Button
                type='button'
                onClick={async () => {
                  const formData = form.getValues()
                  const formErrors = Object.keys(form.formState.errors)

                  if (formErrors.length > 0) {
                    return
                  }

                  await handleSubmit(formData)
                }}
                disabled={createScreening.isPending || isSubmitting || !canSubmitFromStep2()}
                className='bg-primary hover:bg-primary/90 text-primary-foreground'>
                {createScreening.isPending || isSubmitting ? 'Submitting...' : 'Submit Screening'}
              </Button>
            )}
          </div>
        </div>
      </form>

      {/* Submission Confirmation Modal */}
      <SubmissionConfirmationModal
        isOpen={showSubmissionModal}
        onNewScreening={handleNewScreening}
        onGoToDashboard={handleGoToDashboard}
        studentName={
          selectedStudent ? `${selectedStudent.first_name} ${selectedStudent.last_name}` : undefined
        }
      />
    </div>
  )
}

export default MultiStepSpeechScreeningForm
