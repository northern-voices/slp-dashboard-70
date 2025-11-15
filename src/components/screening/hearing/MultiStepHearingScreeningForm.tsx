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

  const handleSubmit = (data: any) => {
    console.log('Hearing screening submitted:', data)

    const screeningData: ScreeningFormData = {
      screening_type: data.screening_type,
      student_id: selectedStudent?.id || '',
      screening_date: data.screening_date,
      form_type: 'hearing',
      hearing_data: {
        tympanometry_results: {
          right_ear: {
            vol: parseFloat(data.right_vol) || 0,
            comp: parseFloat(data.right_compliance) || 0,
            press: parseFloat(data.right_press) || 0,
          },
          left_ear: {
            vol: parseFloat(data.left_vol) || 0,
            comp: parseFloat(data.left_compliance) || 0,
            press: parseFloat(data.left_press) || 0,
          },
        },
      },
      clinical_notes: data.clinical_notes || '',
      referral_notes: data.referral_notes || '',
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
