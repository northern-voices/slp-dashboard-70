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

interface DeleteEADialogProps {
  open: boolean
  eaName: string
  isDeleting: boolean
  onConfirm: () => void
  onCancel: () => void
}

const DeleteEADialog = ({ open, eaName, isDeleting, onConfirm, onCancel }: DeleteEADialogProps) => (
  <AlertDialog open={open} onOpenChange={open => !open && onCancel()}>
    <AlertDialogContent>
      <AlertDialogHeader>
        <AlertDialogTitle>Remove Speech EA?</AlertDialogTitle>
        <AlertDialogDescription>
          This will permanently remove <span className='font-medium'>{eaName}</span> from your team.
          This can't be undone.
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

export default DeleteEADialog
