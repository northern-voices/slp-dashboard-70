import React from 'react'
import { UseFormReturn } from 'react-hook-form'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { Volume2, FileText } from 'lucide-react'

interface HearingScreeningStep2Props {
  form: UseFormReturn<any>
}

const frequencies = ['250', '500', '1000', '2000', '4000']

const HearingScreeningStep2 = ({ form }: HearingScreeningStep2Props) => {
  return (
    <div className='space-y-6'>
      <Card className='border-0 rounded-none shadow-none'>
        <CardHeader className='px-0 pt-0 pb-0 mb-6'>
          <CardTitle className='flex items-center gap-2 text-lg font-semibold text-gray-900'>
            <Volume2 className='w-5 h-5' />
            Screening Details
          </CardTitle>
        </CardHeader>
        <CardContent className='space-y-6 p-0'>
          <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
            <div>
              <Label
                htmlFor='screening_type'
                className='mb-3 block text-sm font-medium text-gray-700'>
                Screening Type *
              </Label>
              <Select {...form.register('screening_type')}>
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
              <Label
                htmlFor='screening_date'
                className='mb-3 block text-sm font-medium text-gray-700'>
                Screening Date *
              </Label>
              <Input type='date' {...form.register('screening_date')} />
            </div>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className='text-lg'>Pure Tone Screening Results</CardTitle>
              <p className='text-sm text-gray-600'>Record hearing threshold levels in dB HL</p>
            </CardHeader>
            <CardContent>
              <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                <div>
                  <h4 className='font-medium mb-3'>Right Ear</h4>
                  <div className='space-y-3'>
                    {frequencies.map(freq => (
                      <div key={`right-${freq}`} className='flex items-center gap-3'>
                        <Label className='w-16'>{freq} Hz</Label>
                        <Input
                          type='number'
                          placeholder='dB HL'
                          className='w-24'
                          min='0'
                          max='120'
                          {...form.register(`right_ear_${freq}`)}
                        />
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className='font-medium mb-3'>Left Ear</h4>
                  <div className='space-y-3'>
                    {frequencies.map(freq => (
                      <div key={`left-${freq}`} className='flex items-center gap-3'>
                        <Label className='w-16'>{freq} Hz</Label>
                        <Input
                          type='number'
                          placeholder='dB HL'
                          className='w-24'
                          min='0'
                          max='120'
                          {...form.register(`left_ear_${freq}`)}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className='text-lg'>Tympanometry Results</CardTitle>
            </CardHeader>
            <CardContent>
              <div className='space-y-4'>
                <Textarea
                  placeholder='Note tympanometry findings, ear canal volume, acoustic reflex results...'
                  rows={3}
                  {...form.register('tympanometry_results')}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className='text-lg'>Otoscopic Examination</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                placeholder='Describe ear canal and eardrum appearance for both ears...'
                rows={3}
                {...form.register('otoscopic_findings')}
              />
            </CardContent>
          </Card>
        </CardContent>
      </Card>

      <Card className='border-0 rounded-none shadow-none'>
        <CardHeader className='px-0 pt-0 pb-0 mb-6'>
          <CardTitle className='flex items-center gap-2 text-lg font-semibold text-gray-900'>
            <FileText className='w-5 h-5' />
            Results & Notes
          </CardTitle>
        </CardHeader>
        <CardContent className='space-y-6 p-0'>
          <div>
            <Label
              htmlFor='hearing_observations'
              className='mb-3 block text-sm font-medium text-gray-700'>
              Behavioral Observations
            </Label>
            <Textarea
              placeholder="Note student's responses to sounds, following directions, attention during testing, any concerns raised by teacher/parent..."
              rows={4}
              {...form.register('hearing_observations')}
            />
          </div>

          <div>
            <Label htmlFor='general_notes' className='mb-3 block text-sm font-medium text-gray-700'>
              General Notes
            </Label>
            <Textarea
              placeholder='Additional observations, testing conditions, student cooperation...'
              rows={3}
              {...form.register('general_notes')}
            />
          </div>

          <div>
            <Label
              htmlFor='recommendations'
              className='mb-3 block text-sm font-medium text-gray-700'>
              Recommendations
            </Label>
            <Textarea
              placeholder='Recommendations for follow-up, referrals, accommodations...'
              rows={3}
              {...form.register('recommendations')}
            />
          </div>

          <div className='space-y-4'>
            <div className='flex items-center space-x-2'>
              <Checkbox id='follow_up_required' {...form.register('follow_up_required')} />
              <Label htmlFor='follow_up_required' className='text-sm font-medium text-gray-700'>
                Follow-up required
              </Label>
            </div>

            <div>
              <Label
                htmlFor='follow_up_date'
                className='mb-3 block text-sm font-medium text-gray-700'>
                Follow-up Date
              </Label>
              <Input type='date' {...form.register('follow_up_date')} />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default HearingScreeningStep2
