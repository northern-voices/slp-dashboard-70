import React, { useState, useEffect, useMemo } from 'react'
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
import { schoolGradesApi } from '@/api/schoolGrades'
import { useAuth } from '@/contexts/AuthContext'
import { GRADE_MAPPING } from '@/constants/app'
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
  const { toast } = useToast()
  const { user } = useAuth()
  const transferStudentMutation = useTransferStudent()

  // Form state
  const [selectedSchoolId, setSelectedSchoolId] = useState<string>('')
  const [selectedGradeLevel, setSelectedGradeLevel] = useState<string>('')
  const [selectedAcademicYear, setSelectedAcademicYear] = useState<string>('')
  const [transferDate, setTransferDate] = useState<string>(new Date().toISOString().split('T')[0])
  const [reason, setReason] = useState<string>('')
  const [isTransferring, setIsTransferring] = useState(false)

  // Fetch schools using existing hook
  const { data: allSchools = [], isLoading: isLoadingSchools } = useSchools()

  // Filter out the current school
  const availableSchools = allSchools.filter(s => s.id !== student.school_id)

  // Generate academic year options
  const academicYearOptions = useMemo(() => {
    const currentDate = new Date()
    const currentYear = currentDate.getFullYear()
    const currentMonth = currentDate.getMonth()

    // Academic year starts in August/September
    const academicYearStart = currentMonth < 7 ? currentYear - 1 : currentYear

    const years: string[] = []
    // Previous year, current year, and next few years
    years.push(`${academicYearStart - 1}-${academicYearStart}`)
    years.push(`${academicYearStart}-${academicYearStart + 1}`)
    for (let i = 1; i <= 2; i++) {
      years.push(`${academicYearStart + i}-${academicYearStart + i + 1}`)
    }

    return years
  }, [])

  // Set default academic year
  useEffect(() => {
    if (open && !selectedAcademicYear) {
      const currentDate = new Date()
      const currentYear = currentDate.getFullYear()
      const currentMonth = currentDate.getMonth()
      const academicYearStart = currentMonth < 7 ? currentYear - 1 : currentYear
      setSelectedAcademicYear(`${academicYearStart}-${academicYearStart + 1}`)
    }
  }, [open, selectedAcademicYear])

  // Reset form when dialog closes
  useEffect(() => {
    if (!open) {
      setSelectedSchoolId('')
      setSelectedGradeLevel('')
      setSelectedAcademicYear('')
      setReason('')
      setTransferDate(new Date().toISOString().split('T')[0])
    }
  }, [open])

  const handleTransfer = async () => {
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

    setIsTransferring(true)

    try {
      let toGradeId: string | null = null

      // If grade level and academic year are selected, check/create grade
      if (selectedGradeLevel && selectedAcademicYear) {
        const gradeAvailability = await schoolGradesApi.checkGradeAvailability(
          selectedSchoolId,
          selectedGradeLevel,
          selectedAcademicYear,
        )

        if (!gradeAvailability.exists) {
          // Create the grade at the destination school
          const newGrade = await schoolGradesApi.createSchoolGrade({
            school_id: selectedSchoolId,
            grade_level: selectedGradeLevel,
            academic_year: selectedAcademicYear,
          })
          toGradeId = newGrade.id
        } else {
          toGradeId = gradeAvailability.grade?.id || null
        }
      }

      // Perform the transfer
      transferStudentMutation.mutate(
        {
          studentId: student.id,
          fromSchoolId: student.school_id!,
          toSchoolId: selectedSchoolId,
          fromGradeId: student.current_grade_id || null,
          toGradeId: toGradeId,
          transferredBy: user.id,
          transferDate: transferDate,
          reason: reason || undefined,
        },
        {
          onSuccess: () => {
            toast({
              title: 'Student transferred',
              description: `${student.first_name} ${student.last_name} has been transferred successfully.`,
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
          onSettled: () => {
            setIsTransferring(false)
          },
        },
      )
    } catch (error) {
      console.error('Grade creation error:', error)
      toast({
        title: 'Error',
        description: 'Failed to set up grade at destination school.',
        variant: 'destructive',
      })
      setIsTransferring(false)
    }
  }

  const isSubmitting = isTransferring || transferStudentMutation.isPending

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

          {/* Grade Level */}
          <div className='space-y-2'>
            <label className='text-sm font-medium text-gray-700'>Grade Level at New School</label>
            <Select value={selectedGradeLevel} onValueChange={setSelectedGradeLevel}>
              <SelectTrigger>
                <SelectValue placeholder='Select grade level (optional)' />
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

          {/* Academic Year - only show if grade level is selected */}
          {selectedGradeLevel && (
            <div className='space-y-2'>
              <label className='text-sm font-medium text-gray-700'>Academic Year</label>
              <Select value={selectedAcademicYear} onValueChange={setSelectedAcademicYear}>
                <SelectTrigger>
                  <SelectValue placeholder='Select academic year' />
                </SelectTrigger>
                <SelectContent>
                  {academicYearOptions.map(year => (
                    <SelectItem key={year} value={year}>
                      {year}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

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
          <Button variant='outline' onClick={() => onOpenChange(false)} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button onClick={handleTransfer} disabled={!selectedSchoolId || isSubmitting}>
            {isSubmitting ? (
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
