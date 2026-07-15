import { useState } from 'react'
import { Check, ChevronsUpDown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { cn } from '@/lib/utils'
import { Student } from '@/types/database'

interface StudentPickerProps {
  students: Student[]
  value: string | null
  onChange: (studentId: string) => void
}

const StudentPicker = ({ students, value, onChange }: StudentPickerProps) => {
  const [open, setOpen] = useState(false)
  const [searchValue, setSearchValue] = useState('')

  const selectedStudent = students.find(student => student.id === value)

  const studentsToShow = searchValue
    ? students.filter(student =>
        `${student.first_name} ${student.last_name}`
          .toLowerCase()
          .includes(searchValue.toLowerCase())
      )
    : students

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type='button'
          variant='outline'
          role='combobox'
          aria-expanded={open}
          className='h-9 w-full justify-between text-left font-normal'>
          <span className='truncate'>
            {selectedStudent
              ? `${selectedStudent.first_name} ${selectedStudent.last_name}`
              : 'Select student...'}
          </span>

          <ChevronsUpDown className='h-4 w-4 shrink-0 opacity-50' />
        </Button>
      </PopoverTrigger>

      <PopoverContent className='w-[var(--radix popover-trigger-width)] p-0' align='start'>
        <Command shouldFilter={false}>
          <CommandInput
            placeholder='Search students...'
            value={searchValue}
            onValueChange={setSearchValue}
          />
          <CommandList className='max-h-[200px] overflow-y-auto'>
            <CommandEmpty>No student found.</CommandEmpty>
            <CommandGroup>
              {studentsToShow.map(student => (
                <CommandItem
                  key={student.id}
                  value={`${student.first_name} ${student.last_name}`}
                  onSelect={() => {
                    onChange(student.id)
                    setOpen(false)
                    setSearchValue('')
                  }}
                  className='cursor-pointer'>
                  <Check
                    className={cn(
                      `mr-2 h-4 w-4`,
                      value === student.id ? 'opacity-100' : ' opacity-0'
                    )}
                  />
                  {student.first_name} ${student.last_name}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
