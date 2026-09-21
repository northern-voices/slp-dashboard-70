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

const PauseConfirmDialog = ({
  open,
  studentName,
  reason,
  onReasonChange,
  onConfirm,
  onCancel,
  isSaving,
}: PauseConfirmDialogProps) => (
  <AlertDialog
    open={open}
    onOpenChange={isOpen => {
      if (!isOpen) onCancel()
    }}>
    <AlertDialogContent>
      <AlertDialogHeader>
        <AlertDialogTitle>Pause / mark student away?</AlertDialogTitle>
        <AlertDialogDescription>
          This will pause services for {studentName}. You can reactivate them later from this table.
        </AlertDialogDescription>
      </AlertDialogHeader>

      <div className='py-2'>
        <Label htmlFor='pause-reason' className='text-sm font-medium text-gray-700'>
          Reason (optional)
        </Label>
        <Textarea
          id='pause-reason'
          value={reason}
          onChange={e => onReasonChange(e.target.value)}
          placeholder='Why is this student being paused/away?'
          className='my-2 min-h-[80px]'
        />
      </div>

      <AlertDialogFooter>
        <AlertDialogCancel onClick={onCancel}>Cancel</AlertDialogCancel>
        <AlertDialogAction onClick={onConfirm} disabled={isSaving}>
          {isSaving ? 'Saving...' : 'Pause / Away'}
        </AlertDialogAction>
      </AlertDialogFooter>
    </AlertDialogContent>
  </AlertDialog>
)

export default PauseConfirmDialog
