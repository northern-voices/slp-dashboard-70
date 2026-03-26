import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useToast } from '@/hooks/use-toast'
import { useConsentForms, useDeleteConsentForm } from '@/hooks/students/use-consent-forms'
import { consentFormsApi } from '@/api/consentForms'
import { Loader2, Plus, Trash2, Eye, FileImage } from 'lucide-react'
import { format } from 'date-fns'
import { Student } from '@/types/database'
import ConsentFormModal from './ConsentFormModal'

interface ConsentFormsSectionProps {
  student: Student
}

interface ConsentForm {
  id: string
  file_name: string | null
  file_path: string | null
  file_type: string | null
  file_size: number | null
  consent_date: string
  consent_purpose: string
  consent_type: string
  uploaded_at: string
  uploaded_by: {
    id: string
    first_name: string
    last_name: string
  } | null
}

const ConsentFormsSection = ({ student }: ConsentFormsSectionProps) => {
  const { toast } = useToast()
  const [isModalOpen, setIsModalOpen] = useState(false)

  const { data: forms = [], isLoading } = useConsentForms(student.id) as {
    data: ConsentForm[]
    isLoading: boolean
  }
  const deleteMutation = useDeleteConsentForm(student.id)

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

  const handleDelete = (id: string, filePath: string | null, fileName: string) => {
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

  const purposeLabel = (purpose: string) =>
    purpose === 'screening_assessment' ? 'Screening / Assessment' : 'Therapy'

  const typeLabel = (type: string) => (type === 'verbal' ? 'Verbal' : 'Written')

  return (
    <>
      <Card>
        <CardHeader className='flex flex-row items-center justify-between'>
          <CardTitle className='text-lg font-semibold'>Consent Forms</CardTitle>
          <Button size='sm' onClick={() => setIsModalOpen(true)}>
            <Plus className='mr-2 h-4 w-4' />
            Add
          </Button>
        </CardHeader>

        <CardContent>
          {isLoading ? (
            <div className='flex justify-center py-6'>
              <Loader2 className='h-6 w-6 animate-spin text-muted-foreground' />
            </div>
          ) : forms.length === 0 ? (
            <div className='flex flex-col items-center gap-2 py-8 text-muted-foreground'>
              <FileImage className='h-8 w-8' />
              <p className='text-sm'>No consent forms recorded yet.</p>
            </div>
          ) : (
            <ul className='divide-y'>
              {forms.map(form => (
                <li key={form.id} className='flex items-center justify-between py-3'>
                  <div className='flex flex-col'>
                    <span className='text-sm font-medium'>
                      {purposeLabel(form.consent_purpose)} · {typeLabel(form.consent_type)}
                    </span>
                    <span className='text-xs text-muted-foreground'>
                      {format(new Date(form.consent_date), 'MMM d, yyyy')}
                      {form.uploaded_by &&
                        ` · ${form.uploaded_by.first_name} ${form.uploaded_by.last_name}`}
                    </span>
                  </div>
                  <div className='flex gap-2'>
                    {form.file_path && (
                      <Button
                        size='sm'
                        variant='outline'
                        onClick={() => handleView(form.file_path!, form.file_name!)}>
                        <Eye className='h-4 w-4' />
                      </Button>
                    )}
                    <Button
                      size='sm'
                      variant='outline'
                      onClick={() =>
                        handleDelete(form.id, form.file_path, form.file_name || 'this record')
                      }
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

      <ConsentFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        student={student}
      />
    </>
  )
}

export default ConsentFormsSection
