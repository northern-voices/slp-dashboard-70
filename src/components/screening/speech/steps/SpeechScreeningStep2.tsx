import React from 'react'
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

interface SpeechScreeningStep2Props {
  form: UseFormReturn
}

const SpeechScreeningStep2 = ({ form }: SpeechScreeningStep2Props) => {
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
          <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
            <div>
              <Label htmlFor='screening_type' className='mb-2 block'>
                Screening Type *
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
                Screening Date *
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
          <CardTitle className='flex items-center gap-2'>Final Details</CardTitle>
        </CardHeader>
        <CardContent className='space-y-6'>
          <div>
            <Label htmlFor='clinical_notes'>Clinical Notes (Private)</Label>
            <Textarea
              {...form.register('clinical_notes')}
              placeholder='Enter private clinical observations and notes...'
              rows={4}
              className='mt-1'
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

          <div>
            <Label htmlFor='referral_notes'>Recommendations and referrals (Reports)</Label>
            <Textarea
              {...form.register('referral_notes')}
              placeholder='Enter referral information and recommendations...'
              rows={4}
              className='mt-1'
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

          <div>
            <Label htmlFor='attendance'>Attendance (Reports)</Label>
            <Textarea
              {...form.register('attendance')}
              placeholder='Enter attendance information...'
              rows={3}
              className='mt-1'
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
          <CardTitle>Other</CardTitle>
        </CardHeader>
        <CardContent>
          <div>
            <Label htmlFor='other_notes'>Additional Notes</Label>
            <Textarea
              {...form.register('other_notes')}
              placeholder='Enter any additional notes or observations...'
              rows={4}
              className='mt-1'
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
    </div>
  )
}

export default SpeechScreeningStep2
