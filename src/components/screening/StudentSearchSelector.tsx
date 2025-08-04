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
import { Check, ChevronsUpDown, Plus, UserPlus } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Student } from '@/types/database'
import { useStudentsByGrade, useSearchStudents } from '@/hooks/students'
import { StudentService } from '@/services/studentService'
import { useToast } from '@/hooks/use-toast'
import { useOrganization } from '@/contexts/OrganizationContext'

// Type adapter to convert API Student to database Student
const adaptStudent = (apiStudent: any): Student => ({
  id: apiStudent.id,
  first_name: apiStudent.first_name,
  last_name: apiStudent.last_name,
  student_id: apiStudent.student_id,
  school_id: apiStudent.school_id,
  qualifies_for_program: apiStudent.qualifies_for_program,
  created_at: apiStudent.created_at || new Date().toISOString(),
  updated_at: apiStudent.updated_at || new Date().toISOString(),
})
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'

interface StudentSearchSelectorProps {
  onStudentSelect: (student: Student | null) => void
  selectedStudent?: Student | null
  gradeFilter?: string
}

// Simplified student creation schema
const newStudentSchema = z.object({
  first_name: z.string().min(1, 'First name is required'),
  last_name: z.string().min(1, 'Last name is required'),
  student_id: z.string().min(1, 'Student ID is required'),
})

type NewStudentFormData = z.infer<typeof newStudentSchema>

