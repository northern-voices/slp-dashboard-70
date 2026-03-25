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

const ConsentFormSection = ({ studentId }: ConsentFormsSectionProps) => {
  const { toast } = useToast()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const { data: forms = [], isLoading } = useConsentForms(studentId)
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

  return <Card></Card>
}

export default ConsentFormSection
