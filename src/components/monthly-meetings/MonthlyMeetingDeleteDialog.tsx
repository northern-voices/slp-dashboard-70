import { MonthlyMeeting } from '@/api/monthlymeetings'
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
import { Loader2 } from 'lucide-react'

interface MonthlyMeetingDeleteDialogProps {
  open: boolean
  meeting: MonthlyMeeting | null
  isPending: boolean
  onConfirm: () => void
  onCancel: () => void
}

const MonthlyMeetingDeleteDialog = ({
  open,
  meeting,
  isPending,
  onConfirm,
  onCancel,
}: MonthlyMeetingDeleteDialogProps) => (
  <AlertDialog open={open} onOpenChange={onCancel}>
    <AlertDialogContent>
      <AlertDialogHeader>
        <AlertDialogTitle>Delete Monthly Meeting</AlertDialogTitle>
        <AlertDialogDescription>
          Are you sure you want to delete "{meeting?.meeting_title}"? This action cannot be undone.
          {meeting?.student_updates && meeting.student_updates.length > 0 && (
            <span className='block mt-2 font-medium text-orange-600'>
              This meeting has {meeting.student_updates.length} student update(s) that will also be
              deleted.
            </span>
          )}
        </AlertDialogDescription>
      </AlertDialogHeader>
      <AlertDialogFooter>
        <AlertDialogCancel onClick={onCancel}>Cancel</AlertDialogCancel>
        <AlertDialogAction
          onClick={onConfirm}
          className='bg-red-600 hover:bg-red-700'
          disabled={isPending}>
          {isPending ? (
            <>
              <Loader2 className='w-4 h-4 mr-2 animate-spin' />
              Deleting...
            </>
          ) : (
            'Delete'
          )}
        </AlertDialogAction>
      </AlertDialogFooter>
    </AlertDialogContent>
  </AlertDialog>
)

export default MonthlyMeetingDeleteDialog
