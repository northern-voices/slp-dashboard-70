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
import { Textarea } from '@/components/ui/textarea'
import { useToast } from '@/hooks/use-toast'
import { useBulkUploadConsentForms } from '@/hooks/students/use-consent-forms'
import { useStudentsBySchool } from '@/hooks/students/use-students'
import { ConsentPurpose, ConsentType } from '@/api/consentForms'
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
  parentGuardian: string
  additionalNotes: string
}

const today = () => new Date().toISOString().split('T')[0]
const minDate = () => new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]

const BulkConsentFormModal = ({ isOpen, onClose, schoolId }: BulkConsentFormModalProps) => {
  const { toast } = useToast()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { data: students = [] } = useStudentsBySchool(schoolId)
  const bulkUploadMutation = useBulkUploadConsentForms()

  const [consentDate, setConsentDate] = useState(today())
  const [consentPurpose, setConsentPurpose] = useState<ConsentPurpose | ''>('')
  const [consentType, setConsentType] = useState<ConsentType | ''>('')
  const [verbalConsentDetails, setVerbalConsentDetails] = useState('')
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
    setConsentDate(today())
    setConsentPurpose('')
    setConsentType('')
    setVerbalConsentDetails('')
    setRows([])
    if (fileInputRef.current) fileInputRef.current.value = ''
    onClose()
  }

  const allRowsAssigned = rows.length > 0 && rows.every(row => row.studentId)

  const handleSubmit = async () => {
    if (!consentPurpose) {
      toast({
        title: 'Missing field',
        description: 'Please select a consent purpose.',
        variant: 'destructive',
      })
      return
    }

    if (!consentType) {
      toast({
        title: 'Missing field',
        description: 'Please select a consent type.',
        variant: 'destructive',
      })
      return
    }

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

    await bulkUploadMutation.mutateAsync(
      {
        consent_date: consentDate,
        consent_purpose: consentPurpose as ConsentPurpose,
        consent_type: consentType as ConsentType,
        verbal_consent_details: consentType === 'verbal' ? verbalConsentDetails : undefined,
        entries: rows.map(row => ({
          file: row.file,
          studentId: row.studentId as string,
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

  const acceptTypes = consentType === 'verbal' ? 'image/*,audio/*,application/pdf' : 'image/*'

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className='max-w-3xl max-h-[90vh] overflow-y-auto'>
        <DialogHeader>
          <DialogTitle>Add Multiple Consent Forms</DialogTitle>
        </DialogHeader>

        <div className='space-y-4'>
          <div className='grid grid-cols-3 gap-4'>
            <div className='space-y-1'>
              <Label htmlFor='bulk-consent-date'>
                Date of Consent <span className='text-destructive'>*</span>
              </Label>
              <Input
                id='bulk-consent-date'
                type='date'
                min={minDate()}
                max={today()}
                value={consentDate}
                onChange={e => setConsentDate(e.target.value)}
              />
            </div>

            <div className='space-y-1'>
              <Label>
                Purpose <span className='text-destructive'>*</span>
              </Label>
              <Select
                value={consentPurpose}
                onValueChange={val => setConsentPurpose(val as ConsentPurpose)}>
                <SelectTrigger>
                  <SelectValue placeholder='Select purpose' />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='screening_assessment'>Screening / Assessment</SelectItem>
                  <SelectItem value='therapy'>Therapy</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className='space-y-1'>
              <Label>
                Type of Consent <span className='text-destructive'>*</span>
              </Label>
              <Select value={consentType} onValueChange={val => setConsentType(val as ConsentType)}>
                <SelectTrigger>
                  <SelectValue placeholder='Select type' />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='verbal'>Verbal Consent</SelectItem>
                  <SelectItem value='written'>Written Consent</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {consentType === 'verbal' && (
            <div className='space-y-1'>
              <Label htmlFor='bulk-verbal-details'>Verbal Consent Details</Label>
              <Textarea
                id='bulk-verbal-details'
                placeholder='Describe the verbal consent given...'
                rows={2}
                value={verbalConsentDetails}
                onChange={e => setVerbalConsentDetails(e.target.value)}
              />
            </div>
          )}

          <div className='space-y-1'>
            <Label>Files</Label>
            <div>
              <Button
                type='button'
                variant='outline'
                size='sm'
                onClick={() => fileInputRef.current?.click()}
                disabled={!consentType}>
                <Upload className='w-4 h-4 mr-2' />
                Choose Files
              </Button>
            </div>
            {!consentType && (
              <p className='text-xs text-muted-foreground'>Select a consent type first.</p>
            )}
            <input
              ref={fileInputRef}
              type='file'
              multiple
              accept={acceptTypes}
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

                  <div className='grid grid-cols-3 gap-2'>
                    <StudentPicker
                      students={students}
                      value={row.studentId}
                      onChange={studentId => updateRow(row.key, { studentId })}
                    />
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
