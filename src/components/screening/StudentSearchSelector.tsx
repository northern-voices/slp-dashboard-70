
import React, { useState } from 'react';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Check, ChevronsUpDown } from 'lucide-react';
import { cn } from '@/lib/utils';

// Mock data for demonstration
const mockStudents = [
  {
    id: '1',
    first_name: 'Emma',
    last_name: 'Johnson',
    date_of_birth: '2010-05-15',
    grade: '8th',
    gender: 'female' as const,
    student_id: 'STU001',
    emergency_contact_name: 'John Johnson',
    emergency_contact_phone: '(555) 123-4567',
    medical_notes: '',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  },
  {
    id: '2',
    first_name: 'Michael',
    last_name: 'Chen',
    date_of_birth: '2009-08-22',
    grade: '9th',
    gender: 'male' as const,
    student_id: 'STU002',
    emergency_contact_name: 'Lisa Chen',
    emergency_contact_phone: '(555) 987-6543',
    medical_notes: '',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  }
];

interface StudentSearchSelectorProps {
  onStudentSelect: (student: any) => void;
  selectedStudent?: any;
}

const StudentSearchSelector = ({ onStudentSelect, selectedStudent }: StudentSearchSelectorProps) => {
  const [open, setOpen] = useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between"
        >
          {selectedStudent
            ? `${selectedStudent.first_name} ${selectedStudent.last_name} (${selectedStudent.student_id})`
            : "Select student..."}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0">
        <Command>
          <CommandInput placeholder="Search students..." />
          <CommandList>
            <CommandEmpty>No student found.</CommandEmpty>
            <CommandGroup>
              {mockStudents.map((student) => (
                <CommandItem
                  key={student.id}
                  value={`${student.first_name} ${student.last_name} ${student.student_id}`}
                  onSelect={() => {
                    onStudentSelect(student);
                    setOpen(false);
                  }}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      selectedStudent?.id === student.id ? "opacity-100" : "opacity-0"
                    )}
                  />
                  {student.first_name} {student.last_name} ({student.student_id})
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
};

export default StudentSearchSelector;
