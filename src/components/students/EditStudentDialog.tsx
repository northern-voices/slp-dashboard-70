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
import LoadingSpinner from '@/components/common/LoadingSpinner'
import type { SchoolGrade } from '@/api/schoolGrades'

interface EditStudentDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  firstName: string
  lastName: string
  gradeId: string
  availableGrades: SchoolGrade[]
  isLoadingGrades: boolean
  onFirstNameChange: (value: string) => void
  onLastNameChange: (value: string) => void
  onGradeChange: (value: string) => void
  onSave: () => void
  onCancel: () => void
}

const EditStudentDialog = ({
  open,
  onOpenChange,
  firstName,
  lastName,
  gradeId,
  availableGrades,
  isLoadingGrades,
  onFirstNameChange,
  onLastNameChange,
  onGradeChange,
  onSave,
  onCancel,
}: EditStudentDialogProps) => (
  <Dialog
    open={open}
    onOpenChange={open => {
      if (!open) onCancel()
    }}>
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Edit Student Information</DialogTitle>
        <DialogDescription>
          Update the student's first name, last name, and current grade below.
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
          {isLoadingGrades ? (
            <div className='flex items-center justify-center py-2'>
              <LoadingSpinner size='sm' />
            </div>
          ) : (
            <Select value={gradeId || undefined} onValueChange={onGradeChange}>
              <SelectTrigger>
                <SelectValue placeholder='Select grade (optional)' />
              </SelectTrigger>
              <SelectContent>
                {availableGrades.map(grade => (
                  <SelectItem key={grade.id} value={grade.id}>
                    {grade.grade_level} ({grade.academic_year})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
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
