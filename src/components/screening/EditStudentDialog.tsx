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
import { type SchoolGrade } from '@/api/schoolGrades'
import LoadingSpinner from '@/components/common/LoadingSpinner'

interface EditStudentDialogProps {
  open: boolean
  editedFirstName: string
  editedLastName: string
  editedGradeId: string
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
  editedFirstName,
  editedLastName,
  editedGradeId,
  availableGrades,
  isLoadingGrades,
  onFirstNameChange,
  onLastNameChange,
  onGradeChange,
  onSave,
  onCancel,
}: EditStudentDialogProps) => {
  return (
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
        <div className='space-y-4 py-4'>
          <div className='space-y-2'>
            <label className='text-sm font-medium text-gray-700'>First Name</label>
            <Input
              value={editedFirstName}
              onChange={e => onFirstNameChange(e.target.value)}
              placeholder='First Name'
            />
          </div>
          <div className='space-y-2'>
            <label className='text-sm font-medium text-gray-700'>Last Name</label>
            <Input
              value={editedLastName}
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
              <Select value={editedGradeId || undefined} onValueChange={onGradeChange}>
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
}

export default EditStudentDialog
