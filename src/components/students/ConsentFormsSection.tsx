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