const StudentSearchSelector = ({
  onStudentSelect,
  selectedStudent,
  gradeFilter,
}: StudentSearchSelectorProps) => {
  const [open, setOpen] = useState(false)
  const [searchValue, setSearchValue] = useState('')
  const [showNewStudentForm, setShowNewStudentForm] = useState(false)
  const [isCreatingStudent, setIsCreatingStudent] = useState(false)
  const { toast } = useToast()

  const { userProfile, availableSchools, currentSchool, isLoading: orgLoading } = useOrganization()
  console.log(
    {
      userProfile,
      availableSchools,
      orgLoading,
      currentSchool,
      // userAssignedSchools,
      // schoolLoading,
    },
    'Full Context Debug'
  )

  // Use React Query hooks instead of StudentService
  const { data: studentsByGrade = [], isLoading: loadingByGrade } = useStudentsByGrade(
    gradeFilter || ''
  )
  const { data: searchResults = [], isLoading: loadingSearch } = useSearchStudents(searchValue)

  // Determine which students to show
  const studentsToShow = searchValue.length >= 2 ? searchResults : studentsByGrade
  const isLoading = searchValue.length >= 2 ? loadingSearch : loadingByGrade

  // New student form
  const newStudentForm = useForm<NewStudentFormData>({
    resolver: zodResolver(newStudentSchema),
    defaultValues: {
      first_name: '',
      last_name: '',
      student_id: '',
    },
  })

  const handleStudentSelect = (student: Student) => {
    onStudentSelect(student)
    setOpen(false)
    setSearchValue('')
  }

  const handleClearSelection = () => {
    onStudentSelect(null)
    setSearchValue('')
  }

  const handleCreateNewStudent = async (data: NewStudentFormData) => {
    if (!currentSchool) {
      toast({
        title: 'Error',
        description: 'No school selected. Please select a school first.',
        variant: 'destructive',
      })
      return
    }

    setIsCreatingStudent(true)
    try {
      const newStudent = await StudentService.createStudent({
        first_name: data.first_name,
        last_name: data.last_name,
        student_id: data.student_id,
        school_id: currentSchool.id,
        qualifies_for_program: true,
      })

      toast({
        title: 'Success',
        description: `Student ${newStudent.first_name} ${newStudent.last_name} created successfully.`,
      })

      // Select the newly created student
      onStudentSelect(newStudent as Student)
      setShowNewStudentForm(false)
      setOpen(false)
      setSearchValue('')
      newStudentForm.reset()
    } catch (error) {
      console.error('Error creating student:', error)
      toast({
        title: 'Error',
        description: 'Failed to create student. Please try again.',
        variant: 'destructive',
      })
    } finally {
      setIsCreatingStudent(false)
    }
  }

  const handleShowNewStudentForm = () => {
    setShowNewStudentForm(true)
    setOpen(false)
  }

  const handleCloseNewStudentForm = () => {
    setShowNewStudentForm(false)
    newStudentForm.reset()
  }

  // Check if we should show "Add New Student" option
  const shouldShowAddNew = searchValue.length >= 2 && studentsToShow.length === 0 && !isLoading

  return (
    <div className='space-y-2'>
      {/* Show warning if no school is selected */}
      {!currentSchool && (
        <div className='p-4 border border-orange-200 bg-orange-50 rounded-md'>
          <div className='flex items-center space-x-2'>
            <div className='w-2 h-2 bg-orange-500 rounded-full'></div>
            <span className='text-sm font-medium text-orange-800'>
              Please select a school first to search for students
            </span>
          </div>
        </div>
      )}

      {/* Show current school info when selected */}
      {currentSchool && (
        <div className='p-2 bg-blue-50 border border-blue-200 rounded-md'>
          <span className='text-sm text-blue-700'>
            Searching students in: <strong>{currentSchool.name}</strong>
          </span>
        </div>
      )}

      {currentSchool && (
        <div className='flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-md'>
          <div className='flex items-center space-x-2'>
            <UserPlus className='w-5 h-5 text-green-600' />
            <span className='text-sm font-medium text-green-800'>Need to add a new student?</span>
          </div>
          <Button
            variant='outline'
            size='sm'
            onClick={handleShowNewStudentForm}
            className='border-green-300 text-green-700 hover:bg-green-100 hover:text-green-800'>
            <UserPlus className='w-4 h-4 mr-2' />
            Create New Student
          </Button>
        </div>
      )}

      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant='outline'
            role='combobox'
            aria-expanded={open}
            disabled={!currentSchool}
            className='w-full justify-between text-left'>
            {selectedStudent
              ? `${selectedStudent.first_name} ${selectedStudent.last_name} (${selectedStudent.student_id})`
              : currentSchool
              ? 'Select student...'
              : 'Select a school first...'}
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
              <CommandEmpty>
                {isLoading ? (
                  'Loading students...'
                ) : shouldShowAddNew ? (
                  <div className='p-2'>
                    <p className='text-sm text-muted-foreground mb-2'>No student found.</p>
                    <Button
                      variant='outline'
                      size='sm'
                      onClick={handleShowNewStudentForm}
                      className='w-full'>
                      <UserPlus className='w-4 h-4 mr-2' />
                      Add New Student
                    </Button>
                  </div>
                ) : (
                  'No student found.'
                )}
              </CommandEmpty>
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
                {shouldShowAddNew && (
                  <CommandItem
                    value='add-new-student'
                    onSelect={handleShowNewStudentForm}
                    className='cursor-pointer border-t'>
                    <Plus className='mr-2 h-4 w-4' />
                    <span className='font-medium'>Add New Student</span>
                  </CommandItem>
                )}
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

      {/* New Student Creation Dialog */}
      <Dialog open={showNewStudentForm} onOpenChange={handleCloseNewStudentForm}>
        <DialogContent className='max-w-2xl max-h-[90vh] overflow-y-auto'>
          <DialogHeader>
            <DialogTitle className='flex items-center gap-2'>
              <UserPlus className='w-5 h-5' />
              Add New Student
            </DialogTitle>
          </DialogHeader>

          <Form {...newStudentForm}>
            <form
              onSubmit={newStudentForm.handleSubmit(handleCreateNewStudent)}
              className='space-y-4'>
              <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                <FormField
                  control={newStudentForm.control}
                  name='first_name'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>First Name *</FormLabel>
                      <FormControl>
                        <Input placeholder='Emma' {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={newStudentForm.control}
                  name='last_name'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Last Name *</FormLabel>
                      <FormControl>
                        <Input placeholder='Johnson' {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                <FormField
                  control={newStudentForm.control}
                  name='student_id'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Student ID *</FormLabel>
                      <FormControl>
                        <Input placeholder='ABCD-EFG-1234' {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className='flex justify-end space-x-2 pt-4'>
                <Button type='button' variant='outline' onClick={handleCloseNewStudentForm}>
                  Cancel
                </Button>
                <Button type='submit' disabled={isCreatingStudent}>
                  {isCreatingStudent ? 'Creating...' : 'Add Student'}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default StudentSearchSelector
