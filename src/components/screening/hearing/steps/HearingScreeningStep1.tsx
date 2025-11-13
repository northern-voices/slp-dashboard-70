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
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { User, Volume2, FileText } from 'lucide-react'
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

const frequencies = ['250', '500', '1000', '2000', '4000']

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

      {/* Screening Details Section */}
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
                Screening Type *
              </Label>
              <Select {...form.register('screening_type')}>
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
                Screening Date *
              </Label>
              <Input type='date' {...form.register('screening_date')} />
            </div>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className='text-lg'>Pure Tone Screening Results</CardTitle>
              <p className='text-sm text-gray-600'>Record hearing threshold levels in dB HL</p>
            </CardHeader>
            <CardContent>
              <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                <div>
                  <h4 className='font-medium mb-3'>Right Ear</h4>
                  <div className='space-y-3'>
                    {frequencies.map(freq => (
                      <div key={`right-${freq}`} className='flex items-center gap-3'>
                        <Label className='w-16'>{freq} Hz</Label>
                        <Input
                          type='number'
                          placeholder='dB HL'
                          className='w-24'
                          min='0'
                          max='120'
                          {...form.register(`right_ear_${freq}`)}
                        />
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className='font-medium mb-3'>Left Ear</h4>
                  <div className='space-y-3'>
                    {frequencies.map(freq => (
                      <div key={`left-${freq}`} className='flex items-center gap-3'>
                        <Label className='w-16'>{freq} Hz</Label>
                        <Input
                          type='number'
                          placeholder='dB HL'
                          className='w-24'
                          min='0'
                          max='120'
                          {...form.register(`left_ear_${freq}`)}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className='text-lg'>Tympanometry Results</CardTitle>
            </CardHeader>
            <CardContent>
              <div className='space-y-4'>
                <Textarea
                  placeholder='Note tympanometry findings, ear canal volume, acoustic reflex results...'
                  rows={3}
                  {...form.register('tympanometry_results')}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className='text-lg'>Otoscopic Examination</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                placeholder='Describe ear canal and eardrum appearance for both ears...'
                rows={3}
                {...form.register('otoscopic_findings')}
              />
            </CardContent>
          </Card>
        </CardContent>
      </Card>

      {/* Results & Notes Section */}
      <Card className='border-0 rounded-none shadow-none'>
        <CardHeader className='px-0 pt-0 pb-0 mb-6'>
          <CardTitle className='flex items-center gap-2 text-lg font-semibold text-gray-900'>
            <FileText className='w-5 h-5' />
            Results & Notes
          </CardTitle>
        </CardHeader>
        <CardContent className='space-y-6 p-0'>
          <div>
            <Label
              htmlFor='hearing_observations'
              className='mb-3 block text-sm font-medium text-gray-700'>
              Behavioral Observations
            </Label>
            <Textarea
              placeholder="Note student's responses to sounds, following directions, attention during testing, any concerns raised by teacher/parent..."
              rows={4}
              {...form.register('hearing_observations')}
            />
          </div>

          <div>
            <Label htmlFor='general_notes' className='mb-3 block text-sm font-medium text-gray-700'>
              General Notes
            </Label>
            <Textarea
              placeholder='Additional observations, testing conditions, student cooperation...'
              rows={3}
              {...form.register('general_notes')}
            />
          </div>

          <div>
            <Label
              htmlFor='recommendations'
              className='mb-3 block text-sm font-medium text-gray-700'>
              Recommendations
            </Label>
            <Textarea
              placeholder='Recommendations for follow-up, referrals, accommodations...'
              rows={3}
              {...form.register('recommendations')}
            />
          </div>

          <div className='space-y-4'>
            <div className='flex items-center space-x-2'>
              <Checkbox id='follow_up_required' {...form.register('follow_up_required')} />
              <Label htmlFor='follow_up_required' className='text-sm font-medium text-gray-700'>
                Follow-up required
              </Label>
            </div>

            <div>
              <Label
                htmlFor='follow_up_date'
                className='mb-3 block text-sm font-medium text-gray-700'>
                Follow-up Date
              </Label>
              <Input type='date' {...form.register('follow_up_date')} />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default HearingScreeningStep1
