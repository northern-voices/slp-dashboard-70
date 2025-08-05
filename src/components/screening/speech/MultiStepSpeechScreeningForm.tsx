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
      // speech_screen_result: '',
      vocabulary_support: false,
      suspected_cas: false,
      clinical_notes: '',
      referral_notes: '',
      attendance: '',
      // Speech screening fields (for error_patterns)
      sound_errors: [],
      language_concerns: '',
      voice_quality: '',
      fluency_notes: '',
      overall_observations: '',
      language_expression_notes: '',
      language_comprehension_notes: '',
      voice_quality_notes: '',
      stuttering_notes: '',
      social_communication_notes: '',
      suspected_cas_notes: '',
      literacy_notes: '',
      reluctant_speaking_notes: '',
      cleft_notes: '',
      diagnoses_notes: '',
      general_articulation_notes: '',
      overall_notes: '',
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
    // Add this check to prevent submission on wrong step
    if (currentStep !== 2) {
      return
    }

    // Map form result to database enum values
    const mapResult = (
      result: string
    ):
      | 'absent'
      | 'passed'
      | 'mild_moderate'
      | 'severe_profound'
      | 'non_registered_no_consent'
      | 'complex_needs'
      | null => {
      switch (result) {
        case 'absent':
          return 'absent'
        case 'passed':
          return 'passed'
        case 'mild_moderate':
          return 'mild_moderate'
        case 'severe_profound':
          return 'severe_profound'
        case 'complex_needs':
          return 'complex_needs'
        case 'non_registered_no_consent':
          return 'non_registered_no_consent'
        default:
          return null
      }
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
      sound_errors: data.sound_errors || [],
      articulation_notes: data.articulation_notes || '',
      language_concerns: data.language_concerns || '',
      voice_quality: data.voice_quality || '',
      fluency_notes: data.fluency_notes || '',
      overall_observations: data.overall_observations || '',
    }

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
            <Button type='button' variant='outline' onClick={onCancel}>
              Cancel
            </Button>
            {currentStep > 1 && (
              <Button type='button' variant='outline' onClick={handlePrevious}>
                Previous
              </Button>
            )}
          </div>

          <div className='flex space-x-3'>
            <Button type='button' variant='outline' onClick={handleSaveDraft}>
              Save Draft
            </Button>

            {currentStep < 2 ? (
              <Button
                type='button'
                onClick={handleNext}
                disabled={!canProceedToNext()}
                className='bg-primary hover:bg-primary/90 text-primary-foreground'>
                Next
              </Button>
            ) : (
              <Button
                type='button' // Change from 'submit' to 'button'
                onClick={() => {
                  // Get form data and validate
                  const formData = form.getValues()
                  const formErrors = Object.keys(form.formState.errors)

                  if (formErrors.length > 0) {
                    return
                  }

                  // Manually call handleSubmit with form data
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
