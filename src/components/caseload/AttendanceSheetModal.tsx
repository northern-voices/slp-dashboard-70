import { useRef } from 'react'
import { useForm } from 'react-hook-form'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { useToast } from '@/hooks/use-toast'
import { useUploadDocument } from '@/hooks/documents/use-documents'
import { Upload, Loader2, CheckCircle2 } from 'lucide-react'

interface AttendanceSheetModalProps {
  isOpen: boolean
  onClose: () => void
  schoolId: string
}

interface FormValues {
  additional_notes: string
}

const AttendanceSheetModal = ({ isOpen, onClose, schoolId }: AttendanceSheetModalProps) => {
  const { toast } = useToast()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const uploadMutation = useUploadDocument(schoolId)

  const form = useForm<FormValues>({
    defaultValues: { additional_notes: '' },
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

    await uploadMutation.mutateAsync(
      {
        type: 'attendance_sheet',
        data: {
          file,
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
}
