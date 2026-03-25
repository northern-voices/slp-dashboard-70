import { useRef } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useToast } from '@/hooks/use-toast'
import {
  useConsentForms,
  useUploadConsentForm,
  useDeleteConsentForm,
} from '@/hooks/students/use-consent-forms'
import { consentFormsApi } from '@/api/consentForms'
import { Loader2, Upload, Trash2, Eye, FileImage } from 'lucide-react'
import { format } from 'date-fns'

interface ConsentFormsSectionProps {
  studentId: string
}

interface ConsentForm {
  id: string
  file_name: string
  file_path: string
  file_type: string
  file_size: number
  uploaded_at: string
  uploaded_by: {
    id: string
    first_name: string
    last_name: string
  } | null
}

const ConsentFormsSection = ({ studentId }: ConsentFormsSectionProps) => {
  const { toast } = useToast()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const { data: forms = [], isLoading } = useConsentForms(studentId) as {
    data: ConsentForm[]
    isLoading: boolean
  }
  const uploadMutation = useUploadConsentForm(studentId)
  const deleteMutation = useDeleteConsentForm(studentId)

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (files.length === 0) return

    // Upload files one by one
    for (const file of files) {
      await uploadMutation.mutateAsync(file, {
        onError: () => {
          toast({
            title: 'Upload failed',
            description: `Failed to upload ${file.name}. Please try again.`,
            variant: 'destructive',
          })
        },
      })
    }

    toast({
      title: 'Upload complete',
      description: `${files.length} file${files.length > 1 ? 's' : ''} uploaded successfully.`,
    })

    // Reset input so the same file can be re-uploaded if needed
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const handleView = async (filePath: string, fileName: string) => {
    try {
      const url = await consentFormsApi.getSignedUrl(filePath)
      window.open(url, '_blank')
    } catch (error) {
      toast({
        title: 'Error',
        description: `Could not open ${fileName}. Please try again.`,
        variant: 'destructive',
      })
    }
  }

  const handleDelete = (id: string, filePath: string, fileName: string) => {
    deleteMutation.mutate(
      { id, filePath },
      {
        onSuccess: () => {
          toast({
            title: 'File deleted',
            description: `${fileName} has been removed.`,
          })
        },
        onError: () => {
          toast({
            title: 'Error',
            description: `Failed to delete ${fileName}. Please try again.`,
            variant: 'destructive',
          })
        },
      }
    )
  }

  return (
    <Card>
      <CardHeader className='flex flex-row items-center justify-between'>
        <CardTitle className='text-lg font-semibold'>Consent Forms</CardTitle>
        <Button
          size='sm'
          onClick={() => fileInputRef.current?.click()}
          disabled={uploadMutation.isPending}>
          {uploadMutation.isPending ? (
            <Loader2 className='mr-2 h-4 w-4 animate-spin' />
          ) : (
            <Upload className='mr-2 h-4 w-4' />
          )}
          Upload
        </Button>
        <input
          ref={fileInputRef}
          type='file'
          accept='image/*'
          multiple
          className='hidden'
          onChange={handleFileChange}
        />
      </CardHeader>

      <CardContent>
        {isLoading ? (
          <div className='flex justify-center py-6'>
            <Loader2 className='h-6 w-6 animate-spin text-muted-foreground' />
          </div>
        ) : forms.length === 0 ? (
          <div className='flex flex-col items-center gap-2 py-8 text-muted-foreground'>
            <FileImage className='h-8 w-8' />
            <p className='text-sm'>No consent forms uploaded yet.</p>
          </div>
        ) : (
          <ul className='divide-y'>
            {forms.map(form => (
              <li key={form.id} className='flex items-center justify-between py-3'>
                <div className='flex flex-col'>
                  <span className='text-sm font-medium'>{form.file_name}</span>
                  <span className='text-xs text-muted-foreground'>
                    {format(new Date(form.uploaded_at), 'MMM d, yyyy')}
                    {form.uploaded_by &&
                      ` · ${form.uploaded_by.first_name} ${form.uploaded_by.last_name}`}
                  </span>
                </div>
                <div className='flex gap-2'>
                  <Button
                    size='sm'
                    variant='outline'
                    onClick={() => handleView(form.file_path, form.file_name)}>
                    <Eye className='h-4 w-4' />
                  </Button>
                  <Button
                    size='sm'
                    variant='outline'
                    onClick={() => handleDelete(form.id, form.file_path, form.file_name)}
                    disabled={deleteMutation.isPending}>
                    <Trash2 className='h-4 w-4 text-destructive' />
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  )
}

export default ConsentFormsSection
