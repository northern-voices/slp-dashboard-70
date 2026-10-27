import { UseFormReturn } from 'react-hook-form'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
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
import SpeechScreenResultCard from '../SpeechScreenResultCard'
import CollapsibleNotesCard from '@/components/screening/CollapsibleNotesCard'
import { SpeechScreeningFormValues } from '@/types/screening-form'

interface EditScreeningStep2Props {
  form: UseFormReturn<SpeechScreeningFormValues>
  firstName: string
  lastName: string
  selectedGrade: string
  clinicalNotesOpen: boolean
  referralNotesOpen: boolean
  progressNotesOpen: boolean
  onClinicalNotesToggle: () => void
  onReferralNotesToggle: () => void
  onProgressNotesToggle: () => void
}

const EditScreeningStep2 = ({
  form,
  firstName,
  lastName,
  selectedGrade,
  clinicalNotesOpen,
  referralNotesOpen,
  progressNotesOpen,
  onClinicalNotesToggle,
  onReferralNotesToggle,
  onProgressNotesToggle,
}: EditScreeningStep2Props) => {
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
          <div className='mb-4 py-3 px-5 bg-blue-50 rounded-lg border border-blue-200 space-y-2'>
            <div className='flex items-center gap-2'>
              <span className='text-sm font-medium text-blue-900'>Student Name:</span>
              <span className='text-sm font-semibold text-blue-800'>
                {firstName} {lastName}
              </span>
            </div>
            {selectedGrade && (
              <div className='flex items-center gap-2'>
                <span className='text-sm font-medium text-blue-900'>Grade:</span>
                <Badge className='bg-blue-100 text-blue-800 text-xs font-semibold'>
                  {selectedGrade}
                </Badge>
              </div>
            )}
          </div>

          <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
            <div>
              <Label htmlFor='screening_type' className='block mb-2'>
                Screening Type <span className='text-lg text-red-500'>*</span>
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
              <Label htmlFor='screening_date' className='block mb-2'>
                Screening Date <span className='text-lg text-red-500'>*</span>
              </Label>
              <Input
                type='text'
                value={form.watch('screening_date')}
                readOnly
                className='cursor-not-allowed bg-gray-50'
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <EnhancedSpeechScreeningFields form={form} />

      <CollapsibleNotesCard
        title='Clinical Notes (Private) - Not shown on reports'
        open={clinicalNotesOpen}
        onToggle={onClinicalNotesToggle}>
        <div>
          <Label htmlFor='clinical_notes'>Clinical Observations</Label>
          <Textarea
            {...form.register('clinical_notes')}
            placeholder='Enter clinical observations and notes...'
            rows={4}
            className='mt-2'
            onKeyDown={e => {
              if (e.key === 'Enter' && !e.ctrlKey) e.stopPropagation()
            }}
          />
        </div>
      </CollapsibleNotesCard>

      <CollapsibleNotesCard
        title='Recommendations and Referrals (Reports) - Show on summary report'
        open={referralNotesOpen}
        onToggle={onReferralNotesToggle}>
        <Textarea
          {...form.register('referral_notes')}
          placeholder='OT or Comprehensive Language Evaluation or Fluency Evaluation, etc.'
          rows={4}
          onKeyDown={e => {
            if (e.key === 'Enter' && !e.ctrlKey) e.stopPropagation()
          }}
        />
      </CollapsibleNotesCard>

      <CollapsibleNotesCard
        title='Progress Notes - Show on progress report'
        open={progressNotesOpen}
        onToggle={onProgressNotesToggle}>
        <Textarea
          {...form.register('progress_notes')}
          placeholder='EA / Teacher Feedback or progress noted (vocabulary), participation'
          rows={4}
          onKeyDown={e => {
            if (e.key === 'Enter' && !e.ctrlKey) e.stopPropagation()
          }}
        />
      </CollapsibleNotesCard>

      <SpeechScreenResultCard form={form} />
    </div>
  )
}

export default EditScreeningStep2
