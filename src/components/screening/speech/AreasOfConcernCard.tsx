import { UseFormReturn } from 'react-hook-form'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { areasOfConcern } from './EnhancedSpeechScreeningFieldData'
import { SpeechScreeningFormValues } from '@/types/screening-form'

interface AreasOfConcernCardProps {
  form: UseFormReturn<SpeechScreeningFormValues>
  selectedConcerns: string[]
  areasOfConcernOpen: boolean
  setAreasOfConcernOpen: (open: boolean) => void
  handleConcernChange: (concern: string, checked: boolean) => void
  getFieldName: (concern: string) => string
}

const AreasOfConcernCard = ({
  form,
  selectedConcerns,
  areasOfConcernOpen,
  setAreasOfConcernOpen,
  handleConcernChange,
  getFieldName,
}: AreasOfConcernCardProps) => {
  return (
    <Card>
      <CardHeader
        className='cursor-pointer select-none'
        onClick={() => setAreasOfConcernOpen(!areasOfConcernOpen)}>
        <CardTitle className='flex items-center justify-between'>
          Additional Areas of Concern (Private)
          <span className='text-lg font-normal text-muted-foreground'>
            {areasOfConcernOpen ? '▲ Hide' : '▼ Show'}
          </span>
        </CardTitle>
      </CardHeader>
      {areasOfConcernOpen && (
        <CardContent>
          <div className='space-y-6'>
            {areasOfConcern.map(concern => (
              <div key={concern} className='space-y-3'>
                <div className='flex items-center space-x-2'>
                  <Checkbox
                    id={concern}
                    checked={selectedConcerns.includes(concern)}
                    onCheckedChange={checked => handleConcernChange(concern, checked as boolean)}
                  />
                  <Label htmlFor={concern} className='text-sm font-medium'>
                    {concern}
                  </Label>
                </div>

                {selectedConcerns.includes(concern) && (
                  <div className='ml-6'>
                    <Textarea
                      value={
                        form.watch('error_patterns.add_areas_of_concern')?.[
                          getFieldName(concern)
                        ] || ''
                      }
                      onChange={e => {
                        const current = form.watch('error_patterns.add_areas_of_concern') || {
                          voice: null,
                          fluency: null,
                          literacy: null,
                          suspected_cas: null,
                          cleft_lip_palate: null,
                          reluctant_speaking: null,
                          language_expression: null,
                          language_comprehension: null,
                          known_pending_diagnoses: null,
                          pragmatics_social_communication: null,
                        }

                        form.setValue('error_patterns.add_areas_of_concern', {
                          ...current,
                          [getFieldName(concern)]: e.target.value,
                        })
                      }}
                      placeholder='Details...'
                      rows={3}
                      className='w-full'
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      )}
    </Card>
  )
}

export default AreasOfConcernCard
