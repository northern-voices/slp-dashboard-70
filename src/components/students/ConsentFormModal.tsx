import { useRef } from 'react'
import { useForm } from 'react-hook-form'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { useToast } from '@/hooks/use-toast'
import { useUploadConsentForm } from '@/hooks/students/use-consent-forms'
import { ConsentPurpose, ConsentType } from '@/api/consentForms'
import { Student } from '@/types/database'
import { Upload, Loader2, CheckCircle2 } from 'lucide-react'

interface ConsentFormModalProps {
  isOpen: boolean
  onClose: () => void
  student: Student
}

interface ConsentFormValues {
  consent_date: string
  consent_purpose: ConsentPurpose | ''
  consent_type: ConsentType | ''
  verbal_consent_details: string
  additional_notes: string
}

const today = () => new Date().toISOString().split('T')[0]
const minDate = () => new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]

const ConsentFormModal = ({ isOpen, onClose, student }: ConsentFormModalProps) => {
  const { toast } = useToast()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const uploadMutation = useUploadConsentForm(student.id)

  const form = useForm<ConsentFormValues>({
    defaultValues: {
      consent_date: today(),
      consent_purpose: '',
      consent_type: '',
      verbal_consent_details: '',
      additional_notes: '',
    },
  })

  const consentType = form.watch('consent_type')
  const file = form.watch('file' as keyof ConsentFormValues) as unknown as File | undefined

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0]
    if (selected) {
      form.setValue('file' as keyof ConsentFormValues, selected as unknown as string)
    }
  }

  const handleClose = () => {
    form.reset()
    if (fileInputRef.current) fileInputRef.current.value = ''
    onClose()
  }

  const handleSubmit = async () => {
    const values = form.getValues()

    if (!values.consent_purpose) {
      toast({
        title: 'Missing field',
        description: 'Please select a consent purpose.',
        variant: 'destructive',
      })
      return
    }
    if (!values.consent_type) {
      toast({
        title: 'Missing field',
        description: 'Please select a consent type.',
        variant: 'destructive',
      })
      return
    }
    if (values.consent_type === 'verbal' && !values.verbal_consent_details.trim()) {
      toast({
        title: 'Missing field',
        description: 'Please enter verbal consent details.',
        variant: 'destructive',
      })
      return
    }
    if (values.consent_type === 'written' && !file) {
      toast({
        title: 'Missing file',
        description: 'Please upload a file for written consent.',
        variant: 'destructive',
      })
      return
    }

    await uploadMutation.mutateAsync(
      {
        consent_date: values.consent_date,
        consent_purpose: values.consent_purpose as ConsentPurpose,
        consent_type: values.consent_type as ConsentType,
        verbal_consent_details:
          values.consent_type === 'verbal' ? values.verbal_consent_details : undefined,
        additional_notes: values.additional_notes || undefined,
        file: values.consent_type === 'written' ? file : undefined,
      },
      {
        onSuccess: () => {
          toast({ title: 'Consent form saved', description: 'The consent form has been recorded.' })
          handleClose()
        },
        onError: () => {
          toast({
            title: 'Error',
            description: 'Failed to save consent form. Please try again.',
            variant: 'destructive',
          })
        },
      }
    )
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className='max-w-lg'>
        <DialogHeader>
          <DialogTitle>Add Consent Form</DialogTitle>
        </DialogHeader>

        <form
          onSubmit={e => {
            e.preventDefault()
            e.stopPropagation()
            return false
          }}
          className='space-y-4'>
          {/* Student Info — read only */}
          <div className='grid grid-cols-2 gap-4'>
            <div className='space-y-1'>
              <Label>Student Name</Label>
              <Input
                value={`${student.first_name} ${student.last_name}`}
                disabled
                className='bg-muted'
              />
            </div>
            <div className='space-y-1'>
              <Label>Grade</Label>
              <Input value={student.grade || '—'} disabled className='bg-muted' />
            </div>
          </div>

          {/* Consent Date */}
          <div className='space-y-1'>
            <Label htmlFor='consent-date'>
              Date <span className='text-destructive'>*</span>
            </Label>
            <Input
              id='consent-date'
              type='date'
              min={minDate()}
              max={today()}
              {...form.register('consent_date', { required: true })}
            />
          </div>

          {/* Consent Purpose */}
          <div className='space-y-1'>
            <Label>
              Purpose <span className='text-destructive'>*</span>
            </Label>
            <Select
              value={form.watch('consent_purpose')}
              onValueChange={val => form.setValue('consent_purpose', val as ConsentPurpose)}>
              <SelectTrigger>
                <SelectValue placeholder='Select purpose' />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='screening_assessment'>Screening / Assessment</SelectItem>
                <SelectItem value='therapy'>Therapy</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Consent Type */}
          <div className='space-y-1'>
            <Label>
              Type of Consent <span className='text-destructive'>*</span>
            </Label>
            <Select
              value={form.watch('consent_type')}
              onValueChange={val => {
                form.setValue('consent_type', val as ConsentType)
                form.setValue('verbal_consent_details', '')
                form.setValue('file' as keyof ConsentFormValues, undefined as unknown as string)
                if (fileInputRef.current) fileInputRef.current.value = ''
              }}>
              <SelectTrigger>
                <SelectValue placeholder='Select consent type' />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='verbal'>Verbal Consent</SelectItem>
                <SelectItem value='written'>Written Consent</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Verbal — details textarea */}
          {consentType === 'verbal' && (
            <div className='space-y-1'>
              <Label htmlFor='verbal-details'>
                Verbal Consent Details <span className='text-destructive'>*</span>
              </Label>
              <Textarea
                id='verbal-details'
                placeholder='Describe the verbal consent given...'
                rows={3}
                {...form.register('verbal_consent_details')}
              />
            </div>
          )}

          {/* Written — file upload */}
          {consentType === 'written' && (
            <div className='space-y-2'>
              <Label>
                Upload Form <span className='text-destructive'>*</span>
              </Label>
              <div className='flex items-center gap-3'>
                <Button
                  type='button'
                  variant='outline'
                  size='sm'
                  onClick={() => fileInputRef.current?.click()}>
                  <Upload className='mr-2 h-4 w-4' />
                  Choose File
                </Button>
                {file && (
                  <span className='flex items-center gap-1 text-sm text-muted-foreground'>
                    <CheckCircle2 className='h-4 w-4 text-green-500' />
                    {(file as File).name}
                  </span>
                )}
              </div>
              <input
                ref={fileInputRef}
                type='file'
                accept='image/*'
                className='hidden'
                onChange={handleFileChange}
              />
            </div>
          )}

          {/* Additional Notes */}
          <div className='space-y-1'>
            <Label htmlFor='additional-notes'>Additional Notes</Label>
            <Textarea
              id='additional-notes'
              placeholder='Any additional notes...'
              rows={2}
              {...form.register('additional_notes')}
            />
          </div>

          {/* Actions */}
          <div className='flex justify-end gap-2 pt-2'>
            <Button type='button' variant='outline' onClick={handleClose}>
              Cancel
            </Button>
            <Button type='button' onClick={handleSubmit} disabled={uploadMutation.isPending}>
              {uploadMutation.isPending && <Loader2 className='mr-2 h-4 w-4 animate-spin' />}
              Save
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export default ConsentFormModal
