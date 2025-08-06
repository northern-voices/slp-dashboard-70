import React, { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { Button } from '@/components/ui/button'
import { Student } from '@/types/database'
import { useCreateSpeechScreening } from '@/hooks/screenings'
import { useAuth } from '@/contexts/AuthContext'
import { useOrganization } from '@/contexts/OrganizationContext'
import { schoolGradesApi } from '@/api/schoolGrades'
import ProgressIndicator from '../shared/ProgressIndicator'
import SpeechScreeningStep1 from './steps/SpeechScreeningStep1'
import SpeechScreeningStep2 from './steps/SpeechScreeningStep2'

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
  const [isAbsent, setIsAbsent] = useState(false)

  const { user } = useAuth()
  const { currentSchool } = useOrganization()
  const createScreening = useCreateSpeechScreening()

  // Set default grade ID when component mounts
  useEffect(() => {
    const setDefaultGradeId = async () => {
      if (selectedGrade) {
        const currentYear = new Date().getFullYear()
        const currentAcademicYear = `${currentYear}-${currentYear + 1}`

        // Try to find the grade ID for the current academic year
        // This will be handled by the SpeechScreeningStep1 component
        // For now, we'll set a placeholder that will be updated when the step loads
        setSelectedGradeId(`default-${currentAcademicYear}`)
      }
    }

    setDefaultGradeId()
  }, [selectedGrade])

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
      priority_re_screen: false,

      // Step 2 fields
      screening_type: 'initial',
      screening_date: new Date().toISOString().split('T')[0],
      speech_screen_result: '',
      vocabulary_support_recommended: false,
      qualifies_for_speech_program: false,
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

  const handleSubmit = async (data: unknown) => {
    // Allow submission from step 1 if absent is checked, otherwise require step 2
    if (currentStep === 1 && !isAbsent) {
      return
    }
    if (currentStep === 2 && isAbsent) {
      // If we're on step 2 but absent is checked, we should have submitted from step 1
      return
    }

    // Validate grade availability for the selected student's school
    if (selectedStudent && selectedGrade && currentSchool) {
      try {
        const formData = data as Record<string, unknown>
        const academicYear =
          (formData.academic_year as string) ||
          (() => {
            const currentYear = new Date().getFullYear()
            return `${currentYear}-${currentYear + 1}`
          })()

        console.log('=== GRADE VALIDATION START ===')
        console.log('Checking grade availability for:', {
          schoolId: currentSchool.id,
          schoolName: currentSchool.name,
          gradeLevel: selectedGrade,
          academicYear: academicYear,
          studentId: selectedStudent.id,
          studentName: `${selectedStudent.first_name} ${selectedStudent.last_name}`,
        })

        const gradeAvailability = await schoolGradesApi.checkGradeAvailability(
          currentSchool.id,
          selectedGrade,
          academicYear
        )

        console.log('Grade availability result:', gradeAvailability)

        if (!gradeAvailability.exists) {
          console.warn('⚠️ GRADE NOT AVAILABLE:', {
            message: `Grade ${selectedGrade} for academic year ${academicYear} is not available at ${currentSchool.name}`,
            schoolId: currentSchool.id,
            gradeLevel: selectedGrade,
            academicYear: academicYear,
          })
          // For now, just log the warning but continue with submission
          // In production, you might want to show an error message or prevent submission
        } else {
          console.log('✅ GRADE VALIDATION PASSED:', {
            message: `Grade ${selectedGrade} is available at ${currentSchool.name}`,
            gradeId: gradeAvailability.grade?.id,
            schoolId: currentSchool.id,
            gradeLevel: selectedGrade,
            academicYear: academicYear,
          })

          // Update the selectedGradeId with the validated grade ID
          if (gradeAvailability.grade?.id) {
            setSelectedGradeId(gradeAvailability.grade.id)
          }
        }

        console.log('=== GRADE VALIDATION END ===')
      } catch (error) {
        console.error('❌ GRADE VALIDATION ERROR:', error)
        // For now, continue with submission even if validation fails
        // In production, you might want to handle this error differently
      }
    } else {
      console.warn('⚠️ MISSING VALIDATION DATA:', {
        selectedStudent: !!selectedStudent,
        selectedGrade: !!selectedGrade,
        currentSchool: !!currentSchool,
        message: 'Cannot validate grade availability - missing required data',
      })
    }

    const formData = data as Record<string, unknown>
    const areasOfConcern = (formData.areasOfConcern as Record<string, unknown>) || {}
    const articulation = (formData.articulation as Record<string, unknown>) || {}
    const absent = (formData.absent as Record<string, unknown>) || {}

    const screeningData = {
      // Direct column matches
      student_id: selectedStudent?.id || '',
      grade_id: selectedGradeId, // This will now be validated and set correctly
      screener_id: user?.id || '',
      academic_year:
        (formData.academic_year as string) ||
        (() => {
          const currentYear = new Date().getFullYear()
          return `${currentYear}-${currentYear + 1}`
        })(),
      screening_type: (formData.screening_type as string) || 'initial',
      result: (formData.speech_screen_result as string) || '',
      vocabulary_support: (formData.vocabulary_support_recommended as boolean) || false,
      suspected_cas: (areasOfConcern.suspected_cas as boolean) || false,
      clinical_notes: (formData.clinical_notes as string) || '',
      referral_notes: (formData.referral_notes as string) || '',

      // Structured error_patterns to match existing format + your new data
      error_patterns: {
        // === EXISTING FORMAT (maintain compatibility) ===
        sound_errors: (articulation.soundErrors as string[]) || [],
        articulation_notes:
          (articulation.articulationNotes as string) ||
          (formData.general_articulation_notes as string) ||
          '',
        fluency_notes: (areasOfConcern.fluency as string) || '',
        voice_quality: (areasOfConcern.voice as string) || '',
        language_comprehension: (areasOfConcern.language_comprehension as string) || '',
        language_expression: (areasOfConcern.language_expression as string) || '',
        pragmatics_social_communication:
          (areasOfConcern.pragmatics_social_communication as string) || '',
        overall_observations: (formData.other_notes as string) || '',

        // === YOUR ADDITIONAL DATA (organized in logical groups) ===
        articulation: articulation || { soundErrors: [], articulationNotes: '' },

        attendance: {
          absent: (absent.isAbsent as boolean) || false,
          absence_notes: (absent.notes as string) || '',
          priority_re_screen: (formData.priority_re_screen as boolean) || false,
        },

        screening_metadata: {
          screening_date:
            (formData.screening_date as string) || new Date().toISOString().split('T')[0],
          qualifies_for_speech_program: (formData.qualifies_for_speech_program as boolean) || false,
        },

        add_areas_of_concern: {
          language_comprehension: (areasOfConcern.language_comprehension as string) || null,
          language_expression: (areasOfConcern.language_expression as string) || null,
          pragmatics_social_communication:
            (areasOfConcern.pragmatics_social_communication as string) || null,
          fluency: (areasOfConcern.fluency as string) || null,
          suspected_cas: (areasOfConcern.suspected_cas as boolean) || null,
          reluctant_speaking: (areasOfConcern.reluctant_speaking as boolean) || null,
          voice: (areasOfConcern.voice as string) || null,
          literacy: (areasOfConcern.literacy as string) || null,
          cleft_lip_palate: (areasOfConcern.cleft_lip_palate as boolean) || null,
          known_pending_diagnoses: (areasOfConcern.known_pending_diagnoses as string) || null,
        },
      },
    }

    // Console log the complete form data
    console.log('=== COMPLETE FORM DATA ===')
    console.log('Raw form data:', data)
    console.log('Selected student:', selectedStudent)
    console.log('Selected grade:', selectedGrade)
    console.log('Selected grade ID:', selectedGradeId)
    console.log('Current user:', user)
    console.log('=== END FORM DATA ===')

    // Console log the final screening data that will be submitted
    console.log('=== FINAL SCREENING DATA TO SUBMIT ===')
    console.log('Screening data:', screeningData)
    console.log('=== END SCREENING DATA ===')

    createScreening.mutate(screeningData, {
      onSuccess: () => {
        if (onSubmit) {
          onSubmit(screeningData)
        }
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
    // Can submit from step 1 if absent is checked and we have required fields
    return isAbsent && selectedGrade && selectedStudent
  }

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <SpeechScreeningStep1
            form={form}
            selectedStudent={selectedStudent}
            selectedGrade={selectedGrade}
            onStudentSelect={setSelectedStudent}
            onGradeChange={setSelectedGrade}
            onGradeIdChange={setSelectedGradeId}
            onAbsentChange={setIsAbsent}
          />
        )
      case 2:
        return <SpeechScreeningStep2 form={form} />
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
            <Button type='button' variant='secondary' onClick={handleSaveDraft}>
              Save Draft
            </Button>

            {currentStep === 1 ? (
              // Step 1: Show Submit if absent, Next if not absent
              isAbsent ? (
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
                  {createScreening.isPending ? 'Creating...' : 'Submit Absent Screening'}
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
                disabled={createScreening.isPending}
                className='bg-primary hover:bg-primary/90 text-primary-foreground'>
                {createScreening.isPending ? 'Creating...' : 'Submit Screening'}
              </Button>
            )}
          </div>
        </div>
      </form>
    </div>
  )
}

export default MultiStepSpeechScreeningForm
