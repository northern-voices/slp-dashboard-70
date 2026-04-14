import { UseFormReturn } from 'react-hook-form'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { SpeechScreeningFormValues } from '@/types/screening-form'

interface SpeechScreenResultCardProps {
  form: UseFormReturn<SpeechScreeningFormValues>
}

const DOES_NOT_QUALIFY_OPTIONS = [
  { value: 'no_errors', label: 'No Errors' },
  { value: 'age_appropriate', label: 'Age Appropriate' },
  { value: 'mild', label: 'Mild' },
  { value: 'moderate', label: 'Moderate' },
  { value: 'severe', label: 'Severe' },
  { value: 'profound', label: 'Profound' },
]

const QUALIFIES_OPTIONS = [
  { value: 'mild', label: 'Mild' },
  { value: 'moderate', label: 'Moderate' },
  { value: 'severe', label: 'Severe' },
  { value: 'profound', label: 'Profound' },
]

const SpeechScreenResultCard = ({ form }: SpeechScreenResultCardProps) => {
  const qualifies = form.watch('qualifies_for_speech_program')
  const sub = form.watch('sub')
  const doesNotQualify = !qualifies && !sub

  const activeOptions = doesNotQualify ? DOES_NOT_QUALIFY_OPTIONS : QUALIFIES_OPTIONS

  return (
    <Card>
      <CardHeader>
        <CardTitle>Speech Screen Result</CardTitle>
      </CardHeader>
      <CardContent>
        <div className='space-y-4'>
          <div className='flex items-center space-x-2'>
            <Checkbox
              id='does_not_qualify'
              checked={!form.watch('qualifies_for_speech_program') && !form.watch('sub')}
              onCheckedChange={checked => {
                if (checked) {
                  form.setValue('qualifies_for_speech_program', false)
                  form.setValue('sub', false)
                  form.setValue('speech_screen_result', '')
                }
              }}
            />
            <Label htmlFor='does_not_qualify' className='text-sm font-medium'>
              Does Not Qualify
            </Label>
          </div>

          <div className='flex items-center space-x-2'>
            <Checkbox
              id='qualifies_for_speech_program'
              checked={form.watch('qualifies_for_speech_program') || false}
              onCheckedChange={checked => {
                form.setValue('qualifies_for_speech_program', checked as boolean)
                if (checked) {
                  form.setValue('sub', false)
                  form.setValue('speech_screen_result', '')
                }
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
                form.setValue('qualifies_for_speech_program', false)
                if (checked) form.setValue('speech_screen_result', '')
              }}
            />
            <Label htmlFor='sub' className='text-sm font-medium'>
              Qualifies - Sub
            </Label>
          </div>

          <div className='pl-2 pt-1'>
            <Label className='text-sm font-medium mb-2 block'>
              Result <span className='text-red-500 text-lg'>*</span>
            </Label>

            <RadioGroup
              value={form.watch('speech_screen_result') || ''}
              onValueChange={value => {
                form.setValue('speech_screen_result', value)
                form.trigger('speech_screen_result')
              }}
              className='space-y-2'>
              {activeOptions.map(option => (
                <div key={option.value} className='flex items-center space-x-2'>
                  <RadioGroupItem value={option.value} id={`result_${option.value}`} />
                  <Label
                    htmlFor={`result_${option.value}`}
                    className='text-sm font-normal cursor-pointer'>
                    {option.label}
                  </Label>
                </div>
              ))}
            </RadioGroup>
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
