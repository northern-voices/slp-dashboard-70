import React, { useState } from 'react'
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
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { User, Volume2, FileText, X } from 'lucide-react'
import StudentSearchSelector from '../../StudentSearchSelector'
import { Student } from '@/types/database'
import { HEARING_GRADE_MAPPING } from '@/constants/app'

interface HearingScreeningFormValues {
  screening_type: string
  screening_date: string
  screening_result: string
  right_vol: string | null
  right_compliance: string | null
  right_press: string | null
  left_vol: string | null
  left_compliance: string | null
  left_press: string | null
  clinical_notes: string
  referral_notes: string
}

interface HearingScreeningStep1Props {
  form: UseFormReturn<HearingScreeningFormValues>
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
  // State for immeasurable checkboxes
  const [rightVolumeImmeasurable, setRightVolumeImmeasurable] = useState(false)
  const [rightComplianceImmeasurable, setRightComplianceImmeasurable] = useState(false)
  const [rightPressureImmeasurable, setRightPressureImmeasurable] = useState(false)
  const [leftVolumeImmeasurable, setLeftVolumeImmeasurable] = useState(false)
  const [leftComplianceImmeasurable, setLeftComplianceImmeasurable] = useState(false)
  const [leftPressureImmeasurable, setLeftPressureImmeasurable] = useState(false)

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
              Grade Level <span className='text-red-500 text-lg'>*</span>
            </Label>
            <Select value={selectedGrade} onValueChange={handleGradeChange}>
              <SelectTrigger>
                <SelectValue placeholder='Select grade' />
              </SelectTrigger>
              <SelectContent>
                {HEARING_GRADE_MAPPING.map(grade => (
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
            <>
              <div className='mt-6 p-4 bg-blue-50 rounded-lg flex items-start gap-3'>
                <button
                  type='button'
                  onClick={() => onStudentSelect(null)}
                  className='mt-0.5 p-1 hover:bg-blue-200 rounded-full transition-colors flex-shrink-0'
                  aria-label='Remove selected student'>
                  <X className='w-4 h-4 text-blue-600' />
                </button>

                <div>
                  <h4 className='text-sm font-semibold text-blue-900 mb-2'>Selected Student</h4>
                  <p className='text-sm text-blue-800 font-medium'>
                    {selectedStudent.first_name} {selectedStudent.last_name} - Grade{' '}
                    {selectedStudent.grade}
                  </p>
                  <p className='text-xs text-blue-600 mt-1'>
                    Student ID: {selectedStudent.student_id}
                  </p>
                </div>
              </div>

              {form.watch('screening_result') && (
                <div className='p-4 bg-green-50 border border-green-200 rounded-lg'>
                  <p className='text-sm text-green-800'>
                    <strong>Note:</strong> Since you've selected a screening result, you can submit
                    the form now without entering tympanometry data.
                  </p>
                </div>
              )}
            </>
          )}

          {selectedGrade && (
            <div>
              <Label
                htmlFor='screening_result'
                className='mb-3 block text-sm font-medium text-gray-700'>
                Screening Result
              </Label>
              <div className='relative'>
                <Select
                  value={form.watch('screening_result') || ''}
                  onValueChange={value => {
                    if (value === 'none') {
                      form.setValue('screening_result', '')
                    } else {
                      form.setValue('screening_result', value)
                    }
                  }}>
                  <SelectTrigger>
                    <SelectValue placeholder='Select result (optional)' />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='absent'>Absent</SelectItem>
                    <SelectItem value='non_compliant'>Non Compliant</SelectItem>
                    <SelectItem value='complex_needs'>Complex Needs</SelectItem>
                    <SelectItem value='results_uncertain'>Results Uncertain</SelectItem>
                  </SelectContent>
                </Select>
                {form.watch('screening_result') && (
                  <button
                    type='button'
                    onClick={() => form.setValue('screening_result', '')}
                    className='absolute right-8 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-100 rounded-full transition-colors'>
                    <X className='w-4 h-4 text-gray-500' />
                  </button>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Screening Details Section - Only show when student is selected AND no result is selected */}
      {selectedStudent && !form.watch('screening_result') && (
        <>
          <Card className='border-0 rounded-none shadow-none'>
            <CardHeader className='px-0 pt-0 pb-0 mb-6'>
              <CardTitle className='flex items-center gap-2 text-lg font-semibold text-gray-900'>
                <Volume2 className='w-5 h-5' />
                Screening Details
              </CardTitle>
            </CardHeader>
            <CardContent className='space-y-6 p-0'>
              <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                <div>
                  <Label
                    htmlFor='screening_type'
                    className='mb-3 block text-sm font-medium text-gray-700'>
                    Screening Type <span className='text-red-500 text-lg'>*</span>
                  </Label>
                  <Select
                    value={form.watch('screening_type')}
                    onValueChange={value => form.setValue('screening_type', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder='Select screening type' />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value='initial'>Initial</SelectItem>
                      <SelectItem value='progress'>Progress</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label
                    htmlFor='screening_date'
                    className='mb-3 block text-sm font-medium text-gray-700'>
                    Screening Date <span className='text-red-500 text-lg'>*</span>
                  </Label>
                  <Input type='date' {...form.register('screening_date')} />
                </div>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle className='text-lg'>Tympanometry Results</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                    {/* Right Ear Tympanometry */}
                    <div>
                      <h4 className='font-medium mb-3'>Right Ear</h4>
                      <div className='space-y-3'>
                        <div>
                          <Label htmlFor='right_vol' className='text-sm font-medium text-gray-700'>
                            R+ Volume (ml)
                          </Label>
                          <Input
                            type='number'
                            step='0.01'
                            placeholder='0.0'
                            {...form.register('right_vol')}
                            disabled={rightVolumeImmeasurable}
                          />
                          <div className='flex items-center space-x-2 mt-2'>
                            <Checkbox
                              id='right_vol_immeasurable'
                              checked={rightVolumeImmeasurable}
                              onCheckedChange={checked => {
                                setRightVolumeImmeasurable(checked as boolean)
                                if (checked) {
                                  // Set to null when immeasurable
                                  form.setValue('right_vol', null)
                                } else {
                                  // Clear field when unchecked
                                  form.setValue('right_vol', '')
                                }
                              }}
                            />
                            <label
                              htmlFor='right_vol_immeasurable'
                              className='text-sm text-gray-600 cursor-pointer'>
                              Immeasurable
                            </label>
                          </div>
                        </div>
                        <div>
                          <Label
                            htmlFor='right_compliance'
                            className='text-sm font-medium text-gray-700'>
                            R+ Compliance (ml)
                          </Label>
                          <Input
                            type='number'
                            step='0.01'
                            placeholder='0.0'
                            {...form.register('right_compliance')}
                            disabled={rightComplianceImmeasurable}
                          />
                          <div className='flex items-center space-x-2 mt-2'>
                            <Checkbox
                              id='right_compliance_immeasurable'
                              checked={rightComplianceImmeasurable}
                              onCheckedChange={checked => {
                                setRightComplianceImmeasurable(checked as boolean)
                                if (checked) {
                                  // Set to null when immeasurable
                                  form.setValue('right_compliance', null)
                                } else {
                                  // Clear field when unchecked
                                  form.setValue('right_compliance', '')
                                }
                              }}
                            />
                            <label
                              htmlFor='right_compliance_immeasurable'
                              className='text-sm text-gray-600 cursor-pointer'>
                              Immeasurable
                            </label>
                          </div>
                        </div>
                        <div>
                          <Label
                            htmlFor='right_press'
                            className='text-sm font-medium text-gray-700'>
                            R+ Pressure (daPa)
                          </Label>
                          <Input
                            type='number'
                            step='1'
                            placeholder='0'
                            {...form.register('right_press')}
                            disabled={rightPressureImmeasurable}
                          />
                          <div className='flex items-center space-x-2 mt-2'>
                            <Checkbox
                              id='right_press_immeasurable'
                              checked={rightPressureImmeasurable}
                              onCheckedChange={checked => {
                                setRightPressureImmeasurable(checked as boolean)
                                if (checked) {
                                  // Set to null when immeasurable
                                  form.setValue('right_press', null)
                                } else {
                                  // Clear field when unchecked
                                  form.setValue('right_press', '')
                                }
                              }}
                            />
                            <label
                              htmlFor='right_press_immeasurable'
                              className='text-sm text-gray-600 cursor-pointer'>
                              Immeasurable
                            </label>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Left Ear Tympanometry */}
                    <div>
                      <h4 className='font-medium mb-3'>Left Ear</h4>
                      <div className='space-y-3'>
                        <div>
                          <Label htmlFor='left_vol' className='text-sm font-medium text-gray-700'>
                            L+ Volume (ml)
                          </Label>
                          <Input
                            type='number'
                            step='0.01'
                            placeholder='0.0'
                            {...form.register('left_vol')}
                            disabled={leftVolumeImmeasurable}
                          />
                          <div className='flex items-center space-x-2 mt-2'>
                            <Checkbox
                              id='left_vol_immeasurable'
                              checked={leftVolumeImmeasurable}
                              onCheckedChange={checked => {
                                setLeftVolumeImmeasurable(checked as boolean)
                                if (checked) {
                                  // Set to null when immeasurable
                                  form.setValue('left_vol', null)
                                } else {
                                  // Clear field when unchecked
                                  form.setValue('left_vol', '')
                                }
                              }}
                            />
                            <label
                              htmlFor='left_vol_immeasurable'
                              className='text-sm text-gray-600 cursor-pointer'>
                              Immeasurable
                            </label>
                          </div>
                        </div>
                        <div>
                          <Label htmlFor='left_comp' className='text-sm font-medium text-gray-700'>
                            L+ Compliance (ml)
                          </Label>
                          <Input
                            type='number'
                            step='0.01'
                            placeholder='0.0'
                            {...form.register('left_compliance')}
                            disabled={leftComplianceImmeasurable}
                          />
                          <div className='flex items-center space-x-2 mt-2'>
                            <Checkbox
                              id='left_compliance_immeasurable'
                              checked={leftComplianceImmeasurable}
                              onCheckedChange={checked => {
                                setLeftComplianceImmeasurable(checked as boolean)
                                if (checked) {
                                  // Set to null when immeasurable
                                  form.setValue('left_compliance', null)
                                } else {
                                  // Clear field when unchecked
                                  form.setValue('left_compliance', '')
                                }
                              }}
                            />
                            <label
                              htmlFor='left_compliance_immeasurable'
                              className='text-sm text-gray-600 cursor-pointer'>
                              Immeasurable
                            </label>
                          </div>
                        </div>
                        <div>
                          <Label htmlFor='left_press' className='text-sm font-medium text-gray-700'>
                            L+ Pressure (daPa)
                          </Label>
                          <Input
                            type='number'
                            step='1'
                            placeholder='0'
                            {...form.register('left_press')}
                            disabled={leftPressureImmeasurable}
                          />
                          <div className='flex items-center space-x-2 mt-2'>
                            <Checkbox
                              id='left_press_immeasurable'
                              checked={leftPressureImmeasurable}
                              onCheckedChange={checked => {
                                setLeftPressureImmeasurable(checked as boolean)
                                if (checked) {
                                  // Set to null when immeasurable
                                  form.setValue('left_press', null)
                                } else {
                                  // Clear field when unchecked
                                  form.setValue('left_press', '')
                                }
                              }}
                            />
                            <label
                              htmlFor='left_press_immeasurable'
                              className='text-sm text-gray-600 cursor-pointer'>
                              Immeasurable
                            </label>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </CardContent>
          </Card>

          {/* Notes Section */}
          <Card className='border-0 rounded-none shadow-none'>
            <CardHeader className='px-0 pt-0 pb-0 mb-6'>
              <CardTitle className='flex items-center gap-2 text-lg font-semibold text-gray-900'>
                <FileText className='w-5 h-5' />
                Notes
              </CardTitle>
            </CardHeader>
            <CardContent className='space-y-6 p-0'>
              <div>
                <Label
                  htmlFor='clinical_notes'
                  className='mb-3 block text-sm font-medium text-gray-700'>
                  Clinical Notes (Private)
                </Label>
                <Textarea
                  placeholder='Enter clinical observations and findings...'
                  rows={4}
                  {...form.register('clinical_notes')}
                />
              </div>

              <div>
                <Label
                  htmlFor='referral_notes'
                  className='mb-3 block text-sm font-medium text-gray-700'>
                  Referral Notes (Included in Reports)
                </Label>
                <Textarea
                  placeholder='Enter referral information and recommendations...'
                  rows={3}
                  {...form.register('referral_notes')}
                />
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  )
}

export default HearingScreeningStep1
