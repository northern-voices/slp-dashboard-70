import { UseFormReturn } from 'react-hook-form'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { SpeechScreeningFormValues } from '@/types/screening-form'

interface SpeechScreenResultCardProps {
  form: UseFormReturn<SpeechScreeningFormValues>
}

const SpeechScreenResultCard = ({ form }: SpeechScreenResultCardProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Speech Screen Result</CardTitle>
      </CardHeader>
      <CardContent>
        <div className='space-y-4'>
          <div className='flex flex-col gap-1'>
            <Label htmlFor='speech_screen_result'>
              Result <span className='text-red-500 text-lg'>*</span>
            </Label>
            <Select
              value={form.watch('speech_screen_result') || ''}
              onValueChange={value => {
                form.setValue('speech_screen_result', value)
                form.trigger('speech_screen_result')
              }}>
              <SelectTrigger>
                <SelectValue placeholder='Select result' />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='no_errors'>No Errors</SelectItem>
                <SelectItem value='age_appropriate'>Age Appropriate</SelectItem>
                {/* <SelectItem value='monitor'>Monitor (Age Appropriate)</SelectItem> // TODO Lisa said to remove this for now */}
                <SelectItem value='mild'>Mild</SelectItem>
                <SelectItem value='moderate'>Moderate</SelectItem>
                <SelectItem value='severe'>Severe</SelectItem>
                <SelectItem value='profound'>Profound</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className='flex items-center space-x-2'>
            <Checkbox
              id='does_not_qualify'
              checked={!form.watch('qualifies_for_speech_program') && !form.watch('sub')}
              onCheckedChange={checked => {
                if (checked) {
                  form.setValue('qualifies_for_speech_program', false)
                  form.setValue('sub', false)
                }
              }}
            />
            <Label htmlFor='does_not_qualify' className='text-sm font-medium'>
              Does not qualify
            </Label>
          </div>

          <div className='flex items-center space-x-2'>
            <Checkbox
              id='qualifies_for_speech_program'
              checked={form.watch('qualifies_for_speech_program') || false}
              onCheckedChange={checked => {
                form.setValue('qualifies_for_speech_program', checked as boolean)
                if (checked) form.setValue('sub', false)
              }}
            />
            <Label htmlFor='qualifies_for_speech_program' className='text-sm font-medium'>
              Qualifies - Primary Caseload
            </Label>
          </div>

          <div className='flex items-center space-x-2'>
            <Checkbox
              id='sub'
              checked={form.watch('sub') || false}
              onCheckedChange={checked => {
                form.setValue('sub', checked as boolean)
                if (checked) form.setValue('qualifies_for_speech_program', false)
              }}
            />
            <Label htmlFor='sub' className='text-sm font-medium'>
              Qualifies - Sub
            </Label>
          </div>

          <div className='flex items-center space-x-2'>
            <Checkbox
              id='vocabulary_support_recommended'
              checked={form.watch('vocabulary_support_recommended') || false}
              onCheckedChange={checked => {
                form.setValue('vocabulary_support_recommended', checked as boolean)
              }}
            />
            <Label htmlFor='vocabulary_support_recommended' className='text-sm font-medium'>
              Vocabulary Support Recommended (Language Ladder)
            </Label>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default SpeechScreenResultCard
