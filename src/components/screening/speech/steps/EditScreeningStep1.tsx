import React, { useState, useCallback, useEffect } from 'react'
import { UseFormReturn } from 'react-hook-form'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
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

  const [localAbsentValue, setLocalAbsentValue] = useState<boolean>(
    () => form.getValues('absent.isAbsent') || false
  )
  const [localNoConsentValue, setLocalNoConsentValue] = useState<boolean>(
    () => form.getValues('no_consent.isNoConsent') || false
  )

  const handleAbsentChange = useCallback(
    (checked: boolean) => {
      if (checked && localNoConsentValue) return

      setLocalAbsentValue(checked)

      if (checked) {
        setLocalNoConsentValue(false)
        form.setValue('no_consent', { isNoConsent: false, notes: '' })
        form.setValue('qualifies_for_speech_program', false)
        form.setValue('sub', false)
      }

      form.setValue('absent', {
        isAbsent: checked,
        notes: form.getValues('absent.notes') || '',
      })

      if (
        !checked &&
        !localNoConsentValue &&
        !form.getValues('complex_needs') &&
        !form.getValues('unable_to_screen')
      ) {
        form.setValue('priority_re_screen', false)
        form.setValue('priority_re_screen_notes', '')
      }
    },
    [form, localNoConsentValue]
  )

  const handleNoConsentChange = useCallback(
    (checked: boolean) => {
      if (checked && localAbsentValue) return

      setLocalNoConsentValue(checked)

      if (checked) {
        setLocalAbsentValue(false)
        form.setValue('absent', { isAbsent: false, notes: '' })
        form.setValue('priority_re_screen', false)
        form.setValue('priority_re_screen_notes', '')
      }

      form.setValue('no_consent', {
        isNoConsent: checked,
        notes: form.getValues('no_consent.notes') || '',
      })

      if (
        !checked &&
        !localAbsentValue &&
        !form.getValues('complex_needs') &&
        !form.getValues('unable_to_screen')
      ) {
        form.setValue('priority_re_screen', false)
        form.setValue('priority_re_screen_notes', '')
      }
    },
    [form, localAbsentValue]
  )

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

  const showPriorityReScreen =
    localAbsentValue || Boolean(form.watch('complex_needs')) || Boolean(form.watch('unable_to_screen'))

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

          <div className='space-y-3'>
            <div className='flex items-center space-x-2'>
              <Checkbox
                id='absent'
                checked={localAbsentValue}
                onCheckedChange={handleAbsentChange}
                disabled={
                  localNoConsentValue ||
                  Boolean(form.watch('complex_needs')) ||
                  Boolean(form.watch('unable_to_screen'))
                }
              />
              <Label
                htmlFor='absent'
                className={`text-sm font-medium ${
                  localNoConsentValue ||
                  Boolean(form.watch('complex_needs')) ||
                  Boolean(form.watch('unable_to_screen'))
                    ? 'text-gray-400'
                    : ''
                }`}>
                Absent
              </Label>
            </div>

            <div className='flex items-center space-x-2'>
              <Checkbox
                id='no_consent'
                checked={localNoConsentValue}
                onCheckedChange={handleNoConsentChange}
                disabled={
                  localAbsentValue ||
                  Boolean(form.watch('complex_needs')) ||
                  Boolean(form.watch('unable_to_screen'))
                }
              />
              <Label
                htmlFor='no_consent'
                className={`text-sm font-medium ${
                  localAbsentValue ||
                  Boolean(form.watch('complex_needs')) ||
                  Boolean(form.watch('unable_to_screen'))
                    ? 'text-gray-400'
                    : ''
                }`}>
                No Consent (Test)
              </Label>
            </div>

            <div className='flex items-center space-x-2'>
              <Checkbox
                id='complex_needs'
                checked={Boolean(form.watch('complex_needs'))}
                disabled={
                  localAbsentValue || localNoConsentValue || Boolean(form.watch('unable_to_screen'))
                }
                onCheckedChange={checked => {
                  form.setValue('complex_needs', Boolean(checked))
                  if (checked) {
                    form.setValue('unable_to_screen', false)
                    setLocalAbsentValue(false)
                    setLocalNoConsentValue(false)
                    form.setValue('absent', { isAbsent: false, notes: '' })
                    form.setValue('no_consent', { isNoConsent: false, notes: '' })
                  }
                  if (
                    !checked &&
                    !form.getValues('unable_to_screen') &&
                    !localAbsentValue &&
                    !localNoConsentValue
                  ) {
                    form.setValue('priority_re_screen', false)
                    form.setValue('priority_re_screen_notes', '')
                  }
                }}
              />
              <Label
                htmlFor='complex_needs'
                className={`text-sm font-medium ${localAbsentValue || localNoConsentValue || Boolean(form.watch('unable_to_screen')) ? 'text-gray-400' : ''}`}>
                Complex Needs (unable to screen)
              </Label>
            </div>

            <div className='flex items-center space-x-2'>
              <Checkbox
                id='unable_to_screen'
                checked={Boolean(form.watch('unable_to_screen'))}
                disabled={
                  localAbsentValue || localNoConsentValue || Boolean(form.watch('complex_needs'))
                }
                onCheckedChange={checked => {
                  form.setValue('unable_to_screen', Boolean(checked))
                  if (checked) {
                    form.setValue('complex_needs', false)
                    setLocalAbsentValue(false)
                    setLocalNoConsentValue(false)
                    form.setValue('absent', { isAbsent: false, notes: '' })
                    form.setValue('no_consent', { isNoConsent: false, notes: '' })
                  }
                  if (
                    !checked &&
                    !form.getValues('complex_needs') &&
                    !localAbsentValue &&
                    !localNoConsentValue
                  ) {
                    form.setValue('priority_re_screen', false)
                    form.setValue('priority_re_screen_notes', '')
                  }
                }}
              />
              <Label
                htmlFor='unable_to_screen'
                className={`text-sm font-medium ${localAbsentValue || localNoConsentValue || Boolean(form.watch('complex_needs')) ? 'text-gray-400' : ''}`}>
                Student Refusal / Compliance (unable to screen)
              </Label>
            </div>

            {showPriorityReScreen && (
              <div>
                <div className='flex items-center space-x-2'>
                  <Checkbox
                    id='priority_re_screen'
                    checked={Boolean(form.watch('priority_re_screen'))}
                    onCheckedChange={checked => {
                      form.setValue('priority_re_screen', Boolean(checked))
                      if (!checked) {
                        form.setValue('priority_re_screen_notes', '')
                      }
                    }}
                  />
                  <Label htmlFor='priority_re_screen' className='text-sm font-medium'>
                    Priority re-screen
                  </Label>
                </div>

                {Boolean(form.watch('priority_re_screen')) && (
                  <div className='mt-2'>
                    <Label htmlFor='priority_re_screen_notes' className='text-sm font-medium'>
                      Priority Re-screen Notes (optional)
                    </Label>
                    <Textarea
                      {...form.register('priority_re_screen_notes')}
                      placeholder='Enter notes about why this student needs a priority re-screen'
                      rows={2}
                      className='mt-1'
                    />
                  </div>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default EditScreeningStep1
