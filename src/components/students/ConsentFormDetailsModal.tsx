import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { useToast } from '@/hooks/use-toast'
import { consentFormsApi } from '@/api/consentForms'
import { format } from 'date-fns'
import { ExternalLink, Loader2 } from 'lucide-react'

interface ConsentFormDetails {
  id: string
  consent_date: string
  consent_purpose: string
  consent_type: string
  verbal_consent_details: string | null
  additional_notes: string | null
  file_name: string | null
  file_path: string | null
  uploaded_at: string
  uploaded_by: {
    id: string
    first_name: string
    last_name: string
  } | null
}

interface ConsentFormDetailsModalProps {
  isOpen: boolean
  onClose: () => void
  form: ConsentFormDetails | null
}

const purposeLabel = (purpose: string) =>
  purpose === 'screening_assessment' ? 'Screening / Assessment' : 'Therapy'

const ConsentFormDetailsModal = ({ isOpen, onClose, form }: ConsentFormDetailsModalProps) => {
  const { toast } = useToast()
  const [loadingPhoto, setLoadingPhoto] = useState(false)

  if (!form) return null

  const handleViewPhoto = async () => {
    if (!form.file_path) return

    setLoadingPhoto(true)

    try {
      const url = await consentFormsApi.getSignedUrl(form.file_path)
      window.open(url, '_blank')
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Could not load the photo. Please try again.',
        variant: 'destructive',
      })
    } finally {
      setLoadingPhoto(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className='max-w-md'>
        <DialogHeader>
          <DialogTitle>Consent Form Details</DialogTitle>
        </DialogHeader>

        <div className='space-y-4 text-sm'>
          {/* Date & Uploaded by */}
          <div className='grid grid-cols-2 gap-4'>
            <div>
              <p className='text-xs text-muted-foreground'>Consent Date</p>
              <p className='font-medium'>{format(new Date(form.consent_date), 'MMM d, yyyy')}</p>
            </div>

            <div>
              <p className='text-xs text-muted-foreground'>Record By</p>
              <p className='font-medium'>
                {form.uploaded_by
                  ? `${form.uploaded_by.first_name} ${form.uploaded_by.last_name}`
                  : '-'}
              </p>
            </div>
          </div>
        </div>

        {/* Purpose & Type */}
        <div className='grid grid-cols-2 gap-4'>
          <div>
            <p className='text-xs text-muted-foreground'>Purpose</p>
            <p className='font-medium'>{purposeLabel(form.consent_purpose)}</p>
          </div>

          <div>
            <p className='text-xs text-muted-foreground'>Type of Consent</p>
            <p className='font-medium'>{form.consent_type}</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default ConsentFormDetailsModal
