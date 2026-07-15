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
