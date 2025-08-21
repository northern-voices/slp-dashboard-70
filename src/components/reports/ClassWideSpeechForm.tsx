import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import Multiselect from '@/components/ui/multiselect'

interface ClassWideSpeechFormProps {
  title: string
  reportType: 'screens' | 'goals' | 'progress'
}

const ClassWideSpeechForm = ({ title, reportType }: ClassWideSpeechFormProps) => {
  const [academicYear, setAcademicYear] = useState('')
  const [selectedGrades, setSelectedGrades] = useState<string[]>([])
  const [email, setEmail] = useState('')

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
  const currentYear = new Date().getFullYear()
  const academicYears = [
    `${currentYear - 1}-${currentYear}`,
    `${currentYear}-${currentYear + 1}`,
    `${currentYear + 1}-${currentYear + 2}`,
  ]

  const handleClearForm = () => {
    setAcademicYear('')
    setSelectedGrades([])
    setEmail('')
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log(`Generating class-wide speech ${reportType}:`, {
      academicYear,
      grades: selectedGrades,
      email,
    })
    // TODO: Implement report generation
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className='space-y-4'>
          <div>
            <Label htmlFor='academic-year'>Academic Year</Label>
            <Select value={academicYear} onValueChange={setAcademicYear}>
              <SelectTrigger>
                <SelectValue placeholder='Select academic year' />
              </SelectTrigger>
              <SelectContent>
                {academicYears.map(year => (
                  <SelectItem key={year} value={year}>
                    {year}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label className='text-sm font-medium text-gray-700'>Grades</Label>
            <Multiselect
              options={grades}
              selected={selectedGrades}
              onChange={setSelectedGrades}
              placeholder='Select grades...'
              className='w-full'
            />
          </div>

          <div>
            <Label htmlFor='email'>Email</Label>
            <Input
              id='email'
              type='email'
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder='Enter email address'
            />
          </div>

          <div className='flex gap-2 pt-4'>
            <Button type='button' variant='outline' onClick={handleClearForm}>
              Clear Form
            </Button>
            <Button type='submit'>Generate Report</Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}

export default ClassWideSpeechForm
