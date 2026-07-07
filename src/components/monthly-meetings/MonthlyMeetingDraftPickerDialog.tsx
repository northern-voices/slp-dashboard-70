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

const MonthlyMeetingDraftPickerDialogProps = ({
  open,
  mode,
  drafts,
  onResume,
  onDismiss,
}: MonthlyMeetingDraftPickerDialogProps) => {
  const { toast } = useToast()
  const [isEditingId, setEditingId] = useState<string | null>(null)
  const [editValue, setEditValue] = useState('')
  const [draftToDelete, setDraftToDelete] = useState<MonthlyMeetingDraft | null>(null)

  const renameMutation = useRenameMonthlyMeetingDraft()
  const deleteMutation = useDeleteMonthlyMeetingDraft()

  const handleEditStart = (draft: MonthlyMeetingDraft) => {
    setEditingId(draft.id)
    setEditValue(draft.label)
  }

  const handleEditSave = (id: string) => {
    if (!editValue.trim()) return
    renameMutation.mutate(
      { id, label: editValue.trim() },
      {
        onSuccess: () => setEditingId(null),
        onError: () => {
          toast({
            title: 'Error',
            description: 'Failed to rename draft. Please try again.',
            variant: 'destructive',
          })
        },
      }
    )
  }

  const handleDelete = (draft: MonthlyMeetingDraft) => {
    deleteMutation.mutate(draft.id, {
      onSuccess: () => setDraftToDelete(null),
      onError: () => {
        toast({
          title: 'Error',
          description: 'Failed to delete draft. Please try again.',
          variant: 'destructive',
        })
      },
    })
  }
}
