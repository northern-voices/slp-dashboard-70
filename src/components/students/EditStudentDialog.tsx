import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { GRADE_MAPPING } from '@/constants/app'

interface EditStudentDialogProps {
  open: boolean
  firstName: string
  lastName: string
  gradeLevel: string
  onFirstNameChange: (value: string) => void
  onLastNameChange: (value: string) => void
  onGradeLevelChange: (value: string) => void
  onSave: () => void
  onCancel: () => void
}

const EditStudentDialog = ({
  open,
  firstName,
  lastName,
  gradeLevel,
  onFirstNameChange,
  onLastNameChange,
  onGradeLevelChange,
  onSave,
  onCancel,
}: EditStudentDialogProps) => (
  <Dialog
    open={open}
    onOpenChange={open => {
      if (!open) onCancel()
    }}>
    <DialogContent
      onOpenAutoFocus={e => {
        e.preventDefault()
      }}>
      <DialogHeader>
        <DialogTitle>Edit Student Information</DialogTitle>
        <DialogDescription>
          Update the student's first name, last name, and grade.
        </DialogDescription>
      </DialogHeader>

      <div className='py-4 space-y-4'>
        <div className='space-y-2'>
          <label className='text-sm font-medium text-gray-700'>First Name</label>
          <Input
            value={firstName}
            onChange={e => onFirstNameChange(e.target.value)}
            placeholder='First Name'
          />
        </div>

        <div className='space-y-2'>
          <label className='text-sm font-medium text-gray-700'>Last Name</label>
          <Input
            value={lastName}
            onChange={e => onLastNameChange(e.target.value)}
            placeholder='Last Name'
          />
        </div>

        <div className='space-y-2'>
          <label className='text-sm font-medium text-gray-700'>Current Grade</label>
          <Select value={gradeLevel || undefined} onValueChange={onGradeLevelChange}>
            <SelectTrigger>
              <SelectValue placeholder='Select grade' />
            </SelectTrigger>
            <SelectContent>
              {GRADE_MAPPING.map(grade => (
                <SelectItem key={grade.value} value={grade.value}>
                  {grade.display}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <DialogFooter>
        <Button variant='outline' onClick={onCancel}>
          Cancel
        </Button>

        <Button onClick={onSave}>Save Changes</Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
)

export default EditStudentDialog
