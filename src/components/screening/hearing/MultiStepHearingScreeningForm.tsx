import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Button } from '@/components/ui/button'
import { Student } from '@/types/database'
import { ScreeningFormData } from '@/types/screening'
import HearingScreeningStep1 from './steps/HearingScreeningStep1'

interface HearingScreeningFormValues {
  screening_type: string
  screening_date: string
  screening_result: string
  right_vol: string | null
  right_compliance: string | null
  right_press: string | null
  left_vol: string | null
  left_compliance: string | null
  left_press: string | null
  clinical_notes: string
  referral_notes: string
}

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

  const form = useForm<HearingScreeningFormValues>({
    defaultValues: {
      screening_type: 'initial' as const,
      screening_date: new Date().toISOString().split('T')[0],
      screening_result: '',
      // Tympanometry fields
      right_vol: '',
      right_compliance: '',
      right_press: '',
      left_vol: '',
      left_compliance: '',
      left_press: '',
      // Notes fields
      clinical_notes: '',
      referral_notes: '',
    },
  })

  const parseOrNull = (val: string | null): number | null => {
    if (val === null || val === '') return null
    const num = parseFloat(val)
    return isNaN(num) ? null : num
  }

  const handleSubmit = data => {
    const screeningData: ScreeningFormData = {
      screening_type: data.screening_type,
      student_id: selectedStudent?.id || '',
      screening_date: data.screening_date,
      form_type: 'hearing',
      selected_grade: selectedGrade,
      result: data.screening_result || undefined,
      hearing_data: {
        tympanometry_results: {
          right_ear: {
            vol: parseOrNull(data.right_vol),
            comp: parseOrNull(data.right_compliance),
            press: parseOrNull(data.right_press),
          },
          left_ear: {
            vol: parseOrNull(data.left_vol),
            comp: parseOrNull(data.left_compliance),
            press: parseOrNull(data.left_press),
          },
        },
      },
      clinical_notes: data.clinical_notes || '',
      referral_notes: data.referral_notes || '',
      general_notes: '',
      recommendations: '',
      follow_up_required: false,
    }

    onSubmit(screeningData)
  }

  const hasScreeningResult = form.watch('screening_result')
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
