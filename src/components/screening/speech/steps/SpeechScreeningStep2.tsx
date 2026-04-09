import { useState } from 'react'
import { UseFormReturn } from 'react-hook-form'
import { Screening } from '@/types/database'
import SpeechScreenResultCard from '../SpeechScreenResultCard'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Calendar } from 'lucide-react'
import EnhancedSpeechScreeningFields from '../EnhancedSpeechScreeningFields'
import { Student } from '@/types/database'
import { SpeechScreeningFormValues } from '@/types/screening-form'

interface SpeechScreeningStep2Props {
  form: UseFormReturn<SpeechScreeningFormValues>
  selectedStudent: Student | null
  initialScreeningData?: Screening | null
}

const SpeechScreeningStep2 = ({
  form,
  selectedStudent,
  initialScreeningData,
}: SpeechScreeningStep2Props) => {
  const [clinicalNotesOpen, setClinicalNotesOpen] = useState(false)
  const [referralNotesOpen, setReferralNotesOpen] = useState(false)

  return (
    <div className='space-y-6'>
      <Card>
        <CardHeader>
          <CardTitle className='flex items-center gap-2'>
            <Calendar className='w-5 h-5' />
            Screening Details
          </CardTitle>
        </CardHeader>
        <CardContent className='space-y-4'>
          {selectedStudent && (
            <div className='mb-4 py-3 px-5 bg-blue-50 rounded-lg border border-blue-200'>
              <div className='flex items-center gap-2'>
                <span className='text-sm font-medium text-blue-900'>Student Name:</span>
                <span className='text-sm font-semibold text-blue-800'>
                  {selectedStudent.first_name} {selectedStudent.last_name}
                </span>
              </div>
            </div>
          )}
          <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
            <div>
              <Label htmlFor='screening_type' className='mb-2 block'>
                Screening Type <span className='text-red-500 text-lg'>*</span>
              </Label>
              <Select
                value={form.watch('screening_type')}
                onValueChange={value => form.setValue('screening_type', value)}>
                <SelectTrigger>
                  <SelectValue placeholder='Select screening type' />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='initial'>Initial</SelectItem>
                  <SelectItem value='progress'>Progress</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor='screening_date' className='mb-2 block'>
                Screening Date <span className='text-red-500 text-lg'>*</span>
              </Label>
              <Input
                type='text'
                value={form.watch('screening_date')}
                readOnly
                className='bg-gray-50 cursor-not-allowed'
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <EnhancedSpeechScreeningFields form={form} />

      <Card>
        <CardHeader
          className='cursor-pointer select-none'
          onClick={() => setClinicalNotesOpen(!clinicalNotesOpen)}>
          <CardTitle className='flex items-center justify-between'>
            Clinical Notes (Private) - Not shown on reports
            <span className='text-lg font-normal text-muted-foreground'>
              {clinicalNotesOpen ? '▲ Hide' : '▼ Show'}
            </span>
          </CardTitle>
        </CardHeader>
        {clinicalNotesOpen && (
          <CardContent className='space-y-4'>
            {initialScreeningData?.clinical_notes && (
              <div className='rounded-md border border-blue-200 bg-blue-50 p-3'>
                <p className='text-xs font-semibold text-blue-700 mb-1'>
                  Previous Clinical Observations
                </p>
                <p className='text-sm text-blue-900 whitespace-pre-wrap'>
                  {initialScreeningData.clinical_notes}
                </p>
              </div>
            )}
            <div>
              <Label htmlFor='clinical_notes'>Clinical Observations</Label>
              <Textarea
                {...form.register('clinical_notes')}
                placeholder='Enter clinical observations and notes...'
                rows={4}
                className='mt-2'
                onKeyDown={e => {
                  // Allow Ctrl+Enter for new lines
                  if (e.key === 'Enter' && e.ctrlKey) {
                    return
                  }
                  if (e.key === 'Enter') {
                    e.stopPropagation()
                  }
                }}
              />
            </div>
          </CardContent>
        )}
      </Card>

      <Card>
        <CardHeader
          className='cursor-pointer select-none'
          onClick={() => setReferralNotesOpen(!referralNotesOpen)}>
          <CardTitle className='flex items-center justify-between'>
            Recommendations and Referrals (Reports) - Show on summary report{' '}
            <span className='text-lg font-normal text-muted-foreground'>
              {referralNotesOpen ? '▲ Hide' : '▼ Show'}
            </span>{' '}
          </CardTitle>
        </CardHeader>
        {referralNotesOpen && (
          <CardContent>
            {initialScreeningData?.referral_notes && (
              <div className='rounded-md border border-blue-200 bg-blue-50 p-3 mb-3'>
                <p className='text-xs font-semibold text-blue-700 mb-1'>
                  Previous Recommendations & Referrals
                </p>
                <p className='text-sm text-blue-900 whitespace-pre-wrap'>
                  {initialScreeningData.referral_notes}
                </p>
              </div>
            )}
            <Textarea
              {...form.register('referral_notes')}
              placeholder='OT or Comprehensive Language Evaluation or Fluency Evaluation, etc.'
              rows={4}
              onKeyDown={e => {
                if (e.key === 'Enter' && e.ctrlKey) {
                  // Allow Ctrl+Enter for new lines
                  return
                }
                if (e.key === 'Enter') {
                  e.stopPropagation() // Prevent form submission
                }
              }}
            />
          </CardContent>
        )}
      </Card>

      <SpeechScreenResultCard form={form} />
    </div>
  )
}

export default SpeechScreeningStep2
