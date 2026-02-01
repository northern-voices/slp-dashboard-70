import React, { useState, useEffect } from 'react'
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
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { ArrowRightLeft } from 'lucide-react'
import LoadingSpinner from '@/components/common/LoadingSpinner'
import { useToast } from '@/hooks/use-toast'
import { useTransferStudent } from '@/hooks/students/use-students-mutations'
import { useSchools } from '@/hooks/use-schools'
import { useSchoolGradesBySchool } from '@/hooks/use-school-grades'
import { useAuth } from '@/contexts/AuthContext'
import type { Student } from '@/types/database'

interface TransferStudentDialogProps {
  student: Student
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
}

const TransferStudentDialog = ({
  student,
  open,
  onOpenChange,
  onSuccess,
}: TransferStudentDialogProps) => {
  // Form state
  const [selectedSchoolId, setSelectedSchoolId] = useState<string>('')
  const [selectedGradeId, setSelectedGradeId] = useState<string>('')
  const [transferDate, setTransferDate] = useState<string>(new Date().toISOString().split('T')[0])
  const [reason, setReason] = useState<string>('')

  const { toast } = useToast()
  const { user } = useAuth()
  const transferStudentMutation = useTransferStudent()

  // Fetch schools using existing hook
  const { data: allSchools = [], isLoading: isLoadingSchools } = useSchools()

  // Filter out the current school
  const availableSchools = allSchools.filter(s => s.id !== student.school_id)

  // Fetch grades for selected school using existing hook
  const { data: grades = [], isLoading: isLoadingGrades } = useSchoolGradesBySchool(
    selectedSchoolId || undefined,
  )

  useEffect(() => {
    if (!open) {
      setSelectedSchoolId('')
      setSelectedGradeId('')
      setReason('')
      setTransferDate(new Date().toISOString().split('T')[0])
    }
  }, [open])

  // Reset grade when school changes
  useEffect(() => {
    setSelectedGradeId('')
  }, [selectedSchoolId])

  const handleTransfer = () => {
    if (!selectedSchoolId) {
      toast({
        title: 'Error',
        description: 'Please select a destination school.',
        variant: 'destructive',
      })
      return
    }

    if (!user?.id) {
      toast({
        title: 'Error',
        description: 'You must be logged in to transfer a student.',
        variant: 'destructive',
      })
      return
    }

    transferStudentMutation.mutate(
      {
        studentId: student.id,
        fromSchoolId: student.school_id!,
        toSchoolId: selectedSchoolId,
        fromGradeId: student.current_grade_id || null,
        toGradeId: selectedGradeId || null,
        transferredBy: user.id,
        transferDate: transferDate,
        reason: reason || undefined,
      },
      {
        onSuccess: () => {
          toast({
            title: 'Student transferred',
            description: `${student.first_name} ${student.last_name} has been transferred
  successfully.`,
          })
          onOpenChange(false)
          onSuccess?.()
        },
        onError: error => {
          console.error('Transfer error:', error)
          toast({
            title: 'Error',
            description: 'Failed to transfer student. Please try again.',
            variant: 'destructive',
          })
        },
      },
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-[500px]'>
        <DialogHeader>
          <DialogTitle className='flex items-center gap-2'>
            <ArrowRightLeft className='w-5 h-5' />
            Transfer Student
          </DialogTitle>
          <DialogDescription>
            Transfer {student.first_name} {student.last_name} to a different school.
          </DialogDescription>
        </DialogHeader>

        <div className='space-y-4 py-4'>
          {/* Destination School */}
          <div className='space-y-2'>
            <label className='text-sm font-medium text-gray-700'>
              Destination School <span className='text-red-500'>*</span>
            </label>
            {isLoadingSchools ? (
              <div className='flex items-center justify-center py-2'>
                <LoadingSpinner size='sm' />
              </div>
            ) : availableSchools.length === 0 ? (
              <p className='text-sm text-gray-500'>No other schools available.</p>
            ) : (
              <Select value={selectedSchoolId} onValueChange={setSelectedSchoolId}>
                <SelectTrigger>
                  <SelectValue placeholder='Select destination school' />
                </SelectTrigger>
                <SelectContent>
                  {availableSchools.map(school => (
                    <SelectItem key={school.id} value={school.id}>
                      {school.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>

          {/* Grade at New School */}
          <div className='space-y-2'>
            <label className='text-sm font-medium text-gray-700'>Grade at New School</label>
            {!selectedSchoolId ? (
              <p className='text-sm text-gray-500'>Select a school first</p>
            ) : isLoadingGrades ? (
              <div className='flex items-center justify-center py-2'>
                <LoadingSpinner size='sm' />
              </div>
            ) : grades.length === 0 ? (
              <p className='text-sm text-gray-500'>No grades available for this school.</p>
            ) : (
              <Select value={selectedGradeId} onValueChange={setSelectedGradeId}>
                <SelectTrigger>
                  <SelectValue placeholder='Select grade (optional)' />
                </SelectTrigger>
                <SelectContent>
                  {grades.map(grade => (
                    <SelectItem key={grade.id} value={grade.id}>
                      {grade.grade_level} ({grade.academic_year})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>

          {/* Transfer Date */}
          <div className='space-y-2'>
            <label className='text-sm font-medium text-gray-700'>Transfer Date</label>
            <Input
              type='date'
              value={transferDate}
              onChange={e => setTransferDate(e.target.value)}
            />
          </div>

          {/* Reason (Optional) */}
          <div className='space-y-2'>
            <label className='text-sm font-medium text-gray-700'>
              Reason for Transfer (Optional)
            </label>
            <Textarea
              value={reason}
              onChange={e => setReason(e.target.value)}
              placeholder='e.g., Family moved, school boundary change...'
              className='min-h-[80px]'
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant='outline' onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleTransfer}
            disabled={!selectedSchoolId || transferStudentMutation.isPending}>
            {transferStudentMutation.isPending ? (
              <>
                <LoadingSpinner size='sm' className='mr-2' />
                Transferring...
              </>
            ) : (
              'Transfer Student'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default TransferStudentDialog
