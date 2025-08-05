import React, { useState } from 'react'
import { UseFormReturn } from 'react-hook-form'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Textarea } from '@/components/ui/textarea'
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
import { useSchool } from '@/contexts/SchoolContext'
import { schoolGradesApi } from '@/api/schoolGrades'

interface SpeechScreeningStep1Props {
  form: UseFormReturn<Record<string, unknown>>
  selectedStudent: Student | null
  selectedGrade: string
  onStudentSelect: (student: Student | null) => void
  onGradeChange: (grade: string) => void
  onGradeIdChange: (gradeId: string) => void
}

const gradeMapping = [
  { display: 'Nursery', value: 'Nursery' },
  { display: 'Pre-K', value: 'Pre-K' },
  { display: 'K4', value: 'K4' },
  { display: 'K5', value: 'K5' },
  { display: 'Kindergarten', value: 'Kindergarten' },
  { display: '1', value: '1' },
  { display: '2', value: '2' },
  { display: '3', value: '3' },
  { display: '4', value: '4' },
  { display: '5', value: '5' },
  { display: '6', value: '6' },
  { display: '7', value: '7' },
  { display: '8', value: '8' },
  { display: '9', value: '9' },
  { display: '10', value: '10' },
  { display: '11', value: '11' },
  { display: '12', value: '12' },
  { display: 'K/1', value: 'K/1' },
  { display: '1/2', value: '1/2' },
  { display: '2/3', value: '2/3' },
  { display: '3/4', value: '3/4' },
  { display: '4/5', value: '4/5' },
  { display: '6/7', value: '6/7' },
  { display: '7/8', value: '7/8' },
  { display: '8/9', value: '8/9' },
  { display: '9/10', value: '9/10' },
  { display: '10/11', value: '10/11' },
  { display: '11/12', value: '11/12' },
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
  const { selectedSchool } = useSchool()

  // Track absent checkbox state for conditional rendering
  const [isAbsent, setIsAbsent] = useState(false)

  // Filter grades based on selected grade level and get unique academic years
  const availableGradeIds = React.useMemo(() => {
    if (!selectedGrade) return []

    // Get current academic year and generate range (1 year before, current, 4 years ahead)
    const currentYear = new Date().getFullYear()
    const academicYears = []
    academicYears.push(`${currentYear - 1}-${currentYear}`)
    academicYears.push(`${currentYear}-${currentYear + 1}`)
    for (let i = 1; i <= 4; i++) {
      academicYears.push(`${currentYear + i}-${currentYear + i + 1}`)
    }

    let filteredGrades: typeof schoolGrades = []

    if (schoolGrades) {
      const gradeValue = selectedGrade
      filteredGrades = schoolGrades.filter(grade => {
        const match = grade.grade_level === gradeValue
        return match
      })
    }

    // Remove duplicates based on academic_year
    const uniqueGrades = filteredGrades.reduce((acc, current) => {
      const existing = acc.find(item => item.academic_year === current.academic_year)
      if (!existing) {
        acc.push(current)
      }
      return acc
    }, [] as typeof filteredGrades)

    const sortedGrades = uniqueGrades.sort((a, b) => b.academic_year.localeCompare(a.academic_year))

    // Add placeholder entries for academic years that don't exist in backend
    academicYears.forEach(academicYear => {
      const hasYear = sortedGrades.some(grade => grade.academic_year === academicYear)
      if (!hasYear) {
        sortedGrades.unshift({
          id: `placeholder-${academicYear}`,
          school_id: '',
          grade_level: selectedGrade,
          academic_year: academicYear,
          created_at: '',
          updated_at: '',
        })
      }
    })

    return sortedGrades.sort((a, b) => a.academic_year.localeCompare(b.academic_year))
  }, [schoolGrades, selectedGrade])

  // Reset student selection and grade ID when grade level changes
  const handleGradeChange = (grade: string) => {
    onGradeChange(grade)
    onStudentSelect(null)

    const currentYear = new Date().getFullYear()
    const currentAcademicYear = `${currentYear}-${currentYear + 1}`

    const currentYearGrade = schoolGrades?.find(
      gradeItem =>
        gradeItem.grade_level === grade && gradeItem.academic_year === currentAcademicYear
    )

    if (currentYearGrade) {
      onGradeIdChange(currentYearGrade.id)
    } else {
      onGradeIdChange('')
    }
  }

  // Add handler for academic year selection
  const handleAcademicYearChange = async (academicYear: string) => {
    if (!selectedSchool) {
      onGradeIdChange('')
      return
    }

    // Try to find an existing grade_id
    const existingGrade = availableGradeIds.find(
      grade => grade.academic_year === academicYear && grade.grade_level === selectedGrade
    )

    if (existingGrade && !existingGrade.id.startsWith('placeholder-')) {
      onGradeIdChange(existingGrade.id)
    } else {
      // Create new grade if it doesn't exist or if it's a placeholder
      try {
        const newGrade = await schoolGradesApi.createSchoolGrade({
          school_id: selectedSchool.id,
          grade_level: selectedGrade,
          academic_year: academicYear,
        })
        onGradeIdChange(newGrade.id)
      } catch (error) {
        console.error('Failed to create new school grade:', error)
        onGradeIdChange('')
      }
    }
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

          {selectedGrade && (
            <div>
              <Label className='mb-3 block text-sm font-medium text-gray-700'>
                Academic Year *
              </Label>
              <Select
                value={(() => {
                  const currentYear = new Date().getFullYear()
                  const currentAcademicYear = `${currentYear}-${currentYear + 1}`
                  return currentAcademicYear
                })()}
                onValueChange={handleAcademicYearChange}>
                <SelectTrigger>
                  <SelectValue placeholder='Select academic year' />
                </SelectTrigger>
                <SelectContent>
                  {availableGradeIds.map(grade => (
                    <SelectItem key={grade.academic_year} value={grade.academic_year}>
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
                {selectedStudent.first_name} {selectedStudent.last_name} - Grade {selectedGrade}
              </p>
              <p className='text-xs text-blue-600 mt-1'>Student ID: {selectedStudent.student_id}</p>
            </div>
          )}

          {/* Screening Status Checkboxes - Only show after grade is selected */}
          {selectedGrade && (
            <div className='space-y-3'>
              <div className='flex items-center space-x-2'>
                <Checkbox
                  id='absent'
                  checked={isAbsent}
                  onCheckedChange={checked => {
                    setIsAbsent(checked as boolean)
                    form.setValue('absent', checked as boolean)
                  }}
                />
                <Label htmlFor='absent' className='text-sm font-medium'>
                  Absent
                </Label>
              </div>
              {isAbsent && (
                <div>
                  <Label htmlFor='absent_notes' className='text-sm font-medium'>
                    Absent Notes
                  </Label>
                  <Textarea
                    {...form.register('absent_notes')}
                    placeholder='Enter notes about absence...'
                    rows={2}
                    className='mt-1'
                  />
                </div>
              )}
              {isAbsent && (
                <div className='flex items-center space-x-2'>
                  <Checkbox id='priority_re_screen' {...form.register('priority_re_screen')} />
                  <Label htmlFor='priority_re_screen' className='text-sm font-medium'>
                    Priority re-screen
                  </Label>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export default SpeechScreeningStep1
