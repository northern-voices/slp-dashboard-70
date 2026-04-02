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
import type { Screening } from '@/types/database'

interface DeleteScreeningDialogProps {
  open: boolean
  screening: Screening | null
  isDeleting: boolean
  onConfirm: () => void
  onCancel: () => void
}

const DeleteScreeningDialog = ({
  open,
  screening,
  isDeleting,
  onConfirm,
  onCancel,
}: DeleteScreeningDialogProps) => (
  <AlertDialog open={open} onOpenChange={open => !open && onCancel()}>
    <AlertDialogContent>
      <AlertDialogHeader>
        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
        <AlertDialogDescription>
          This action cannot be undone. This will permanently delete your screening for{' '}
          {screening?.student_name}.
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
          Delete
        </AlertDialogAction>
      </AlertDialogFooter>
    </AlertDialogContent>
  </AlertDialog>
)

export default DeleteScreeningDialog
