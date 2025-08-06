import React, { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { Button } from '@/components/ui/button'
import { Student } from '@/types/database'
import { useCreateSpeechScreening } from '@/hooks/screenings'
import { useAuth } from '@/contexts/AuthContext'
import ProgressIndicator from '../shared/ProgressIndicator'
import SpeechScreeningStep1 from './steps/SpeechScreeningStep1'
import SpeechScreeningStep2 from './steps/SpeechScreeningStep2'

interface MultiStepSpeechScreeningFormProps {
  onSubmit?: (data: any) => void
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

  const handleSubmit = (data: any) => {
    // Allow submission from step 1 if absent is checked, otherwise require step 2
    if (currentStep === 1 && !isAbsent) {
      return
    }
    if (currentStep === 2 && isAbsent) {
      // If we're on step 2 but absent is checked, we should have submitted from step 1
      return
    }

    const screeningData = {
      // Direct column matches
      student_id: selectedStudent?.id || '',
      grade_id: selectedGradeId, // TODO: This needs to be changed it's not right
      screener_id: user?.id || '',
      academic_year:
        data.academic_year ||
        (() => {
          const currentYear = new Date().getFullYear()
          return `${currentYear}-${currentYear + 1}`
        })(),
      screening_type: data.screening_type || 'initial',
      result: data.speech_screen_result || '',
      vocabulary_support: data.vocabulary_support_recommended || false,
      suspected_cas: data.areasOfConcern?.suspected_cas || false,
      clinical_notes: data.clinical_notes || '',
      referral_notes: data.referral_notes || '',

      // Structured error_patterns to match existing format + your new data
      error_patterns: {
        // === EXISTING FORMAT (maintain compatibility) ===
        sound_errors: data.articulation?.soundErrors || [],
        articulation_notes:
          data.articulation?.articulationNotes || data.general_articulation_notes || '',
        fluency_notes: data.areasOfConcern?.fluency || '',
        voice_quality: data.areasOfConcern?.voice || '',
        language_comprehension: data.areasOfConcern?.language_comprehension || '',
        language_expression: data.areasOfConcern?.language_expression || '',
        pragmatics_social_communication: data.areasOfConcern?.pragmatics_social_communication || '',
        overall_observations: data.other_notes || '',

        // === YOUR ADDITIONAL DATA (organized in logical groups) ===
        articulation: data.articulation || { soundErrors: [], articulationNotes: '' },

        attendance: {
          absent: data.absent?.isAbsent || false,
          absence_notes: data.absent?.notes || '',
          priority_re_screen: data.priority_re_screen || false,
        },

        screening_metadata: {
          screening_date: data.screening_date || new Date().toISOString().split('T')[0],
          qualifies_for_speech_program: data.qualifies_for_speech_program || false,
        },

        add_areas_of_concern: {
          language_comprehension: data.areasOfConcern?.language_comprehension || null,
          language_expression: data.areasOfConcern?.language_expression || null,
          pragmatics_social_communication:
            data.areasOfConcern?.pragmatics_social_communication || null,
          fluency: data.areasOfConcern?.fluency || null,
          suspected_cas: data.areasOfConcern?.suspected_cas || null,
          reluctant_speaking: data.areasOfConcern?.reluctant_speaking || null,
          voice: data.areasOfConcern?.voice || null,
          literacy: data.areasOfConcern?.literacy || null,
          cleft_lip_palate: data.areasOfConcern?.cleft_lip_palate || null,
          known_pending_diagnoses: data.areasOfConcern?.known_pending_diagnoses || null,
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
                  onClick={() => {
                    const formData = form.getValues()
                    const formErrors = Object.keys(form.formState.errors)

                    if (formErrors.length > 0) {
                      return
                    }

                    handleSubmit(formData)
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
                onClick={() => {
                  const formData = form.getValues()
                  const formErrors = Object.keys(form.formState.errors)

                  if (formErrors.length > 0) {
                    return
                  }

                  handleSubmit(formData)
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
