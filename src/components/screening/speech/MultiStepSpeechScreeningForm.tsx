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
      screening_type: 'initial',
      screening_date: new Date().toISOString().split('T')[0],
      speech_screen_result: '',
      vocabulary_support: false,
      suspected_cas: false,
      clinical_notes: '',
      referral_notes: '',
      attendance: '',
      // Speech screening fields (for error_patterns)
      articulation: {
        soundErrors: [],
        articulationNotes: '',
      },
      areasOfConcern: {
        language_expression: null,
        language_comprehension: null,
        social_communication: null,
        voice: null,
        fluency: null,
        stuttering: null,
        suspected_cas: null,
        literacy: null,
        reluctant_speaking: null,
        cleft_lip_pallet: null,
        diagnoses: null,
      },
      language_concerns: '',
      voice_quality: '',
      fluency_notes: '',
      overall_observations: '',

      general_articulation_notes: '',
      overall_notes: '',
      other_notes: '',
      qualifies_for_speech_program: false,
      absent: {
        isAbsent: false,
        notes: '',
      },
      priority_re_screen: false,
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
    if (currentStep === 1 && !data.absent?.isAbsent) {
      return
    }
    if (currentStep === 2 && data.absent?.isAbsent) {
      // If we're on step 2 but absent is checked, we should have submitted from step 1
      return
    }

    // Return the result as-is
    const mapResult = (result: string): string | null => {
      return result || null
    }

    const screeningData = {
      student_id: selectedStudent?.id || '',
      grade_id: selectedGradeId,
      screener_id: user?.id || '',
      result: mapResult(data.speech_screen_result),
      vocabulary_support: data.vocabulary_support || false,
      suspected_cas: data.suspected_cas || false,
      clinical_notes: data.clinical_notes || '',
      referral_notes: data.referral_notes || '',
      attendance: data.attendance || '',
      // Add speech-specific fields
      articulation: data.articulation || { soundErrors: [], articulationNotes: '' },
      areasOfConcern: data.areasOfConcern || {},
      language_concerns: data.language_concerns || '',
      voice_quality: data.voice_quality || '',
      fluency_notes: data.fluency_notes || '',
      overall_observations: data.overall_observations || '',
      other_notes: data.other_notes || '',
      qualifies_for_speech_program: data.qualifies_for_speech_program || false,
      absent: data.absent || { isAbsent: false, notes: '' },
      priority_re_screen: data.priority_re_screen || false,
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
    return form.watch('absent.isAbsent') && selectedGrade && selectedStudent
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
              form.watch('absent.isAbsent') ? (
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
