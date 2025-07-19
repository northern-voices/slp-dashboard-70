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
import { useSchoolGrades } from '@/hooks/use-school-grades'

interface SpeechScreeningStep1Props {
  form: UseFormReturn<any>
  selectedStudent: Student | null
  selectedGrade: string
  onStudentSelect: (student: Student | null) => void
  onGradeChange: (grade: string) => void
  onGradeIdChange: (gradeId: string) => void
}

// Map display names to database values (all as strings to match database)
const gradeMapping = [
  { display: 'Pre-K', value: 'Pre-' },
  { display: 'Nursery', value: 'Nursery' },
  { display: 'Headstart', value: 'Headstart' },
  { display: 'K4', value: 'K4' },
  { display: 'K5', value: 'K5' },
  { display: 'Kindergarten', value: 'K' },
  { display: 'Kindergarten (Full)', value: 'Kindergarten' },
  { display: '1st Grade', value: '1' },
  { display: '1A', value: '1A' },
  { display: '1B', value: '1B' },
  { display: '1/2 Grade', value: '1/2' },
  { display: '2nd Grade', value: '2' },
  { display: '2/3 Grade', value: '2/3' },
  { display: '3rd Grade', value: '3' },
  { display: '4th Grade', value: '4' },
  { display: '5th Grade', value: '5' },
  { display: '5/6 Grade', value: '5/6' },
  { display: '6th Grade', value: '6' },
  { display: '6/7 Grade', value: '6/7' },
  { display: '7th Grade', value: '7' },
  { display: '7/8 Grade', value: '7/8' },
  { display: '8th Grade', value: '8' },
  { display: '9th Grade', value: '9' },
  { display: '10th Grade', value: '10' },
  { display: '11th Grade', value: '11' },
  { display: '12th Grade', value: '12' },
]

const SpeechScreeningStep1 = ({
  form,
  selectedStudent,
  selectedGrade,
  onStudentSelect,
  onGradeChange,
  onGradeIdChange,
}: SpeechScreeningStep1Props) => {
  // Fetch available school grades for the current organization
  const { data: schoolGrades } = useSchoolGrades()

  // Filter grades based on selected grade level and get unique academic years
  const availableGradeIds = React.useMemo(() => {
    if (!schoolGrades || !selectedGrade) return []

    // Since all grade_levels in the database are strings, keep selectedGrade as string
    const gradeValue = selectedGrade

    const filteredGrades = schoolGrades.filter(grade => {
      const match = grade.grade_level === gradeValue
      return match
    })

    // Remove duplicates based on academic_year
    const uniqueGrades = filteredGrades.reduce((acc, current) => {
      const existing = acc.find(item => item.academic_year === current.academic_year)
      if (!existing) {
        acc.push(current)
      }
      return acc
    }, [] as typeof filteredGrades)

    // Sort by academic year (most recent first)
    return uniqueGrades.sort((a, b) => b.academic_year.localeCompare(a.academic_year))
  }, [schoolGrades, selectedGrade])

  const handleGradeChange = (grade: string) => {
    onGradeChange(grade)
    // Reset student selection when grade changes
    onStudentSelect(null)
    // Reset grade ID when grade level changes
    onGradeIdChange('')
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
                {gradeMapping.map(grade => (
                  <SelectItem key={grade.value} value={grade.value}>
                    {grade.display}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {selectedGrade && availableGradeIds.length > 0 && (
            <div>
              <Label className='mb-3 block text-sm font-medium text-gray-700'>
                Academic Year *
              </Label>
              <Select onValueChange={onGradeIdChange}>
                <SelectTrigger>
                  <SelectValue placeholder='Select academic year' />
                </SelectTrigger>
                <SelectContent>
                  {availableGradeIds.map(grade => (
                    <SelectItem key={grade.id} value={grade.id}>
                      {grade.academic_year}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

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
                {selectedStudent.grade || selectedGrade}
              </p>
              <p className='text-xs text-blue-600 mt-1'>Student ID: {selectedStudent.student_id}</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export default SpeechScreeningStep1
