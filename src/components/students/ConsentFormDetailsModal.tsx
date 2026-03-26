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

const ConsentFormDetailsModal = () => {
  return (
    <div>
      <div></div>
    </div>
  )
}

export default ConsentFormDetailsModal
