import React, { useState, useEffect } from 'react'
import { useForm, UseFormReturn } from 'react-hook-form'
import { Button } from '@/components/ui/button'
import { Student } from '@/types/database'
import { useCreateSpeechScreening } from '@/hooks/screenings'
import { useAuth } from '@/contexts/AuthContext'
import { useOrganization } from '@/contexts/OrganizationContext'
import { useToast } from '@/hooks/use-toast'
import { schoolGradesApi } from '@/api/schoolGrades'
import ProgressIndicator from '../shared/ProgressIndicator'
import SpeechScreeningStep1 from './steps/SpeechScreeningStep1'
import SpeechScreeningStep2 from './steps/SpeechScreeningStep2'
import SubmissionConfirmationModal from '../SubmissionConfirmationModal'

interface MultiStepSpeechScreeningFormProps {
  onSubmit?: (data: unknown) => void
  onCancel: () => void
  existingStudent?: Student | null
}

const MultiStepSpeechScreeningForm = ({
  onSubmit,
  onCancel,
  existingStudent,
}: MultiStepSpeechScreeningFormProps) => {
  const [currentStep, setCurrentStep] = useState(1)
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(existingStudent || null)
  const [selectedGrade, setSelectedGrade] = useState<string>('')
  const [selectedGradeId, setSelectedGradeId] = useState<string>('')
  const [gradeSchoolId, setGradeSchoolId] = useState<string>('')
  const [isAbsent, setIsAbsent] = useState(false)
  const [isNoConsent, setIsNoConsent] = useState(false)
  const [showSubmissionModal, setShowSubmissionModal] = useState(false)

  const { user } = useAuth()
  const { currentSchool } = useOrganization()
  const { toast } = useToast()
  const createScreening = useCreateSpeechScreening()

  // Grade ID will be set through backend validation in handleSubmit
  // No default grade ID needed - it will come from existing or newly created grade records

  const form = useForm({
    mode: 'onSubmit',
    reValidateMode: 'onSubmit',
    defaultValues: {
      // Step 1 fields
      academic_year: (() => {
        const currentYear = new Date().getFullYear()
        return `${currentYear}-${currentYear + 1}`
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
      general_articulation_notes: '',
      clinical_notes: '',
      referral_notes: '',
      other_notes: '',

      // Enhanced Speech Screening Fields
      articulation: {
        soundErrors: [],
        articulationNotes: '',
      },
      areasOfConcern: {
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
    },
  })

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

      if (!formData.speech_screen_result || formData.speech_screen_result === '') {
        errors.push('Speech screen result is required')
      }
    }

    return errors
  }

  const handleSubmit = async (data: unknown) => {
    const formData = data as Record<string, unknown>
    const absentData = (formData.absent as Record<string, unknown>) || {}
    const noConsentData = (formData.no_consent as Record<string, unknown>) || {}
    const formAbsent = (absentData.isAbsent as boolean) || false
    const formNoConsent = (noConsentData.isNoConsent as boolean) || false

    // Allow submission from step 1 if absent or no consent is checked, otherwise require step 2
    if (currentStep === 1 && !formAbsent && !formNoConsent) {
      return
    }
    if (currentStep === 2 && (formAbsent || formNoConsent)) {
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

    // Validate grade availability for the selected student's school
    let validatedGradeId = selectedGradeId // Use existing grade ID if available
    let validatedSchoolId = gradeSchoolId // Use existing school ID if available

    if (selectedStudent && selectedGrade && currentSchool) {
      try {
        const academicYear =
          (formData.academic_year as string) ||
          (() => {
            const currentYear = new Date().getFullYear()
            return `${currentYear}-${currentYear + 1}`
          })()

        const gradeAvailability = await schoolGradesApi.checkGradeAvailability(
          currentSchool.id,
          selectedGrade,
          academicYear
        )

        if (!gradeAvailability.exists) {
          try {
            // Create new school grade since it doesn't exist
            const newGrade = await schoolGradesApi.createSchoolGrade({
              school_id: currentSchool.id,
              grade_level: selectedGrade,
              academic_year: academicYear,
            })

            // Use the validated grade ID directly for this submission
            validatedGradeId = newGrade.id
            validatedSchoolId = newGrade.school_id

            // Also update state for future submissions
            setSelectedGradeId(newGrade.id)
            setGradeSchoolId(newGrade.school_id)
          } catch (createError) {
            console.error('Failed to create new grade:', createError)
            // Continue with submission even if grade creation fails
            // The backend should handle this gracefully
          }
        } else {
          // Use the validated grade ID directly for this submission
          if (gradeAvailability.grade?.id && gradeAvailability.grade?.school_id) {
            validatedGradeId = gradeAvailability.grade.id
            validatedSchoolId = gradeAvailability.grade.school_id

            // Also update state for future submissions
            setSelectedGradeId(gradeAvailability.grade.id)
            setGradeSchoolId(gradeAvailability.grade.school_id)
          }
        }
      } catch (error) {
        console.error('Grade validation error:', error)
        // Continue with submission even if validation fails
      }
    }

    const areasOfConcern = (formData.areasOfConcern as Record<string, unknown>) || {}
    const articulation = (formData.articulation as Record<string, unknown>) || {}
    const absent = (formData.absent as Record<string, unknown>) || {}
    const noConsent = (formData.no_consent as Record<string, unknown>) || {}

    const screeningData = {
      // Direct column matches - only send fields that the API expects
      student_id: selectedStudent?.id || '',
      grade_id: validatedGradeId, // Use the validated grade ID from the validation process
      screener_id: user?.id || '',
      result: formAbsent
        ? 'absent'
        : formNoConsent
        ? 'non_registered_no_consent'
        : (formData.speech_screen_result as string) || '',
      vocabulary_support: (formData.vocabulary_support_recommended as boolean) || false,
      clinical_notes: (formData.clinical_notes as string) || '',
      referral_notes: (formData.referral_notes as string) || '',

      // Structured error_patterns to match existing format + new data
      error_patterns: {
        // === EXISTING FORMAT (maintain compatibility) ===
        additional_observations: (formData.other_notes as string) || '',

        // === ADDITIONAL DATA (organized in logical groups) ===
        articulation: {
          soundErrors:
            (articulation.soundErrors as Array<{
              notes: string
              otherNotes?: string
              sound: string
              word: string
              errorPatterns: string[]
              stoppingSounds?: string[]
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
              const currentYear = new Date().getFullYear()
              return `${currentYear}-${currentYear + 1}`
            })(),
          screening_type: (formData.screening_type as string) || 'initial',
          screening_date:
            (formData.screening_date as string) || new Date().toISOString().split('T')[0],
          qualifies_for_speech_program: (formData.qualifies_for_speech_program as boolean) || false,
          vocabulary_support_recommended:
            (formData.vocabulary_support_recommended as boolean) || false,
          sub: (formData.sub as boolean) || false,
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

    createScreening.mutate(screeningData, {
      onSuccess: () => {
        setShowSubmissionModal(true)
      },
    })
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
    return (isAbsent || isNoConsent) && selectedGrade && selectedStudent
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
            onStudentSelect={setSelectedStudent}
            onGradeChange={setSelectedGrade}
            onGradeIdChange={setSelectedGradeId}
            onAbsentChange={setIsAbsent}
            onNoConsentChange={setIsNoConsent}
          />
        )
      case 2:
        return <SpeechScreeningStep2 form={form as unknown as UseFormReturn} />
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
          </div>

          <div className='flex space-x-3'>
            {/* // TODO: Fix draft functionality */}
            {/* <Button type='button' variant='secondary' onClick={handleSaveDraft}>
              Save Draft
            </Button> */}

            {currentStep === 1 ? (
              // Step 1: Show Submit if absent or no consent, Next if not
              isAbsent || isNoConsent ? (
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
                  disabled={createScreening.isPending || !canSubmitFromStep1()}
                  className='bg-primary hover:bg-primary/90 text-primary-foreground'>
                  {createScreening.isPending
                    ? 'Creating...'
                    : isAbsent
                    ? 'Submit Absent Screening'
                    : 'Submit No Consent Screening'}
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
                disabled={createScreening.isPending || !canSubmitFromStep2()}
                className='bg-primary hover:bg-primary/90 text-primary-foreground'>
                {createScreening.isPending ? 'Creating...' : 'Submit Screening'}
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
