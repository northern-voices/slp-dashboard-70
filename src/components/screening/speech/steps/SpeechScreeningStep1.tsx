import React, { useState, useCallback, useMemo, useEffect } from 'react'
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
import { useOrganization } from '@/contexts/OrganizationContext'
import { GRADE_MAPPING } from '@/constants/app'

interface SpeechScreeningStep1Props {
  form: UseFormReturn<Record<string, unknown>>
  selectedStudent: Student | null
  selectedGrade: string
  onStudentSelect: (student: Student | null) => void
  onGradeChange: (grade: string) => void
  onGradeIdChange: (gradeId: string) => void
  onAbsentChange?: (isAbsent: boolean) => void
  onNoConsentChange?: (isNoConsent: boolean) => void
  onComplexNeedsChange?: (isComplexNeeds: boolean) => void
  onUnableToScreenChange?: (isUnableToScreen: boolean) => void
  afterStudentContent?: React.ReactNode
}

const SpeechScreeningStep1 = ({
  form,
  selectedStudent,
  selectedGrade,
  onStudentSelect,
  onGradeChange,
  onGradeIdChange,
  onAbsentChange,
  onNoConsentChange,
  onComplexNeedsChange,
  onUnableToScreenChange,
  afterStudentContent,
}: SpeechScreeningStep1Props) => {
  const { currentSchool } = useOrganization()

  // Fetch available school grades for the current organization
  const { data: schoolGrades } = useSchoolGrades()

  // Use local state for immediate UI response, sync with form
  const [localAbsentValue, setLocalAbsentValue] = useState<boolean>(
    () => (form.getValues('absent.isAbsent') as boolean) || false
  )
  const [localNoConsentValue, setLocalNoConsentValue] = useState<boolean>(
    () => (form.getValues('no_consent.isNoConsent') as boolean) || false
  )

  // Memoized handler for absent checkbox to prevent unnecessary re-renders
  const handleAbsentChange = useCallback(
    (checked: boolean) => {
      // Don't allow checking absent if no consent is already checked
      if (checked && localNoConsentValue) {
        return
      }

      // Update local state immediately for responsive UI
      setLocalAbsentValue(checked)

      // If absent is checked, uncheck no consent
      if (checked) {
        setLocalNoConsentValue(false)
        form.setValue('no_consent', {
          isNoConsent: false,
          notes: '',
        })
      }

      // Update form state and trigger re-render
      form.setValue('absent', {
        isAbsent: checked,
        notes: form.getValues('absent.notes') || '',
      })

      // Notify parent component of the change
      onAbsentChange?.(checked)
    },
    [form, onAbsentChange, localNoConsentValue]
  )

  // Memoized handler for no consent checkbox to prevent unnecessary re-renders
  const handleNoConsentChange = useCallback(
    (checked: boolean) => {
      // Don't allow checking no consent if absent is already checked
      if (checked && localAbsentValue) {
        return
      }

      // Update local state immediately for responsive UI
      setLocalNoConsentValue(checked)

      // If no consent is checked, uncheck absent
      if (checked) {
        setLocalAbsentValue(false)
        form.setValue('absent', {
          isAbsent: false,
          notes: '',
        })
        // Notify parent component that absent is now false
        onAbsentChange?.(false)
      }

      // Update form state and trigger re-render
      form.setValue('no_consent', {
        isNoConsent: checked,
        notes: form.getValues('no_consent.notes') || '',
      })

      // Notify parent component of the change
      onNoConsentChange?.(checked)
    },
    [form, onAbsentChange, onNoConsentChange, localAbsentValue]
  )

  // Sync local state with form state on mount
  useEffect(() => {
    const formAbsentValue = form.getValues('absent.isAbsent')
    if (formAbsentValue !== localAbsentValue) {
      setLocalAbsentValue(formAbsentValue || false)
    }

    const formNoConsentValue = form.getValues('no_consent.isNoConsent')
    if (formNoConsentValue !== localNoConsentValue) {
      setLocalNoConsentValue(formNoConsentValue || false)
    }
  }, [form, localAbsentValue, localNoConsentValue])

  // Filter grades based on selected grade level and get unique academic years
  const availableGradeIds = React.useMemo(() => {
    if (!selectedGrade) return []

    // Calculate current academic year correctly
    const currentDate = new Date()
    const currentYear = currentDate.getFullYear()
    const currentMonth = currentDate.getMonth() // 0-indexed (Jan = 0)

    // Academic year starts in August/September
    // Jan-July = previous year's academic year
    const academicYearStart = currentMonth < 7 ? currentYear - 1 : currentYear

    // Generate range of academic years
    const academicYears = []
    academicYears.push(`${academicYearStart - 1}-${academicYearStart}`)
    academicYears.push(`${academicYearStart}-${academicYearStart + 1}`)
    for (let i = 1; i <= 4; i++) {
      academicYears.push(`${academicYearStart + i}-${academicYearStart + i + 1}`)
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
    const uniqueGrades = filteredGrades.reduce(
      (acc, current) => {
        const existing = acc.find(item => item.academic_year === current.academic_year)
        if (!existing) {
          acc.push(current)
        }
        return acc
      },
      [] as typeof filteredGrades
    )

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

  // Set default grade ID when academic year options are available
  useEffect(() => {
    if (selectedGrade && availableGradeIds.length > 0) {
      // Calculate current academic year correctly
      const currentDate = new Date()
      const currentYear = currentDate.getFullYear()
      const currentMonth = currentDate.getMonth()
      const academicYearStart = currentMonth < 7 ? currentYear - 1 : currentYear
      const currentAcademicYear = `${academicYearStart}-${academicYearStart + 1}`

      const matchingGrade = availableGradeIds.find(g => g.academic_year === currentAcademicYear)

      if (matchingGrade && !matchingGrade.id.startsWith('placeholder-')) {
        onGradeIdChange(matchingGrade.id)
      }
    }
  }, [selectedGrade, availableGradeIds, onGradeIdChange])

  // Reset student selection when grade level changes
  // Grade ID will be set during form submission through backend validation
  const handleGradeChange = (grade: string) => {
    onGradeChange(grade)
    onStudentSelect(null)
    // Clear grade ID - it will be set during form submission validation
    onGradeIdChange('')
  }

  // Handler for academic year selection
  // Grade ID validation and creation will be handled during form submission
  const handleAcademicYearChange = async (academicYear: string) => {
    const matchingGrade = availableGradeIds.find(g => g.academic_year === academicYear)

    if (matchingGrade && !matchingGrade.id.startsWith('placeholder-')) {
      onGradeIdChange(matchingGrade.id)
    } else {
      onGradeIdChange('')
    }

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
        <CardContent className='space-y-6 p-0'>
          <div>
            <Label htmlFor='grade' className='mb-3 block text-sm font-medium text-gray-700'>
              Grade Level <span className='text-red-500 text-lg'>*</span>
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
                Select Student <span className='text-red-500 text-lg'>*</span>
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
                {selectedStudent.first_name} {selectedStudent.last_name}
              </p>
              <p className='text-xs text-blue-600 mt-1'>Grade: {selectedGrade}</p>
            </div>
          )}

          {afterStudentContent}

          {selectedGrade && (
            <div>
              <Label className='mb-3 block text-sm font-medium text-gray-700'>
                Academic Year <span className='text-red-500 text-lg'>*</span>
              </Label>
              <Select
                value={(() => {
                  const currentDate = new Date()
                  const currentYear = currentDate.getFullYear()
                  const currentMonth = currentDate.getMonth()
                  const academicYearStart = currentMonth < 7 ? currentYear - 1 : currentYear
                  const currentAcademicYear = `${academicYearStart}-${academicYearStart + 1}`
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
          {/* Screening Status Checkboxes - Only show after grade is selected */}
          {selectedGrade && (
            <div className='space-y-3'>
              <div className='flex items-center space-x-2'>
                <Checkbox
                  id='absent'
                  checked={localAbsentValue}
                  onCheckedChange={handleAbsentChange}
                  disabled={localNoConsentValue}
                />
                <Label
                  htmlFor='absent'
                  className={`text-sm font-medium ${localNoConsentValue ? 'text-gray-400' : ''}`}>
                  Absent
                </Label>
              </div>
              {localAbsentValue && (
                <div>
                  <Label htmlFor='absent_notes' className='text-sm font-medium'>
                    Absent Notes
                  </Label>
                  <Textarea
                    {...form.register('absent.notes')}
                    placeholder='Enter notes about absence...'
                    rows={2}
                    className='mt-1'
                  />
                </div>
              )}

              <div className='flex items-center space-x-2'>
                <Checkbox
                  id='no_consent'
                  checked={localNoConsentValue}
                  onCheckedChange={handleNoConsentChange}
                  disabled={localAbsentValue}
                />
                <Label
                  htmlFor='no_consent'
                  className={`text-sm font-medium ${localAbsentValue ? 'text-gray-400' : ''}`}>
                  No Consent
                </Label>
              </div>
              {localNoConsentValue && (
                <div>
                  <Label htmlFor='no_consent_notes' className='text-sm font-medium'>
                    No Consent Notes
                  </Label>
                  <Textarea
                    {...form.register('no_consent.notes')}
                    placeholder='Enter notes about consent...'
                    rows={2}
                    className='mt-1'
                  />
                </div>
              )}

              <div className='flex items-center space-x-2'>
                <Checkbox
                  id='complex_needs'
                  checked={Boolean(form.watch('complex_needs'))}
                  disabled={localAbsentValue || localNoConsentValue}
                  onCheckedChange={checked => {
                    form.setValue('complex_needs', Boolean(checked))
                    if (checked) {
                      form.setValue('unable_to_screen', false)
                      onUnableToScreenChange?.(false)
                    }
                    onComplexNeedsChange?.(Boolean(checked))
                  }}
                />
                <Label
                  htmlFor='complex_needs'
                  className={`text-sm font-medium ${localAbsentValue || localNoConsentValue ? 'text-gray-400' : ''}`}>
                  Complex Needs
                </Label>
              </div>

              <div className='flex items-center space-x-2'>
                <Checkbox
                  id='unable_to_screen'
                  checked={Boolean(form.watch('unable_to_screen'))}
                  disabled={localAbsentValue || localNoConsentValue}
                  onCheckedChange={checked => {
                    form.setValue('unable_to_screen', Boolean(checked))
                    if (checked) {
                      form.setValue('complex_needs', false)
                      onComplexNeedsChange?.(false)
                    }
                    onUnableToScreenChange?.(Boolean(checked))
                  }}
                />
                <Label
                  htmlFor='unable_to_screen'
                  className={`text-sm font-medium ${localAbsentValue || localNoConsentValue ? 'text-gray-400' : ''}`}>
                  Unable to Screen (Compliance)
                </Label>
              </div>

              {localAbsentValue || localNoConsentValue ? (
                <div className='flex items-center space-x-2'>
                  <Checkbox
                    id='priority_re_screen'
                    checked={Boolean(form.watch('priority_re_screen'))}
                    onCheckedChange={checked => {
                      form.setValue('priority_re_screen', Boolean(checked))
                    }}
                  />
                  <Label htmlFor='priority_re_screen' className='text-sm font-medium'>
                    Priority re-screen
                  </Label>
                </div>
              ) : (
                ''
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export default SpeechScreeningStep1
