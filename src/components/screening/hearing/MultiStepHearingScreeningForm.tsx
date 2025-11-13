import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Button } from '@/components/ui/button'
import { Student } from '@/types/database'
import { ScreeningFormData } from '@/types/screening'
import HearingScreeningStep1 from './steps/HearingScreeningStep1'

interface MultiStepHearingScreeningFormProps {
  onSubmit: (data: ScreeningFormData) => void
  onCancel: () => void
  existingStudent?: Student | null
}

const MultiStepHearingScreeningForm = ({
  onSubmit,
  onCancel,
  existingStudent,
}: MultiStepHearingScreeningFormProps) => {
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(existingStudent || null)
  const [selectedGrade, setSelectedGrade] = useState(existingStudent?.grade || '')

  const form = useForm({
    defaultValues: {
      screening_type: 'initial' as const,
      screening_date: new Date().toISOString().split('T')[0],
      right_ear_250: '',
      right_ear_500: '',
      right_ear_1000: '',
      right_ear_2000: '',
      right_ear_4000: '',
      left_ear_250: '',
      left_ear_500: '',
      left_ear_1000: '',
      left_ear_2000: '',
      left_ear_4000: '',
      tympanometry_results: '',
      otoscopic_findings: '',
      hearing_observations: '',
      general_notes: '',
      recommendations: '',
      follow_up_required: false,
      follow_up_date: '',
    },
  })

  const handleSubmit = (data: any) => {
    console.log('Hearing screening submitted:', data)

    const screeningData: ScreeningFormData = {
      screening_type: data.screening_type,
      student_id: selectedStudent?.id || '',
      screening_date: data.screening_date,
      form_type: 'hearing',
      hearing_data: {
        pure_tone_results: {
          right_ear: {
            '250': parseFloat(data.right_ear_250) || 0,
            '500': parseFloat(data.right_ear_500) || 0,
            '1000': parseFloat(data.right_ear_1000) || 0,
            '2000': parseFloat(data.right_ear_2000) || 0,
            '4000': parseFloat(data.right_ear_4000) || 0,
          },
          left_ear: {
            '250': parseFloat(data.left_ear_250) || 0,
            '500': parseFloat(data.left_ear_500) || 0,
            '1000': parseFloat(data.left_ear_1000) || 0,
            '2000': parseFloat(data.left_ear_2000) || 0,
            '4000': parseFloat(data.left_ear_4000) || 0,
          },
        },
        tympanometry_results: data.tympanometry_results || '',
        observations: data.hearing_observations || '',
      },
      general_notes: data.general_notes || '',
      recommendations: data.recommendations || '',
      follow_up_required: data.follow_up_required || false,
      follow_up_date: data.follow_up_date,
    }

    onSubmit(screeningData)
  }

  const canSubmit = selectedStudent !== null

  return (
    <div className='space-y-6'>
      <form onSubmit={form.handleSubmit(handleSubmit)} className='space-y-6'>
        <HearingScreeningStep1
          form={form}
          selectedStudent={selectedStudent}
          selectedGrade={selectedGrade}
          onStudentSelect={setSelectedStudent}
          onGradeChange={setSelectedGrade}
        />

        <div className='flex justify-between items-center pt-6 border-t'>
          <div className='flex space-x-3'>
            <Button type='button' variant='destructive' onClick={onCancel}>
              Cancel
            </Button>
          </div>

          <div className='flex space-x-3'>
            {/* // TODO: Fix draft functionality */}
            {/* <Button type='button' variant='secondary' onClick={handleSaveDraft}>
              Save Draft
            </Button> */}
            <Button
              type='submit'
              disabled={!canSubmit}
              className='bg-primary hover:bg-primary/90 text-primary-foreground'>
              Submit Screening
            </Button>
          </div>
        </div>
      </form>
    </div>
  )
}

export default MultiStepHearingScreeningForm
