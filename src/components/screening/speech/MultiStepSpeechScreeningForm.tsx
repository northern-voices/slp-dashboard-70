import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Button } from '@/components/ui/button'
import { Student } from '@/types/database'
import { ScreeningFormData } from '@/types/screening'
import ProgressIndicator from '../shared/ProgressIndicator'
import SpeechScreeningStep1 from './steps/SpeechScreeningStep1'
import SpeechScreeningStep2 from './steps/SpeechScreeningStep2'
import SpeechScreeningStep3 from './steps/SpeechScreeningStep3'

interface MultiStepSpeechScreeningFormProps {
  onSubmit: (data: ScreeningFormData) => void
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
  const [selectedGrade, setSelectedGrade] = useState<string>(existingStudent?.grade || '')

  const form = useForm({
    defaultValues: {
      screening_type: 'initial',
      screening_date: new Date().toISOString().split('T')[0],
      speech_screen_result: '',
      vocabulary_support: false,
      suspected_cas: false,
      clinical_notes: '',
      recommendations_referrals: '',
      attendance: '',
      // Speech screening fields
      sound_errors: [],
      articulation_notes: '',
      language_concerns: '',
      voice_quality: '',
      fluency_notes: '',
      overall_observations: '',
      general_notes: '',
      recommendations: '',
      follow_up_required: false,
      follow_up_date: '',
    },
  })

  // TODO: Handle the create speech screening mutation here
  // const createScreening = useCreateSpeechScreening()

  // const handleSubmit = () => {
  //   createScreening.mutate({
  //     student_id: "123",
  //     screener_id: "456",
  //     grade_id: "789",
  //     result: "P",
  //     vocabulary_support: true,
  //     clinical_notes: "Student performed well"
  //   })
  // }

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

  const handleSubmit = (data: any) => {
    console.log('Speech screening submitted:', data)

    const screeningData: ScreeningFormData = {
      screening_type: data.screening_type || 'initial',
      student_id: selectedStudent?.id || '',
      screening_date: data.screening_date || new Date().toISOString().split('T')[0],
      form_type: 'speech',
      speech_data: {
        sound_errors: data.sound_errors || [],
        articulation_notes: data.articulation_notes || '',
        language_concerns: data.language_concerns || '',
        voice_quality: data.voice_quality || '',
        fluency_notes: data.fluency_notes || '',
        overall_observations: data.overall_observations || '',
      },
      general_notes: data.general_notes || '',
      recommendations: data.recommendations || '',
      follow_up_required: data.follow_up_required || false,
      follow_up_date: data.follow_up_date,
    }

    onSubmit(screeningData)
  }

  const canProceedToNext = () => {
    if (currentStep === 1) {
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
                className='bg-primary hover:bg-primary/90 text-primary-foreground'>
                Submit Screening
              </Button>
            )}
          </div>
        </div>
      </form>
    </div>
  )
}

export default MultiStepSpeechScreeningForm
