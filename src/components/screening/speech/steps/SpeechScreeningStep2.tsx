import { UseFormReturn } from 'react-hook-form'
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
}

const SpeechScreeningStep2 = ({ form, selectedStudent }: SpeechScreeningStep2Props) => {
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
        <CardHeader>
          <CardTitle>Clinical Notes (Private)</CardTitle>
        </CardHeader>
        <CardContent className='space-y-4'>
          <div>
            <Label htmlFor='clinical_notes'>Clinical Observations</Label>
            <Textarea
              {...form.register('clinical_notes')}
              placeholder='Enter clinical observations and notes...'
              rows={4}
              className='mt-2'
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
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Recommendations and referrals (Reports)</CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            {...form.register('referral_notes')}
            placeholder='Enter recommendations and referrals...'
            rows={4}
            className='-mt-2'
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
      </Card>
    </div>
  )
}

export default SpeechScreeningStep2
