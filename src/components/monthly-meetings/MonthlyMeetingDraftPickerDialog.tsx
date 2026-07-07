import { useState } from 'react'
import { formatDistanceToNow } from 'date-fns'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
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
import { Pencil, Check, X, Trash2 } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import {
  useRenameMonthlyMeetingDraft,
  useDeleteMonthlyMeetingDraft,
} from '@/hooks/monthly-meetings/use-monthly-meeting-drafts'
import type { MonthlyMeetingDraft } from '@/types/monthly-meeting-draft'

interface MonthlyMeetingDraftPickerDialogProps {
  open: boolean
  mode: 'create' | 'edit'
  drafts: MonthlyMeetingDraft[]
  onResume: (draft: MonthlyMeetingDraft) => void
  onDismiss: () => void
}
