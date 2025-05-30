
import React, { useState, useEffect } from 'react';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Check, ChevronsUpDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Student } from '@/types/database';
import { StudentService } from '@/services/studentService';

interface StudentSearchSelectorProps {
  onStudentSelect: (student: Student | null) => void;
  selectedStudent?: Student | null;
  gradeFilter?: string;
}

const StudentSearchSelector = ({ onStudentSelect, selectedStudent, gradeFilter }: StudentSearchSelectorProps) => {
  const [open, setOpen] = useState(false);
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchValue, setSearchValue] = useState('');

  useEffect(() => {
    const loadStudents = async () => {
      setLoading(true);
      try {
        const allStudents = await StudentService.getStudents();
        // Filter students by grade if gradeFilter is provided
        const filteredStudents = gradeFilter 
          ? allStudents.filter(student => student.grade === gradeFilter)
          : allStudents;
        setStudents(filteredStudents);
      } catch (error) {
        console.error('Error loading students:', error);
      } finally {
        setLoading(false);
      }
    };

    loadStudents();
  }, [gradeFilter]);

  // Filter students based on search input
  const filteredStudents = students.filter(student =>
    `${student.first_name} ${student.last_name} ${student.student_id}`.toLowerCase().includes(searchValue.toLowerCase())
  );

  const handleStudentSelect = (student: Student) => {
    onStudentSelect(student);
    setOpen(false);
    setSearchValue('');
  };

  const handleClearSelection = () => {
    onStudentSelect(null);
    setSearchValue('');
  };

  return (
    <div className="space-y-2">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between text-left"
          >
            {selectedStudent
              ? `${selectedStudent.first_name} ${selectedStudent.last_name} (${selectedStudent.student_id})`
              : "Select student..."}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-full p-0" align="start">
          <Command shouldFilter={false}>
            <CommandInput 
              placeholder="Search students..." 
              value={searchValue}
              onValueChange={setSearchValue}
            />
            <CommandList>
              <CommandEmpty>
                {loading ? "Loading students..." : "No student found."}
              </CommandEmpty>
              <CommandGroup>
                {filteredStudents.map((student) => (
                  <CommandItem
                    key={student.id}
                    value={`${student.first_name} ${student.last_name} ${student.student_id}`}
                    onSelect={() => handleStudentSelect(student)}
                    className="cursor-pointer"
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        selectedStudent?.id === student.id ? "opacity-100" : "opacity-0"
                      )}
                    />
                    <div className="flex flex-col">
                      <span className="font-medium">
                        {student.first_name} {student.last_name}
                      </span>
                      <span className="text-sm text-muted-foreground">
                        ID: {student.student_id} • Grade: {student.grade || 'N/A'}
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
        <div className="flex items-center justify-between p-2 bg-muted rounded-md">
          <span className="text-sm text-muted-foreground">
            Selected: {selectedStudent.first_name} {selectedStudent.last_name}
          </span>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClearSelection}
            className="h-auto p-1 text-muted-foreground hover:text-foreground"
          >
            Clear
          </Button>
        </div>
      )}
    </div>
  );
};

export default StudentSearchSelector;
