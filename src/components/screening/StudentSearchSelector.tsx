import React, { useState } from 'react'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Button } from '@/components/ui/button'
import { Check, ChevronsUpDown } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Student } from '@/types/database'
import { useStudentsByGrade, useSearchStudents } from '@/hooks/students' // Use the hooks we created

interface StudentSearchSelectorProps {
  onStudentSelect: (student: Student | null) => void
  selectedStudent?: Student | null
  gradeFilter?: string
}

const StudentSearchSelector = ({
  onStudentSelect,
  selectedStudent,
  gradeFilter,
}: StudentSearchSelectorProps) => {
  const [open, setOpen] = useState(false)
  const [searchValue, setSearchValue] = useState('')

  // Use React Query hooks instead of StudentService
  const { data: studentsByGrade = [], isLoading: loadingByGrade } = useStudentsByGrade(
    gradeFilter || ''
  )
  const { data: searchResults = [], isLoading: loadingSearch } = useSearchStudents(searchValue)

  // Determine which students to show
  const studentsToShow = searchValue.length >= 2 ? searchResults : studentsByGrade
  const isLoading = searchValue.length >= 2 ? loadingSearch : loadingByGrade

  const handleStudentSelect = (student: Student) => {
    onStudentSelect(student)
    setOpen(false)
    setSearchValue('')
  }

  const handleClearSelection = () => {
    onStudentSelect(null)
    setSearchValue('')
  }

  return (
    <div className='space-y-2'>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant='outline'
            role='combobox'
            aria-expanded={open}
            className='w-full justify-between text-left'>
            {selectedStudent
              ? `${selectedStudent.first_name} ${selectedStudent.last_name} (${selectedStudent.student_id})`
              : 'Select student...'}
            <ChevronsUpDown className='ml-2 h-4 w-4 shrink-0 opacity-50' />
          </Button>
        </PopoverTrigger>
        <PopoverContent className='w-[var(--radix-popover-trigger-width)] p-0' align='start'>
          <Command shouldFilter={false}>
            <CommandInput
              placeholder='Search students...'
              value={searchValue}
              onValueChange={setSearchValue}
            />
            <CommandList>
              <CommandEmpty>{isLoading ? 'Loading students...' : 'No student found.'}</CommandEmpty>
              <CommandGroup>
                {studentsToShow.map(student => (
                  <CommandItem
                    key={student.id}
                    value={`${student.first_name} ${student.last_name} ${student.student_id}`}
                    onSelect={() => handleStudentSelect(student)}
                    className='cursor-pointer'>
                    <Check
                      className={cn(
                        'mr-2 h-4 w-4',
                        selectedStudent?.id === student.id ? 'opacity-100' : 'opacity-0'
                      )}
                    />
                    <div className='flex flex-col'>
                      <span className='font-medium'>
                        {student.first_name} {student.last_name}
                      </span>
                      <span className='text-sm text-muted-foreground'>
                        ID: {student.student_id}
                      </span>
                      <span className='text-xs text-muted-foreground'>
                        UUID: {student.id.substring(0, 8)}... (Real DB data ✅)
                      </span>
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      {selectedStudent && (
        <div className='flex items-center justify-between p-2 bg-muted rounded-md'>
          <div className='flex flex-col'>
            <span className='text-sm text-muted-foreground'>
              Selected: {selectedStudent.first_name} {selectedStudent.last_name}
            </span>
            <span className='text-xs text-muted-foreground'>DB ID: {selectedStudent.id}</span>
          </div>
          <Button
            variant='ghost'
            size='sm'
            onClick={handleClearSelection}
            className='h-auto p-1 text-muted-foreground hover:text-foreground'>
            Clear
          </Button>
        </div>
      )}
    </div>
  )
}

export default StudentSearchSelector
