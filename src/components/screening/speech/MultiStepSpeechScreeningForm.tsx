import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Button } from '@/components/ui/button'
import { Student } from '@/types/database'
import { useCreateSpeechScreening } from '@/hooks/screenings'
import { useAuth } from '@/contexts/AuthContext'
import ProgressIndicator from '../shared/ProgressIndicator'
import SpeechScreeningStep1 from './steps/SpeechScreeningStep1'
import SpeechScreeningStep2 from './steps/SpeechScreeningStep2'
import SpeechScreeningStep3 from './steps/SpeechScreeningStep3'

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

  const form = useForm({
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
      sound_errors: [],
      articulation_notes: '',
      language_concerns: '',
      voice_quality: '',
      fluency_notes: '',
      overall_observations: '',
    },
  })

  const stepTitles = ['Student Info', 'Screening Details', 'Results & Notes']

  const handleNext = () => {
    if (currentStep < 3) {
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

  // Add this debugging version to your MultiStepSpeechScreeningForm handleSubmit function

  const handleSubmit = (data: any) => {
    console.log('=== FORM SUBMISSION DEBUG ===')
    console.log('Form data:', data)
    console.log('Selected student:', selectedStudent)
    console.log('Selected grade ID:', selectedGradeId)
    console.log('User:', user)

    // Check for required data
    if (!selectedStudent) {
      console.error('❌ Missing selectedStudent')
      return
    }

    if (!selectedGradeId) {
      console.error('❌ Missing selectedGradeId')
      return
    }

    if (!user?.id) {
      console.error('❌ Missing user.id')
      return
    }

    // Validate UUIDs
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

    if (!uuidRegex.test(selectedStudent.id)) {
      console.error('❌ Invalid student.id format:', selectedStudent.id)
      return
    }

    if (!uuidRegex.test(selectedGradeId)) {
      console.error('❌ Invalid selectedGradeId format:', selectedGradeId)
      return
    }

    if (!uuidRegex.test(user.id)) {
      console.error('❌ Invalid user.id format:', user.id)
      return
    }

    console.log('✅ All UUIDs are valid')

    // Map form result to database result format
    const mapResult = (result: string): 'P' | 'M' | 'Q' | 'NR' | 'NC' | 'C' | null => {
      switch (result) {
        case 'absent':
          return 'P' // Pass
        case 'present':
          return 'Q' // Qualified for further evaluation
        case 'inconclusive':
          return 'M' // Mixed/Inconclusive
        case 'refused':
          return 'NR' // No Response
        default:
          return null
      }
    }

    // Build error_patterns object from speech screening data
    const errorPatterns = {
      sound_errors: data.sound_errors || [],
      articulation_notes: data.articulation_notes || '',
      language_concerns: data.language_concerns || '',
      voice_quality: data.voice_quality || '',
      fluency_notes: data.fluency_notes || '',
      overall_observations: data.overall_observations || '',
    }

    const mutationData = {
      student_id: selectedStudent.id,
      screener_id: user.id,
      grade_id: selectedGradeId,
      error_patterns: errorPatterns,
      result: mapResult(data.speech_screen_result),
      vocabulary_support: data.vocabulary_support || false,
      suspected_cas: data.suspected_cas || false,
      clinical_notes: data.clinical_notes || null,
      referral_notes: data.referral_notes || null,
    }

    console.log('Final mutation data:', mutationData)
    console.log('=== END DEBUG ===')

    createScreening.mutate(mutationData, {
      onSuccess: newScreening => {
        console.log('✅ Speech screening created successfully:', newScreening)
        if (onSubmit) {
          onSubmit(newScreening)
        }
      },
      onError: error => {
        console.error('❌ Failed to create speech screening:', error)
        // Log the full error for debugging
        console.error('Full error object:', JSON.stringify(error, null, 2))
      },
    })
  }

  const canProceedToNext = () => {
    if (currentStep === 1) {
      return selectedGrade && selectedStudent && selectedGradeId
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
      case 3:
        return <SpeechScreeningStep3 form={form} />
      default:
        return null
    }
  }

  return (
    <div className='space-y-6'>
      <ProgressIndicator currentStep={currentStep} totalSteps={3} stepTitles={stepTitles} />

      <form onSubmit={form.handleSubmit(handleSubmit)} className='space-y-6'>
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

            {currentStep < 3 ? (
              <Button
                type='button'
                onClick={handleNext}
                disabled={!canProceedToNext()}
                className='bg-primary hover:bg-primary/90 text-primary-foreground'>
                Next
              </Button>
            ) : (
              <Button
                type='submit'
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
