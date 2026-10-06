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

interface GraduateConfirmDialogProps {
  screening: Screening | null
  isSaving: boolean
  onConfirm: (notes: string) => void
  onCancel: () => void
}

const GraduateConfirmDialog = ({
  screening,
  isSaving,
  onConfirm,
  onCancel,
}: GraduateConfirmDialogProps) => {
  const [notes, setNotes] = useState('')

  useEffect(() => {
    if (screening) setNotes('')
  }, [screening])

  return (
    <Dialog open={!!screening} onOpenChange={open => !open && onCancel()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Graduate Student</DialogTitle>
        </DialogHeader>

        <div>
          <Label htmlFor='graduated_notes' className='text-sm font-medium'>
            Graduation Notes (optional)
          </Label>

          <Textarea
            id='graduated_notes'
            value={notes}
            onChange={e => setNotes(e.target.value)}
            placeholder='Enter any notes about this graduated'
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
            Graduate Student
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default GraduateConfirmDialog
