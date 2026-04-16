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
import { Screening } from '@/types/database'

interface HearingScreeningDeleteDialogProps {
  screening: Screening | null
  onConfirm: () => void
  onCancel: () => void
}

const HearingScreeningDeleteDialog = ({
  screening,
  onConfirm,
  onCancel,
}: HearingScreeningDeleteDialogProps) => {
  return (
    <AlertDialog open={!!screening} onOpenChange={onCancel}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Hearing Screening</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete the hearing screening for{' '}
            <strong>{screening?.student_name}</strong>? This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={onCancel}>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={onConfirm} className='bg-red-600 hover:bg-red-700'>
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

export default HearingScreeningDeleteDialog
