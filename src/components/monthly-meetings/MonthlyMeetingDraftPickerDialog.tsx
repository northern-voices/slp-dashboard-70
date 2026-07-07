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

const MonthlyMeetingDraftPickerDialog = ({
  open,
  mode,
  drafts,
  onResume,
  onDismiss,
}: MonthlyMeetingDraftPickerDialogProps) => {
  const { toast } = useToast()
  const [editingId, setEditingId] = useState<string | null>(null)
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

  return (
    <>
      <Dialog open={open} onOpenChange={onDismiss}>
        <DialogContent
          className='sm:max-w-lg'
          onInteractOutside={e => e.preventDefault()}
          onEscapeKeyDown={e => e.preventDefault()}>
          <DialogHeader>
            <DialogTitle>
              {mode === 'create' ? 'Resume a draft?' : 'Restore your draft?'}
            </DialogTitle>
          </DialogHeader>

          <p className='text-sm text-gray-600'>
            {mode === 'create'
              ? 'You have unsaved meetings in progress for this school.'
              : 'You have unsaved changes from a previous session on this meeting.'}
          </p>

          <ul className='divide-y max-h-80 overflow-y-auto'>
            {drafts.map(draft => (
              <li key={draft.id} className='flex items-center justify-between gap-2 py-3'>
                <div className='flex flex-col gap-2 min-w-0'>
                  {editingId === draft.id ? (
                    <Input
                      value={editValue}
                      onChange={e => setEditValue(e.target.value)}
                      onKeyDown={e => {
                        if (e.key === 'Enter') handleEditSave(draft.id)
                        if (e.key === 'Escape') setEditingId(null)
                      }}
                    />
                  ) : (
                    <span className='text-sm font-medium truncate'>{draft.label}</span>
                  )}

                  <span className='text-xs text-muted-foreground'>
                    Updated {formatDistanceToNow(new Date(draft.updated_at), { addSuffix: true })}
                  </span>
                </div>

                <div className='flex gap-2 shrink-0'>
                  {editingId === draft.id ? (
                    <>
                      <Button
                        size='sm'
                        variant='outline'
                        onClick={() => handleEditSave(draft.id)}
                        disabled={renameMutation.isPending}>
                        <Check className='w-4 h-4 text-green-600' />
                      </Button>
                      <Button size='sm' variant='outline' onClick={() => setEditingId(null)}>
                        <X className='w-4 h-4' />
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button size='sm' variant='outline' onClick={() => handleEditStart(draft)}>
                        <Pencil className='w-4 h-4' />
                      </Button>
                      <Button size='sm' variant='outline' onClick={() => setDraftToDelete(draft)}>
                        <Trash2 className='w-4 h-4 text-destructive' />
                      </Button>
                      <Button size='sm' onClick={() => onResume(draft)}>
                        Resume
                      </Button>
                    </>
                  )}
                </div>
              </li>
            ))}
          </ul>

          <DialogFooter>
            <Button variant='outline' onClick={onDismiss}>
              {mode === 'create'
                ? 'Start a new blank meeting'
                : 'Discard and use latest saved version'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!draftToDelete} onOpenChange={() => setDraftToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Draft?</AlertDialogTitle>
          </AlertDialogHeader>

          <AlertDialogDescription>
            This will permanently delete{' '}
            <span className='font-medium text-foreground'>{draftToDelete?.label}</span>. This action
            cannot be undone.
          </AlertDialogDescription>

          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>

            <AlertDialogAction
              className='bg-destructive text-destructive-foreground hover:bg-destructive/90'
              onClick={() => draftToDelete && handleDelete(draftToDelete)}>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}

export default MonthlyMeetingDraftPickerDialog
