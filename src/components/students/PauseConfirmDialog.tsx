import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'

interface PauseConfirmDialogProps {
  open: boolean
  studentName: string
  reason: string
  onReasonChange: (value: string) => void
  onConfirm: () => void
  onCancel: () => void
  isSaving?: boolean
}
