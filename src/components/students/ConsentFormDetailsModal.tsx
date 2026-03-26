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
  parent_guardian: string | null
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
      <DialogContent className='max-w-xl'>
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

          {/* Purpose & Type */}
          <div className='grid grid-cols-2 gap-4'>
            <div>
              <p className='text-xs text-muted-foreground'>Purpose</p>
              <p className='font-medium'>{purposeLabel(form.consent_purpose)}</p>
            </div>

            <div>
              <p className='text-xs text-muted-foreground'>Type of Consent</p>
              <p className='font-medium capitalize'>{form.consent_type}</p>
            </div>
          </div>

          {/* Parent / Guardian */}
          {form.parent_guardian && (
            <div>
              <p className='text-xs text-muted-foreground'>Parent / Guardian</p>
              <p className='font-medium'>{form.parent_guardian}</p>
            </div>
          )}

          {/* Verbal details */}
          {form.consent_type === 'verbal' && (
            <div>
              <p className='text-xs text-muted-foreground'>Verbal Consent Details</p>
              <p className='mt-1 whitespace-pre-wrap rounded-md bg-muted px-3 py-2'>
                {form.verbal_consent_details || '—'}
              </p>
            </div>
          )}

          {/* Written — photo */}
          {form.consent_type === 'written' && form.file_path && (
            <div>
              <p className='text-xs text-muted-foreground'>Uploaded Form</p>
              <div className='mt-1 flex items-center justify-between rounded-md border px-3 py-2'>
                <span className='truncate text-sm text-muted-foreground'>
                  {form.file_name || 'Consent form photo'}
                </span>
                <Button
                  size='sm'
                  variant='outline'
                  onClick={handleViewPhoto}
                  disabled={loadingPhoto}>
                  {loadingPhoto ? (
                    <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                  ) : (
                    <ExternalLink className='mr-2 h-4 w-4' />
                  )}
                  View Photo
                </Button>
              </div>
            </div>
          )}

          {/* Additional notes */}
          {form.additional_notes && (
            <div>
              <p className='text-xs text-muted-foreground'>Additional Notes</p>
              <p className='mt-1 whitespace-pre-wrap rounded-md bg-muted px-3 py-2'>
                {form.additional_notes}
              </p>
            </div>
          )}

          {/* Recorded at */}
          <p className='text-xs text-muted-foreground'>
            Recorded on {format(new Date(form.uploaded_at), 'MMM d, yyyy · h:mm a')}
          </p>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default ConsentFormDetailsModal
