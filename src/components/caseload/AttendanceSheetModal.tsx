import { useRef } from 'react'
import { useForm } from 'react-hook-form'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { useToast } from '@/hooks/use-toast'
import { useUploadDocument } from '@/hooks/documents/use-documents'
import { Upload, Loader2, CheckCircle2 } from 'lucide-react'

interface AttendanceSheetModalProps {
  isOpen: boolean
  onClose: () => void
  schoolId: string
}

interface FormValues {
  sheet_date: string
  additional_notes: string
}

const AttendanceSheetModal = ({ isOpen, onClose, schoolId }: AttendanceSheetModalProps) => {
  const { toast } = useToast()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const uploadMutation = useUploadDocument(schoolId)

  const form = useForm<FormValues>({
    defaultValues: { sheet_date: '', additional_notes: '' },
  })

  const file = form.watch('file' as keyof FormValues) as unknown as File | undefined

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0]
    if (selected) {
      form.setValue('file' as keyof FormValues, selected as unknown as string)
    }
  }

  const handleClose = () => {
    form.reset()
    if (fileInputRef.current) fileInputRef.current.value = ''
    onClose()
  }

  const handleSubmit = async () => {
    if (!file) {
      toast({
        title: 'Missing file',
        description: 'Please select an image to upload.',
        variant: 'destructive',
      })
      return
    }

    const values = form.getValues()

    if (!values.sheet_date) {
      toast({
        title: 'Missing field',
        description: 'Please select a month for this sheet.',
        variant: 'destructive',
      })

      return
    }

    await uploadMutation.mutateAsync(
      {
        type: 'attendance_sheet',
        data: {
          file,
          sheet_date: values.sheet_date + '-01',
          additional_notes: values.additional_notes || undefined,
        },
      },
      {
        onSuccess: () => {
          toast({ title: 'Attendance sheet uploaded' })
          handleClose()
        },
        onError: () => {
          toast({
            title: 'Error',
            description: 'Failed to upload. Please try again.',
            variant: 'destructive',
          })
        },
      }
    )
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className='max-w-md'>
        <DialogHeader>
          <DialogTitle>Upload Attendance Sheet</DialogTitle>
        </DialogHeader>

        <form
          onSubmit={e => {
            e.preventDefault()
            e.stopPropagation()
            return false
          }}
          className='space-y-4'>
          <div className='space-y-2'>
            <Label>
              File <span className='text-destructive'>*</span>
            </Label>
            <div className='flex items-center gap-3'>
              <Button
                type='button'
                variant='outline'
                size='sm'
                onClick={() => fileInputRef.current?.click()}>
                <Upload className='w-4 h-4 mr-2' />
                Choose File
              </Button>
              {file && (
                <span className='flex items-center gap-1 text-sm text-muted-foreground'>
                  <CheckCircle2 className='w-4 h-4 text-green-500' />
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

          <div className='space-y-1'>
            <Label htmlFor='sheet-date'>
              Month <span className='text-destructive'>*</span>
            </Label>
            <Input id='sheet-date' type='month' {...form.register('sheet_date')} />
          </div>

          <div className='space-y-1'>
            <Label htmlFor='notes'>Notes</Label>
            <Textarea
              id='notes'
              placeholder='Any additional notes...'
              rows={3}
              {...form.register('additional_notes')}
            />
          </div>

          <div className='flex justify-end gap-2 pt-2'>
            <Button type='button' variant='outline' onClick={handleClose}>
              Cancel
            </Button>
            <Button type='button' onClick={handleSubmit} disabled={uploadMutation.isPending}>
              {uploadMutation.isPending && <Loader2 className='w-4 h-4 mr-2 animate-spin' />}
              Upload
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export default AttendanceSheetModal
