import React from 'react'
import { UseFormReturn } from 'react-hook-form'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { User } from 'lucide-react'
import StudentSearchSelector from '../../StudentSearchSelector'
import { Student } from '@/types/database'
import { GRADE_MAPPING } from '@/constants/app'

interface HearingScreeningStep1Props {
  form: UseFormReturn
  selectedStudent: Student | null
  selectedGrade: string
  onStudentSelect: (student: Student | null) => void
  onGradeChange: (grade: string) => void
}

const HearingScreeningStep1 = ({
  form,
  selectedStudent,
  selectedGrade,
  onStudentSelect,
  onGradeChange,
}: HearingScreeningStep1Props) => {
  const handleGradeChange = (grade: string) => {
    onGradeChange(grade)
    onStudentSelect(null)
  }

  return (
    <div className='space-y-6'>
      <Card className='border-0 rounded-none shadow-none'>
        <CardHeader className='px-0 pt-0 pb-0 mb-6'>
          <CardTitle className='flex items-center gap-2 text-lg font-semibold text-gray-900'>
            <User className='w-5 h-5' />
            Student Information
          </CardTitle>
        </CardHeader>
        <CardContent className='space-y-6 p-0'>
          <div>
            <Label htmlFor='grade' className='mb-3 block text-sm font-medium text-gray-700'>
              Grade Level *
            </Label>
            <Select value={selectedGrade} onValueChange={handleGradeChange}>
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

          {selectedGrade && (
            <div>
              <Label className='mb-3 block text-sm font-medium text-gray-700'>
                Select Student *
              </Label>
              <div>
                <StudentSearchSelector
                  selectedStudent={selectedStudent}
                  onStudentSelect={onStudentSelect}
                  gradeFilter={selectedGrade}
                />
              </div>
            </div>
          )}

          {selectedStudent && (
            <div className='mt-6 p-4 bg-blue-50 rounded-lg'>
              <h4 className='text-sm font-semibold text-blue-900 mb-2'>Selected Student</h4>
              <p className='text-sm text-blue-800 font-medium'>
                {selectedStudent.first_name} {selectedStudent.last_name} - Grade{' '}
                {selectedStudent.grade}
              </p>
              <p className='text-xs text-blue-600 mt-1'>Student ID: {selectedStudent.student_id}</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export default HearingScreeningStep1
