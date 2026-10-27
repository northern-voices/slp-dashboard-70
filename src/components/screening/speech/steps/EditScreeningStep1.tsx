import React from 'react'
import { UseFormReturn } from 'react-hook-form'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { User } from 'lucide-react'
import { useSchoolGrades } from '@/hooks/use-school-grades'
import { GRADE_MAPPING } from '@/constants/app'
import { getCurrentAcademicYear, getCurrentAcademicYearStart } from '@/lib/academicYear'
import { SpeechScreeningFormValues } from '@/types/screening-form'

interface EditScreeningStep1Props {
  form: UseFormReturn<SpeechScreeningFormValues>
  firstName: string
  lastName: string
  onFirstNameChange: (value: string) => void
  onLastNameChange: (value: string) => void
  selectedGrade: string
  onGradeChange: (grade: string) => void
}

const EditScreeningStep1 = ({
  form,
  firstName,
  lastName,
  onFirstNameChange,
  onLastNameChange,
  selectedGrade,
  onGradeChange,
}: EditScreeningStep1Props) => {
  const { data: schoolGrades } = useSchoolGrades()

  const currentAcademicYear = getCurrentAcademicYear()

  const availableAcademicYears = React.useMemo(() => {
    if (!selectedGrade) return []

    const academicYearStart = getCurrentAcademicYearStart()

    const academicYears = []
    academicYears.push(`${academicYearStart - 1}-${academicYearStart}`)
    academicYears.push(`${academicYearStart}-${academicYearStart + 1}`)
    for (let i = 1; i <= 4; i++) {
      academicYears.push(`${academicYearStart + i}-${academicYearStart + i + 1}`)
    }

    const matchingGrades = (schoolGrades || []).filter(
      grade => grade.grade_level === selectedGrade
    )

    const selectedYear = form.watch('academic_year')
    if (selectedYear && !academicYears.includes(selectedYear)) {
      academicYears.push(selectedYear)
    }

    matchingGrades.forEach(grade => {
      if (!academicYears.includes(grade.academic_year)) {
        academicYears.push(grade.academic_year)
      }
    })

    return academicYears.sort((a, b) => a.localeCompare(b))
  }, [schoolGrades, selectedGrade, form])

  const handleGradeChange = (grade: string) => {
    onGradeChange(grade)
  }

  const handleAcademicYearChange = (academicYear: string) => {
    form.setValue('academic_year', academicYear)
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
        <CardContent className='p-0 space-y-6'>
          <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
            <div>
              <Label htmlFor='first_name' className='block mb-3 text-sm font-medium text-gray-700'>
                First Name <span className='text-lg text-red-500'>*</span>
              </Label>
              <Input
                id='first_name'
                value={firstName}
                onChange={e => onFirstNameChange(e.target.value)}
                placeholder='First name'
              />
            </div>
            <div>
              <Label htmlFor='last_name' className='block mb-3 text-sm font-medium text-gray-700'>
                Last Name <span className='text-lg text-red-500'>*</span>
              </Label>
              <Input
                id='last_name'
                value={lastName}
                onChange={e => onLastNameChange(e.target.value)}
                placeholder='Last name'
              />
            </div>
          </div>

          <div>
            <Label htmlFor='grade' className='block mb-3 text-sm font-medium text-gray-700'>
              Grade Level <span className='text-lg text-red-500'>*</span>
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
              <Label className='block mb-3 text-sm font-medium text-gray-700'>
                Academic Year <span className='text-lg text-red-500'>*</span>
              </Label>
              <Select
                value={(form.watch('academic_year') as string) || currentAcademicYear}
                onValueChange={handleAcademicYearChange}>
                <SelectTrigger>
                  <SelectValue placeholder='Select academic year' />
                </SelectTrigger>
                <SelectContent>
                  {availableAcademicYears.map(academicYear => (
                    <SelectItem key={academicYear} value={academicYear}>
                      {academicYear}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export default EditScreeningStep1
