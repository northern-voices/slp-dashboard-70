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
