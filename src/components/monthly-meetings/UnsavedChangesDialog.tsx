import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'

interface UnsavedChangesDialogProps {
  open: boolean
  onKeepEditing: () => void
  onLeave: () => void
}

const UnsavedChangesDialog = ({ open, onKeepEditing, onLeave }: UnsavedChangesDialogProps) => {
  return (
    <Dialog open={open} onOpenChange={onKeepEditing}>
      <DialogContent className='sm:max-w-md'>
        <DialogHeader>
          <DialogTitle className='flex items-center gap-2'>
            <div className='p-2 rounded-full bg-amber-100'>
              <svg
                className='w-5 h-5 text-amber-600'
                fill='none'
                stroke='currentColor'
                viewBox='0 0 24 24'>
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={2}
                  d='M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z'
                />
              </svg>
            </div>
            Unsaved Changes
          </DialogTitle>
        </DialogHeader>

        <div className='py-4'>
          <p className='text-sm text-gray-600'>
            You have unsaved changes that will be saved as a draft. You can continue editing later
            by returning to this page.
          </p>

          <div className='pt-3 mt-3 border border-blue-100 rounded-lg bg-blue-50'>
            <p className='flex items-center gap-2 text-sm text-blue-700'>
              <svg
                className='flex-shrink-0 w-4 h-4'
                fill='none'
                stroke='currentColor'
                viewBox='0 0 24 24'>
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={2}
                  d='M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z'
                />
              </svg>
              Your draft will be automatically saved.
            </p>
          </div>
        </div>

        <DialogFooter className='flex gap-2 sm:gap-0'>
          <Button variant='outline' onClick={onKeepEditing}>
            Keep Editing
          </Button>
          <Button variant='default' onClick={onLeave}>
            Save Draft & Leave
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default UnsavedChangesDialog
