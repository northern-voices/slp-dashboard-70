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
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import { Save, Send, Users, Plus, X } from 'lucide-react'
import Multiselect from '@/components/ui/multiselect'

interface ClassWideSpeechScreeningFormProps {
  onSubmit: (data: any) => void
  onCancel: () => void
}

interface StudentScreeningData {
  id: string
  name: string
  grade: string
  concerns: string[]
  sounds: string[]
  notes: string
  recommendations: string
}

const ClassWideSpeechScreeningForm = ({
  onSubmit,
  onCancel,
}: ClassWideSpeechScreeningFormProps) => {
  const [selectedGrades, setSelectedGrades] = useState<string[]>([])
  const [students, setStudents] = useState<StudentScreeningData[]>([])
  const [currentStudent, setCurrentStudent] = useState<Partial<StudentScreeningData>>({
    concerns: [],
    sounds: [],
  })

  const form = useForm({
    defaultValues: {
      screening_date: new Date().toISOString().split('T')[0],
      screening_type: 'initial',
      class_teacher: '',
      academic_year: '',
    },
  })

  const grades = [
    'Nursery',
    'Pre-K',
    'K4',
    'K5',
    'Kindergarten',
    'K/1',
    '1st',
    '1/2',
    '2nd',
    '2/3',
    '3rd',
    '3/4',
    '4th',
    '4/5',
    '5th',
    '5/6',
    '6th',
    '6/7',
    '7th',
    '7/8',
    '8th',
    '8/9',
    '9th',
    '9/10',
    '10th',
    '10/11',
    '11th',
    '11/12',
    '12th',
  ]

  const speechConcerns = [
    'Language Comprehension',
    'Language Expression',
    'Social Communication',
    'Voice',
    'Fluency',
    'Stuttering',
    'Articulation',
    'Suspected CAS',
    'Literacy',
    'Reluctant Speaking',
    'Cleft lip / pallet',
    'Diagnoses',
  ]

  const commonSounds = [
    '/r/',
    '/s/',
    '/z/',
    '/th/',
    '/l/',
    '/k/',
    '/g/',
    '/f/',
    '/v/',
    '/sh/',
    '/ch/',
    '/j/',
    '/bl/',
    '/br/',
    '/cl/',
    '/cr/',
    '/dr/',
    '/fl/',
    '/fr/',
    '/gl/',
    '/gr/',
    '/pl/',
    '/pr/',
  ]

  const addStudent = () => {
    if (currentStudent.name) {
      const newStudent: StudentScreeningData = {
        id: Date.now().toString(),
        name: currentStudent.name,
        grade: currentStudent.grade || '',
        concerns: currentStudent.concerns || [],
        sounds: currentStudent.sounds || [],
        notes: currentStudent.notes || '',
        recommendations: currentStudent.recommendations || '',
      }
      setStudents([...students, newStudent])
      setCurrentStudent({ concerns: [], sounds: [] })
    }
  }

  const removeStudent = (id: string) => {
    setStudents(students.filter(s => s.id !== id))
  }

  const handleConcernToggle = (concern: string) => {
    const updated = currentStudent.concerns?.includes(concern)
      ? currentStudent.concerns.filter(c => c !== concern)
      : [...(currentStudent.concerns || []), concern]
    setCurrentStudent({ ...currentStudent, concerns: updated })
  }

  const handleSoundToggle = (sound: string) => {
    const updated = currentStudent.sounds?.includes(sound)
      ? currentStudent.sounds.filter(s => s !== sound)
      : [...(currentStudent.sounds || []), sound]
    setCurrentStudent({ ...currentStudent, sounds: updated })
  }

  const handleFormSubmit = (data: any) => {
    const formData = {
      ...data,
      form_type: 'speech',
      mode: 'classwide',
      grades: selectedGrades,
      students: students,
    }
    onSubmit(formData)
  }

  return (
    <form onSubmit={form.handleSubmit(handleFormSubmit)} className='space-y-6'>
      {/* Class Information */}
      <Card>
        <CardHeader>
          <CardTitle className='flex items-center gap-2'>
            <Users className='w-5 h-5' />
            Class-Wide Speech Screening
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

          <div>
            <Label>Areas of Concern</Label>
            <div className='grid grid-cols-2 md:grid-cols-3 gap-2 mt-2'>
              {speechConcerns.map(concern => (
                <div key={concern} className='flex items-center space-x-2'>
                  <Checkbox
                    checked={currentStudent.concerns?.includes(concern)}
                    onCheckedChange={() => handleConcernToggle(concern)}
                  />
                  <Label className='text-sm'>{concern}</Label>
                </div>
              ))}
            </div>
          </div>

          <div>
            <Label>Sounds in Error</Label>
            <div className='grid grid-cols-6 md:grid-cols-12 gap-1 mt-2'>
              {commonSounds.map(sound => (
                <Button
                  key={sound}
                  type='button'
                  variant={currentStudent.sounds?.includes(sound) ? 'default' : 'outline'}
                  size='sm'
                  onClick={() => handleSoundToggle(sound)}
                  className='text-xs h-8'>
                  {sound}
                </Button>
              ))}
            </div>
          </div>

          <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
            <div>
              <Label>Notes</Label>
              <Input
                value={currentStudent.notes || ''}
                onChange={e => setCurrentStudent({ ...currentStudent, notes: e.target.value })}
                placeholder='Additional observations'
              />
            </div>
            <div>
              <Label>Recommendations</Label>
              <Input
                value={currentStudent.recommendations || ''}
                onChange={e =>
                  setCurrentStudent({ ...currentStudent, recommendations: e.target.value })
                }
                placeholder='Recommendations'
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
                    </div>
                    {student.concerns.length > 0 && (
                      <div className='flex flex-wrap gap-1 mb-1'>
                        {student.concerns.map(concern => (
                          <Badge key={concern} variant='secondary' className='text-xs'>
                            {concern}
                          </Badge>
                        ))}
                      </div>
                    )}
                    {student.sounds.length > 0 && (
                      <div className='flex flex-wrap gap-1'>
                        {student.sounds.map(sound => (
                          <Badge key={sound} variant='outline' className='text-xs'>
                            {sound}
                          </Badge>
                        ))}
                      </div>
                    )}
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

export default ClassWideSpeechScreeningForm
