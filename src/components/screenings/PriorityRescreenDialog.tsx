import { useEffect, useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Loader2 } from 'lucide-react'
import type { Screening } from '@/types/database'

interface PriorityRescreenDialogProps {
  screening: Screening | null
  isSaving: boolean
  onConfirm: (notes: string) => void
  onCancel: () => void
}

const PriorityRescreenDialog = ({
  screening,
  isSaving,
  onConfirm,
  onCancel,
}: PriorityRescreenDialogProps) => {
  const [notes, setNotes] = useState('')

  useEffect(() => {
    if (screening) setNotes('')
  }, [screening])

  return (
    <Dialog open={!!screening} onOpenChange={open => !open && onCancel()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Flag Priority Re-screen</DialogTitle>
        </DialogHeader>

        <div>
          <Label htmlFor='priority_re_screen_notes' className='text-sm font-medium'>
            Priority Re-screen Notes (optional)
          </Label>
          <Textarea
            id='priority_re_screen_notes'
            value={notes}
            onChange={e => setNotes(e.target.value)}
            placeholder='Enter notes about why this student needs a priority re-screen'
            rows={3}
            className='mt-1'
          />
        </div>

        <DialogFooter>
          <Button variant='outline' onClick={onCancel} disabled={isSaving}>
            Cancel
          </Button>
          <Button onClick={() => onConfirm(notes)} disabled={isSaving}>
            {isSaving && <Loader2 className='w-4 h-4 mr-2 animate-spin' />}
            Flag Student
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default PriorityRescreenDialog
