import React from 'react'
import { UseFormReturn } from 'react-hook-form'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { FileText } from 'lucide-react'
import Multiselect from '@/components/ui/multiselect'

interface SpeechScreeningStep3Props {
  form: UseFormReturn<any>
}

// !! This page has been deprecated

const SpeechScreeningStep3 = ({ form }: SpeechScreeningStep3Props) => {
  const supportOptions = [
    'Vocabulary Support (Language Ladder)',
    'Suspected CAS',
    'Additional Speech Support',
    'Language Intervention',
    'Articulation Therapy',
  ]

  const [selectedSupport, setSelectedSupport] = React.useState<string[]>([])

  const vocabularySupport = form.watch('vocabulary_support')
  const suspectedCas = form.watch('suspected_cas')

  // ✅ FIX: Update selectedSupport whenever the form values change
  React.useEffect(() => {
    const currentSupport = []
    if (vocabularySupport) {
      currentSupport.push('Vocabulary Support (Language Ladder)')
    }
    if (suspectedCas) {
      currentSupport.push('Suspected CAS')
    }
    setSelectedSupport(currentSupport)
  }, [vocabularySupport, suspectedCas]) // ✅ Use the watched values, not form.watch() directly

  const handleSupportChange = (selected: string[]) => {
    setSelectedSupport(selected)
    form.setValue('vocabulary_support', selected.includes('Vocabulary Support (Language Ladder)'))
    form.setValue('suspected_cas', selected.includes('Suspected CAS'))
  }

  return (
    <div
      className='space-y-6'
      onKeyDown={e => {
        if (e.key === 'Enter') {
          e.preventDefault()
        }
      }}>
      <Card>
        <CardHeader>
          <CardTitle className='flex items-center gap-2'>
            <FileText className='w-5 h-5' />
            Screening Results & Final Details
          </CardTitle>
        </CardHeader>
        <CardContent className='space-y-6'>
          <div>
            <Label htmlFor='speech_screen_result'>Speech Screen Result *</Label>
            <Select
              value={form.watch('speech_screen_result')}
              onValueChange={value => {
                form.setValue('speech_screen_result', value)
              }}>
              <SelectTrigger>
                <SelectValue placeholder='Select result' />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='absent'>Absent (No speech concerns)</SelectItem>
                <SelectItem value='passed'>Passed (Within normal limits)</SelectItem>
                <SelectItem value='mild_moderate'>Mild/Moderate (Some concerns present)</SelectItem>
                <SelectItem value='severe_profound'>
                  Severe/Profound (Significant concerns)
                </SelectItem>
                <SelectItem value='complex_needs'>
                  Complex Needs (Requires specialized assessment)
                </SelectItem>
                <SelectItem value='non_registered_no_consent'>Non-Registered/No Consent</SelectItem>
              </SelectContent>
            </Select>
            <p className='text-xs text-gray-500 mt-1'>
              Select the appropriate result category based on the screening findings
            </p>
          </div>

          <div className='space-y-3'>
            <Label>Support Options</Label>
            <Multiselect
              options={supportOptions}
              selected={selectedSupport}
              onChange={handleSupportChange}
              placeholder='Select support options...'
              searchPlaceholder='Search support options...'
              emptyMessage='No support options found.'
              showSelectAll={false}
            />
          </div>

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
            <Label htmlFor='referral_notes'>Referral Notes</Label>
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
            <Label htmlFor='attendance'>Attendance (for progress reports)</Label>
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
    </div>
  )
}

export default SpeechScreeningStep3
