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
import { Loader2, Trash2 } from 'lucide-react'

interface DeleteEmailSuggestionDialogProps {
  open: boolean
  email: string | null
  isDeleting: boolean
  onConfirm: () => void
  onCancel: () => void
}

const DeleteEmailSuggestionDialog = ({
  open,
  email,
  isDeleting,
  onConfirm,
  onCancel,
}: DeleteEmailSuggestionDialogProps) => (
  <AlertDialog open={open} onOpenChange={open => !open && onCancel()}>
    <AlertDialogContent>
      <AlertDialogHeader>
        <AlertDialogTitle>Remove this suggestion?</AlertDialogTitle>
        <AlertDialogDescription>
          This will permanently remove {email} from your saved recipient suggestions. You can still
          type it in manually later.
        </AlertDialogDescription>
      </AlertDialogHeader>

      <AlertDialogFooter>
        <AlertDialogCancel onClick={onCancel}>Cancel</AlertDialogCancel>
        <AlertDialogAction onClick={onConfirm} disabled={isDeleting}>
          {isDeleting ? (
            <Loader2 className='w-4 h-4 mr-2 animate-spin' />
          ) : (
            <Trash2 className='w-4 h-4 mr-2' />
          )}
          Remove
        </AlertDialogAction>
      </AlertDialogFooter>
    </AlertDialogContent>
  </AlertDialog>
)

export default DeleteEmailSuggestionDialog
