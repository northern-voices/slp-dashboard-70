import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Save, Send, Users, Plus, X } from 'lucide-react'
import Multiselect from '@/components/ui/multiselect'

interface ClassWideHearingScreeningFormProps {
  onSubmit: (data: any) => void
  onCancel: () => void
}

interface StudentHearingData {
  id: string
  name: string
  grade: string
  rightEar: Record<string, string>
  leftEar: Record<string, string>
  tympanometry: string
  notes: string
  result: string
}

const ClassWideHearingScreeningForm = ({
  onSubmit,
  onCancel,
}: ClassWideHearingScreeningFormProps) => {
  const [selectedGrades, setSelectedGrades] = useState<string[]>([])
  const [students, setStudents] = useState<StudentHearingData[]>([])
  const [currentStudent, setCurrentStudent] = useState<Partial<StudentHearingData>>({
    rightEar: {},
    leftEar: {},
    tympanometry: 'normal',
    result: 'pass',
  })

  const form = useForm({
    defaultValues: {
      screening_date: new Date().toISOString().split('T')[0],
      screening_type: 'initial',
      class_teacher: '',
      academic_year: '',
      equipment_used: '',
    },
  })

  const grades = [
    'K',
    '1st',
    '2nd',
    '3rd',
    '4th',
    '5th',
    '6th',
    '7th',
    '8th',
    '9th',
    '10th',
    '11th',
    '12th',
  ]
  const frequencies = ['500Hz', '1000Hz', '2000Hz', '4000Hz', '8000Hz']
  const hearingLevels = ['0', '5', '10', '15', '20', '25', '30', '35', '40', '45', '50', 'NR']

  const addStudent = () => {
    if (currentStudent.name) {
      const newStudent: StudentHearingData = {
        id: Date.now().toString(),
        name: currentStudent.name,
        grade: currentStudent.grade || '',
        rightEar: currentStudent.rightEar || {},
        leftEar: currentStudent.leftEar || {},
        tympanometry: currentStudent.tympanometry || 'normal',
        notes: currentStudent.notes || '',
        result: currentStudent.result || 'pass',
      }
      setStudents([...students, newStudent])
      setCurrentStudent({ rightEar: {}, leftEar: {}, tympanometry: 'normal', result: 'pass' })
    }
  }

  const removeStudent = (id: string) => {
    setStudents(students.filter(s => s.id !== id))
  }

  const updateEarReading = (ear: 'rightEar' | 'leftEar', frequency: string, value: string) => {
    setCurrentStudent({
      ...currentStudent,
      [ear]: {
        ...currentStudent[ear],
        [frequency]: value,
      },
    })
  }

  const handleFormSubmit = (data: any) => {
    const formData = {
      ...data,
      form_type: 'hearing',
      mode: 'classwide',
      grades: selectedGrades,
      students: students,
    }
    onSubmit(formData)
  }

  const getResultColor = (result: string) => {
    switch (result) {
      case 'pass':
        return 'bg-green-100 text-green-800'
      case 'refer':
        return 'bg-red-100 text-red-800'
      case 'rescreen':
        return 'bg-yellow-100 text-yellow-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <form onSubmit={form.handleSubmit(handleFormSubmit)} className='space-y-6'>
      {/* Class Information */}
      <Card>
        <CardHeader>
          <CardTitle className='flex items-center gap-2'>
            <Users className='w-5 h-5' />
            Class-Wide Hearing Screening
          </CardTitle>
        </CardHeader>
        <CardContent className='grid grid-cols-1 md:grid-cols-2 gap-4'>
          <div>
            <Label htmlFor='screening_date'>Screening Date</Label>
            <Input type='date' {...form.register('screening_date')} />
          </div>
          <div>
            <Label htmlFor='screening_type'>Screening Type</Label>
            <Select onValueChange={value => form.setValue('screening_type', value)}>
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
            <Label htmlFor='class_teacher'>Class Teacher</Label>
            <Input {...form.register('class_teacher')} placeholder='Teacher name' />
          </div>
          <div>
            <Label htmlFor='academic_year'>Academic Year</Label>
            <Input {...form.register('academic_year')} placeholder='2024-2025' />
          </div>
          <div className='md:col-span-2'>
            <Label htmlFor='equipment_used'>Equipment Used</Label>
            <Input
              {...form.register('equipment_used')}
              placeholder='Audiometer model, calibration date, etc.'
            />
          </div>
        </CardContent>
      </Card>

      {/* Grade Selection */}
      <Card>
        <CardHeader>
          <CardTitle>Grade Selection</CardTitle>
        </CardHeader>
        <CardContent>
          <div>
            <Label>Select Grades</Label>
            <Multiselect
              options={grades}
              selected={selectedGrades}
              onChange={setSelectedGrades}
              placeholder='Select grades for screening...'
              className='w-full mt-2'
            />
          </div>
        </CardContent>
      </Card>

      {/* Student Entry Form */}
      <Card>
        <CardHeader>
          <CardTitle>Add Students</CardTitle>
        </CardHeader>
        <CardContent className='space-y-4'>
          <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
            <div>
              <Label>Student Name</Label>
              <Input
                value={currentStudent.name || ''}
                onChange={e => setCurrentStudent({ ...currentStudent, name: e.target.value })}
                placeholder='Enter student name'
              />
            </div>
            <div>
              <Label>Grade</Label>
              <Select
                onValueChange={value => setCurrentStudent({ ...currentStudent, grade: value })}>
                <SelectTrigger>
                  <SelectValue placeholder='Select grade' />
                </SelectTrigger>
                <SelectContent>
                  {grades.map(grade => (
                    <SelectItem key={grade} value={grade}>
                      {grade}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Hearing Thresholds */}
          <div className='space-y-4'>
            <div>
              <Label className='text-base font-medium'>Right Ear Thresholds (dB HL)</Label>
              <div className='grid grid-cols-5 gap-2 mt-2'>
                {frequencies.map(freq => (
                  <div key={freq}>
                    <Label className='text-xs'>{freq}</Label>
                    <Select
                      onValueChange={value => updateEarReading('rightEar', freq, value)}
                      value={currentStudent.rightEar?.[freq] || ''}>
                      <SelectTrigger className='h-8'>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {hearingLevels.map(level => (
                          <SelectItem key={level} value={level}>
                            {level}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <Label className='text-base font-medium'>Left Ear Thresholds (dB HL)</Label>
              <div className='grid grid-cols-5 gap-2 mt-2'>
                {frequencies.map(freq => (
                  <div key={freq}>
                    <Label className='text-xs'>{freq}</Label>
                    <Select
                      onValueChange={value => updateEarReading('leftEar', freq, value)}
                      value={currentStudent.leftEar?.[freq] || ''}>
                      <SelectTrigger className='h-8'>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {hearingLevels.map(level => (
                          <SelectItem key={level} value={level}>
                            {level}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
            <div>
              <Label>Tympanometry</Label>
              <Select
                onValueChange={value =>
                  setCurrentStudent({ ...currentStudent, tympanometry: value })
                }
                value={currentStudent.tympanometry}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='normal'>Normal</SelectItem>
                  <SelectItem value='flat'>Flat</SelectItem>
                  <SelectItem value='negative'>Negative Pressure</SelectItem>
                  <SelectItem value='no_seal'>No Seal</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Result</Label>
              <Select
                onValueChange={value => setCurrentStudent({ ...currentStudent, result: value })}
                value={currentStudent.result}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='pass'>Pass</SelectItem>
                  <SelectItem value='refer'>Refer</SelectItem>
                  <SelectItem value='rescreen'>Rescreen</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Notes</Label>
              <Input
                value={currentStudent.notes || ''}
                onChange={e => setCurrentStudent({ ...currentStudent, notes: e.target.value })}
                placeholder='Additional notes'
              />
            </div>
          </div>

          <Button
            type='button'
            onClick={addStudent}
            disabled={!currentStudent.name}
            className='flex items-center gap-2'>
            <Plus className='w-4 h-4' />
            Add Student
          </Button>
        </CardContent>
      </Card>

      {/* Students List */}
      {students.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Students Added ({students.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className='space-y-3'>
              {students.map(student => (
                <div
                  key={student.id}
                  className='flex items-center justify-between p-3 border rounded-lg'>
                  <div className='flex-1'>
                    <div className='flex items-center gap-2 mb-2'>
                      <span className='font-medium'>{student.name}</span>
                      <Badge variant='outline'>{student.grade}</Badge>
                      <Badge className={getResultColor(student.result)}>
                        {student.result.toUpperCase()}
                      </Badge>
                    </div>
                    <div className='text-sm text-gray-600'>
                      <span>Tympanometry: {student.tympanometry}</span>
                      {student.notes && <span className='ml-4'>Notes: {student.notes}</span>}
                    </div>
                  </div>
                  <Button
                    type='button'
                    variant='ghost'
                    size='sm'
                    onClick={() => removeStudent(student.id)}
                    className='text-red-600 hover:text-red-800'>
                    <X className='w-4 h-4' />
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Action Buttons */}
      <div className='flex justify-end gap-3 pt-4 border-t'>
        <Button type='button' variant='outline' onClick={onCancel}>
          Cancel
        </Button>
        <Button type='button' variant='outline' className='flex items-center gap-2'>
          <Save className='w-4 h-4' />
          Save Draft
        </Button>
        <Button type='submit' disabled={students.length === 0} className='flex items-center gap-2'>
          <Send className='w-4 h-4' />
          Submit Class Screening
        </Button>
      </div>
    </form>
  )
}

export default ClassWideHearingScreeningForm
