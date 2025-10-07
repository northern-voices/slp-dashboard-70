import React, { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { X } from 'lucide-react'
import { Student } from '@/types/database'
import Multiselect from '@/components/ui/multiselect'

interface StudentFiltersProps {
  students: Student[]
  onFilter: (filteredStudents: Student[]) => void
}

const StudentFilters = ({ students, onFilter }: StudentFiltersProps) => {
  const [selectedGrades, setSelectedGrades] = useState<string[]>([])
  const [selectedGenders, setSelectedGenders] = useState<string[]>([])

  // Get unique values for filter options
  const grades = Array.from(new Set(students.map(s => s.grade).filter(Boolean))).sort()
  const genderOptions = ['Male', 'Female', 'Other', 'Prefer not to say']

  const activeFilters = [
    ...selectedGrades.map(grade => ({
      type: 'Grade',
      value: grade,
      clear: () => setSelectedGrades(prev => prev.filter(g => g !== grade)),
    })),
    ...selectedGenders.map(gender => ({
      type: 'Gender',
      value: gender,
      clear: () => setSelectedGenders(prev => prev.filter(g => g !== gender)),
    })),
  ]

  useEffect(() => {
    let filtered = [...students]

    if (selectedGrades.length > 0) {
      filtered = filtered.filter(student => selectedGrades.includes(student.grade))
    }

    if (selectedGenders.length > 0) {
      filtered = filtered.filter(student => {
        const studentGender = student.gender.charAt(0).toUpperCase() + student.gender.slice(1)
        return selectedGenders.includes(studentGender)
      })
    }

    onFilter(filtered)
  }, [selectedGrades, selectedGenders, students, onFilter])

  const clearAllFilters = () => {
    setSelectedGrades([])
    setSelectedGenders([])
  }

  return (
    <Card>
      <CardContent className='p-4'>
        <div className='flex flex-col space-y-4'>
          <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
            <div className='space-y-2'>
              <label className='block text-sm font-medium text-gray-700'>Grades</label>
              <Multiselect
                options={grades}
                selected={selectedGrades}
                onChange={setSelectedGrades}
                placeholder='All grades'
                searchPlaceholder='Search grades...'
                emptyMessage='No grades found.'
                showSelectAll={false}
              />
            </div>

            <div className='space-y-2'>
              <label className='block text-sm font-medium text-gray-700'>Gender</label>
              <Multiselect
                options={genderOptions}
                selected={selectedGenders}
                onChange={setSelectedGenders}
                placeholder='All genders'
                searchPlaceholder='Search gender...'
                emptyMessage='No genders found.'
                showSelectAll={false}
              />
            </div>
          </div>

          {activeFilters.length > 0 && (
            <div className='flex flex-wrap items-center gap-2'>
              <span className='text-sm text-gray-500'>Active filters:</span>
              {activeFilters.map((filter, index) => (
                <Badge
                  key={`${filter.type}-${filter.value}-${index}`}
                  variant='secondary'
                  className='flex items-center gap-1'>
                  {filter.type}: {filter.value}
                  <button
                    onClick={filter.clear}
                    className='ml-1 hover:bg-gray-300 rounded-full p-0.5'>
                    <X className='w-3 h-3' />
                  </button>
                </Badge>
              ))}
              <Button variant='ghost' size='sm' onClick={clearAllFilters} className='text-xs'>
                Clear all
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

export default StudentFilters
