import { useRef, useState } from 'react'
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
import { useUploadDocument } from '@/hooks/students/use-documents'
import { DocumentType } from '@/api/documents'
import { Student } from '@/types/database'
import { Upload, Loader2, CheckCircle2, X } from 'lucide-react'

interface DocumentModalProps {
  isOpen: boolean
  onClose: () => void
  student: Student
}

interface DocumentFormValues {
  additional_notes: string
}

interface SelectedFile {
  key: string
  file: File
  documentType: DocumentType | ''
}

const DocumentModal = ({ isOpen, onClose, student }: DocumentModalProps) => {
  const [selectedFiles, setSelectedFiles] = useState<SelectedFile[]>([])

  const { toast } = useToast()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const uploadMutation = useUploadDocument(student.id)

  const form = useForm<DocumentFormValues>({
    defaultValues: {
      additional_notes: '',
    },
  })

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = Array.from(e.target.files ?? [])
    if (selected.length > 0) {
      setSelectedFiles(prev => [
        ...prev,
        ...selected.map(file => ({
          key: `${file.name}-${file.size}-${Date.now()}-${Math.random()}`,
          file,
          documentType: '' as DocumentType | '',
        })),
      ])
    }
  }

  const removeFile = (key: string) => {
    setSelectedFiles(prev => prev.filter(f => f.key !== key))
  }

  const updateFileType = (key: string, documentType: DocumentType) => {
    setSelectedFiles(prev => prev.map(f => (f.key === key ? { ...f, documentType } : f)))
  }

  const handleClose = () => {
    form.reset()
    setSelectedFiles([])
    if (fileInputRef.current) fileInputRef.current.value = ''
    onClose()
  }

  const allFilesHaveType = selectedFiles.length > 0 && selectedFiles.every(f => f.documentType)

  const handleSubmit = async () => {
    const values = form.getValues()

    if (selectedFiles.length === 0) {
      toast({
        title: 'No files selected',
        description: 'Choose at least one file to upload.',
        variant: 'destructive',
      })
      return
    }

    if (!allFilesHaveType) {
      toast({
        title: 'Missing document type',
        description: 'Select a type for every file before uploading.',
        variant: 'destructive',
      })
      return
    }

    await uploadMutation.mutateAsync(
      {
        additional_notes: values.additional_notes || undefined,
        files: selectedFiles.map(f => ({
          file: f.file,
          documentType: f.documentType as DocumentType,
        })),
      },
      {
        onSuccess: () => {
          toast({ title: 'Document saved', description: 'The document has been recorded.' })
          handleClose()
        },
        onError: () => {
          toast({
            title: 'Error',
            description: 'Failed to save document. Please try again.',
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
          <DialogTitle>Add Document</DialogTitle>
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

          {/* Files */}
          <div className='space-y-2'>
            <Label>Files</Label>
            <div>
              <Button
                type='button'
                variant='outline'
                size='sm'
                onClick={() => fileInputRef.current?.click()}>
                <Upload className='w-4 h-4 mr-2' />
                Choose Files
              </Button>
            </div>
            <input
              ref={fileInputRef}
              type='file'
              multiple
              accept='image/*,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document'
              className='hidden'
              onChange={handleFileChange}
            />

            {selectedFiles.length > 0 && (
              <div className='space-y-2'>
                {selectedFiles.map(f => (
                  <div key={f.key} className='rounded-md border p-2 space-y-2'>
                    <div className='flex items-center justify-between gap-2'>
                      <span className='flex items-center gap-1.5 truncate text-sm'>
                        <CheckCircle2 className='w-4 h-4 shrink-0 text-green-500' />
                        <span className='truncate'>{f.file.name}</span>
                      </span>
                      <button
                        type='button'
                        className='shrink-0 text-muted-foreground hover:text-destructive'
                        onClick={() => removeFile(f.key)}>
                        <X className='h-4 w-4' />
                      </button>
                    </div>
                    <Select
                      value={f.documentType}
                      onValueChange={val => updateFileType(f.key, val as DocumentType)}>
                      <SelectTrigger className='h-9'>
                        <SelectValue placeholder='Select type' />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value='goal_sheet'>Goal Sheet</SelectItem>
                        <SelectItem value='initial_speech_report'>Initial Speech Report</SelectItem>
                        <SelectItem value='progress_speech_report'>Progress Speech Report</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                ))}
              </div>
            )}
          </div>

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
              {uploadMutation.isPending && <Loader2 className='w-4 h-4 mr-2 animate-spin' />}
              Save
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export default DocumentModal
