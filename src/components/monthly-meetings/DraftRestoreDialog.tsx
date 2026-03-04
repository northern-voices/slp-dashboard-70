import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'

interface DraftRestoreDialogProps {
  open: boolean
  onRestore: () => void
  onDiscard: () => void
}

const DraftRestoreDialog = ({ open, onRestore, onDiscard }: DraftRestoreDialogProps) => {
  return (
    <Dialog open={open} onOpenChange={onDiscard}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Restore Draft?</DialogTitle>
        </DialogHeader>
        <p className='text-sm text-gray-600'>
          You have unsaved changes from a previous session. Would you like to restore them?
        </p>
        <DialogFooter>
          <Button variant='outline' onClick={onDiscard}>
            Discard Draft
          </Button>
          <Button onClick={onRestore}>Restore Draft</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default DraftRestoreDialog
