import React from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { X } from 'lucide-react'

interface GradeManagementProps {
  selectedGrades: string[]
  onGradesChange: (grades: string[]) => void
}

const AVAILABLE_GRADES = [
  'Nursery',
  'PreK',
  'K4',
  'K5',
  'K',
  'K/1',
  '1',
  '1/2',
  '2',
  '2/3',
  '3',
  '3/4',
  '4',
  '4/5',
  '5',
  '5/6',
  '6',
  '6/7',
  '7',
  '7/8',
  '8',
  '8/9',
  '9',
  '9/10',
  '10',
  '10/11',
  '11',
  '11/12',
  '12',
]

const GRADE_LABELS: Record<string, string> = {
  Nursery: 'Nursery',
  PreK: 'Pre-K',
  K4: 'K4',
  K5: 'K5',
  K: 'Kindergarten',
  'K/1': 'K/1',
  '1': '1st Grade',
  '1/2': '1/2',
  '2': '2nd Grade',
  '2/3': '2/3',
  '3': '3rd Grade',
  '3/4': '3/4',
  '4': '4th Grade',
  '4/5': '4/5',
  '5': '5th Grade',
  '5/6': '5/6',
  '6': '6th Grade',
  '6/7': '6/7',
  '7': '7th Grade',
  '7/8': '7/8',
  '8': '8th Grade',
  '8/9': '8/9',
  '9': '9th Grade',
  '9/10': '9/10',
  '10': '10th Grade',
  '10/11': '10/11',
  '11': '11th Grade',
  '11/12': '11/12',
  '12': '12th Grade',
}

const GradeManagement = ({ selectedGrades, onGradesChange }: GradeManagementProps) => {
  const handleGradeToggle = (grade: string) => {
    if (selectedGrades.includes(grade)) {
      onGradesChange(selectedGrades.filter(g => g !== grade))
    } else {
      onGradesChange([...selectedGrades, grade])
    }
  }

  const handleSelectAll = () => {
    onGradesChange(AVAILABLE_GRADES)
  }

  const handleClearAll = () => {
    onGradesChange([])
  }

  const removeGrade = (grade: string) => {
    onGradesChange(selectedGrades.filter(g => g !== grade))
  }

  return (
    <div className='space-y-4'>
      <div className='flex items-center justify-between'>
        <Label className='text-base font-medium'>Available Grades</Label>
        <div className='flex gap-2'>
          <Button
            type='button'
            variant='outline'
            size='sm'
            onClick={handleSelectAll}
            disabled={selectedGrades.length === AVAILABLE_GRADES.length}>
            Select All
          </Button>
          <Button
            type='button'
            variant='outline'
            size='sm'
            onClick={handleClearAll}
            disabled={selectedGrades.length === 0}>
            Clear All
          </Button>
        </div>
      </div>

      {selectedGrades.length > 0 && (
        <div className='space-y-2'>
          <Label className='text-sm text-gray-600'>Selected Grades:</Label>
          <div className='flex flex-wrap gap-2'>
            {selectedGrades.map(grade => (
              <Badge key={grade} variant='secondary' className='flex items-center gap-1 px-3 py-1'>
                {GRADE_LABELS[grade]}
                <button
                  type='button'
                  onClick={() => removeGrade(grade)}
                  className='ml-1 hover:text-red-600'>
                  <X className='w-3 h-3' />
                </button>
              </Badge>
            ))}
          </div>
        </div>
      )}

      <div className='space-y-2'>
        <Label className='text-sm text-gray-600'>Select grades available at this school:</Label>
        <div className='grid grid-cols-2 md:grid-cols-4 gap-2 p-3 border rounded-md max-h-40 overflow-y-auto'>
          {AVAILABLE_GRADES.map(grade => (
            <div key={grade} className='flex items-center space-x-2'>
              <Checkbox
                id={`grade-${grade}`}
                checked={selectedGrades.includes(grade)}
                onCheckedChange={() => handleGradeToggle(grade)}
              />
              <Label htmlFor={`grade-${grade}`} className='text-sm font-normal cursor-pointer'>
                {GRADE_LABELS[grade]}
              </Label>
            </div>
          ))}
        </div>
      </div>

      {selectedGrades.length === 0 && (
        <p className='text-sm text-red-600'>Please select at least one grade for this school.</p>
      )}
    </div>
  )
}

export default GradeManagement
