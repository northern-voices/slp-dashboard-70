import { useRef, useState } from 'react'
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
import { useToast } from '@/hooks/use-toast'
import { useBulkUploadConsentForms } from '@/hooks/students/use-consent-forms'
import { useStudentsBySchool } from '@/hooks/students/use-students'
import { ConsentPurpose } from '@/api/consentForms'
import { Upload, Loader2, X, FileText } from 'lucide-react'
import StudentPicker from './StudentPicker'

interface BulkConsentFormModalProps {
  isOpen: boolean
  onClose: () => void
  schoolId: string
}

interface FileRow {
  key: string
  file: File
  studentId: string | null
  purpose: ConsentPurpose | null
  parentGuardian: string
  additionalNotes: string
}

const BulkConsentFormModal = ({ isOpen, onClose, schoolId }: BulkConsentFormModalProps) => {
  const { toast } = useToast()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { data: students = [] } = useStudentsBySchool(schoolId)
  const bulkUploadMutation = useBulkUploadConsentForms()

  const [rows, setRows] = useState<FileRow[]>([])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = Array.from(e.target.files ?? [])
    if (selected.length > 0) {
      setRows(prev => [
        ...prev,
        ...selected.map(file => ({
          key: `${file.name}-${file.size}-${Date.now()}-${Math.random()}`,
          file,
          studentId: null,
          purpose: null,
          parentGuardian: '',
          additionalNotes: '',
        })),
      ])
    }
  }

  const removeRow = (key: string) => {
    setRows(prev => prev.filter(row => row.key !== key))
  }

  const updateRow = (key: string, changes: Partial<FileRow>) => {
    setRows(prev => prev.map(row => (row.key === key ? { ...row, ...changes } : row)))
  }

  const handleClose = () => {
    setRows([])
    if (fileInputRef.current) fileInputRef.current.value = ''
    onClose()
  }

  const allRowsAssigned = rows.length > 0 && rows.every(row => row.studentId)
  const allRowsHavePurpose = rows.length > 0 && rows.every(row => row.purpose)

  const handleSubmit = async () => {
    if (rows.length === 0) {
      toast({
        title: 'No files selected',
        description: 'Choose at least one file to upload.',
        variant: 'destructive',
      })
      return
    }

    if (!allRowsAssigned) {
      toast({
        title: 'Missing student',
        description: 'Assign a student to every file before uploading.',
        variant: 'destructive',
      })
      return
    }

    if (!allRowsHavePurpose) {
      toast({
        title: 'Missing purpose',
        description: 'Select a purpose for every file before uploading.',
        variant: 'destructive',
      })

      return
    }

    await bulkUploadMutation.mutateAsync(
      {
        consent_type: 'written',
        verbal_consent_details: undefined,
        entries: rows.map(row => ({
          file: row.file,
          studentId: row.studentId as string,
          purpose: row.purpose as ConsentPurpose,
          parentGuardian: row.parentGuardian || undefined,
          additionalNotes: row.additionalNotes || undefined,
        })),
      },
      {
        onSuccess: () => {
          toast({
            title: 'Consent forms saved',
            description: `${rows.length} consent form${rows.length !== 1 ? 's' : ''} uploaded.`,
          })
          handleClose()
        },
        onError: () => {
          toast({
            title: 'Error',
            description: 'Failed to upload consent forms. Please try again.',
            variant: 'destructive',
          })
        },
      }
    )
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className='max-w-3xl max-h-[90vh] overflow-y-auto'>
        <DialogHeader>
          <DialogTitle>Add Multiple Consent Forms</DialogTitle>
        </DialogHeader>

        <div className='space-y-4'>
          <div className='space-y-1'>
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
              accept='image/*'
              className='hidden'
              onChange={handleFileChange}
            />
          </div>

          {rows.length > 0 && (
            <div className='space-y-2'>
              {rows.map(row => (
                <div key={row.key} className='rounded-md border p-3 space-y-2'>
                  <div className='flex items-center justify-between gap-2'>
                    <span className='flex items-center gap-1.5 truncate text-sm font-medium'>
                      <FileText className='h-4 w-4 shrink-0 text-muted-foreground' />
                      <span className='truncate'>{row.file.name}</span>
                    </span>
                    <button
                      type='button'
                      className='shrink-0 text-muted-foreground hover:text-destructive'
                      onClick={() => removeRow(row.key)}>
                      <X className='h-4 w-4' />
                    </button>
                  </div>

                  <div className='grid grid-cols-2 gap-2'>
                    <StudentPicker
                      students={students}
                      value={row.studentId}
                      onChange={studentId => updateRow(row.key, { studentId })}
                    />

                    <Select
                      value={row.purpose ?? ''}
                      onValueChange={val => updateRow(row.key, { purpose: val as ConsentPurpose })}>
                      <SelectTrigger className='h-9'>
                        <SelectValue placeholder='Select Purpose' />
                      </SelectTrigger>

                      <SelectContent>
                        <SelectItem value='screening_assessment'>Screening / Assessment</SelectItem>
                        <SelectItem value='therapy'>Therapy</SelectItem>
                      </SelectContent>
                    </Select>

                    <Input
                      placeholder='Parent / Guardian (optional)'
                      value={row.parentGuardian}
                      onChange={e => updateRow(row.key, { parentGuardian: e.target.value })}
                      className='h-9'
                    />

                    <Input
                      placeholder='Notes (optional)'
                      value={row.additionalNotes}
                      onChange={e => updateRow(row.key, { additionalNotes: e.target.value })}
                      className='h-9'
                    />
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className='flex justify-end gap-2 pt-2'>
            <Button type='button' variant='outline' onClick={handleClose}>
              Cancel
            </Button>
            <Button type='button' onClick={handleSubmit} disabled={bulkUploadMutation.isPending}>
              {bulkUploadMutation.isPending && <Loader2 className='w-4 h-4 mr-2 animate-spin' />}
              Upload{rows.length > 0 ? ` ${rows.length} File${rows.length !== 1 ? 's' : ''}` : ''}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default BulkConsentFormModal
