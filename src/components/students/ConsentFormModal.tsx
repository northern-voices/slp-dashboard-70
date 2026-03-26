import { useState, useRef } from 'react'
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
import { Checkbox } from '@/components/ui/checkbox'
import { useToast } from '@/hooks/use-toast'
import { useUploadConsentForm } from '@/hooks/students/use-consent-forms'
import { ConsentPurpose, ConsentType } from '@/api/consentForms'
import { Student } from '@/types/database'
import { Upload, Loader2, CheckCircle2 } from 'lucide-react'

interface ConsentFormModalProps {
  isOpen: boolean
  onClose: () => void
  student: Student
}
