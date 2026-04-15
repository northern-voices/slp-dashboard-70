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
import { Check, ChevronsUpDown, Plus, UserPlus, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Student } from '@/types/database'
import { useStudentsByGrade, useStudentsBySchool } from '@/hooks/students/use-students'
import { useToast } from '@/hooks/use-toast'
import { useOrganization } from '@/contexts/OrganizationContext'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { studentsApi } from '@/api/students'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'

interface StudentSearchSelectorProps {
  onStudentSelect: (student: Student | null) => void
  selectedStudent?: Student | null
  gradeFilter?: string
  isStudentCreatable?: boolean
}

const newStudentSchema = z.object({
  first_name: z.string().min(1, 'First name is required'),
  last_name: z.string().min(1, 'Last name is required'),
  date_of_birth: z.string().optional(),
})

type NewStudentFormData = z.infer<typeof newStudentSchema>

const StudentSearchSelector = ({
  onStudentSelect,
  selectedStudent,
  gradeFilter,
  isStudentCreatable = true,
}: StudentSearchSelectorProps) => {
  const [open, setOpen] = useState(false)
  const [searchValue, setSearchValue] = useState('')
  const [showNewStudentForm, setShowNewStudentForm] = useState(false)
  const { toast } = useToast()

  const { userProfile, availableSchools, currentSchool, isLoading: orgLoading } = useOrganization()
  const queryClient = useQueryClient()

  const createStudentMutation = useMutation({
    mutationFn: (studentData: {
      first_name: string
      last_name: string
      student_id: string
      qualifies_for_program?: boolean
      school_id?: string
      date_of_birth?: string
    }) => studentsApi.createStudent(studentData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['students'] })
    },
  })

  const updateStudentMutation = useMutation({
    mutationFn: ({ id, studentData }: { id: string; studentData: Partial<Student> }) =>
      studentsApi.updateStudent(id, studentData),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['students'] })
      queryClient.invalidateQueries({ queryKey: ['students', variables.id] })
    },
  })

  const { data: studentsByGrade = [], isLoading: loadingByGrade } = useStudentsByGrade(
    currentSchool && gradeFilter ? gradeFilter : ''
  )
  const { data: studentsBySchool = [], isLoading: loadingBySchool } = useStudentsBySchool(
    currentSchool?.id
  )

  const studentsToShow = currentSchool
    ? searchValue.length >= 2
      ? studentsBySchool.filter(student => {
          const fullName = `${student.first_name} ${student.last_name}`.toLowerCase()
          const search = searchValue.toLowerCase()
          return (
            fullName.includes(search) || (student.student_id ?? '').toLowerCase().includes(search)
          )
        })
      : gradeFilter
        ? studentsByGrade
        : studentsBySchool
    : []

  const isLoading = currentSchool ? (gradeFilter ? loadingByGrade : loadingBySchool) : false

  const newStudentForm = useForm<NewStudentFormData>({
    resolver: zodResolver(newStudentSchema),
    defaultValues: {
      first_name: '',
      last_name: '',
      date_of_birth: '',
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

  const handleCreateNewStudent = async (data: NewStudentFormData, e?: React.FormEvent) => {
    if (e) {
      e.preventDefault()
      e.stopPropagation()
    }

    if (!currentSchool) {
      toast({
        title: 'Error',
        description: 'No school selected. Please select a school first.',
        variant: 'destructive',
      })
      return
    }

    try {
      const duplicate = await studentsApi.checkDuplicateStudent(
        currentSchool.id,
        data.first_name,
        data.last_name,
        data.date_of_birth
      )

      if (duplicate) {
        toast({
          title: 'Duplicate Student',
          description: `A student with the name "${data.first_name} ${data.last_name}"${
            data.date_of_birth ? ` and birthdate ${data.date_of_birth}` : ''
          } already exists in this school.`,
          variant: 'destructive',
        })
        return
      }
    } catch (error) {
      console.error('Error checking for duplicate:', error)
      toast({
        title: 'Error',
        description: 'Failed to check for duplicate students. Please try again.',
        variant: 'destructive',
      })
      return
    }

    const schoolAbbreviation = currentSchool.name
      .split(' ')
      .map(word => word.charAt(0).toUpperCase())
      .join('')
      .substring(0, 3)

    const timestamp = Date.now().toString(36)
    const tempStudentId = `${schoolAbbreviation}-TEMP-${timestamp}`

    // Create student with temporary ID
    createStudentMutation.mutate(
      {
        first_name: data.first_name,
        last_name: data.last_name,
        student_id: tempStudentId,
        school_id: currentSchool.id,
        qualifies_for_program: true,
        ...(data.date_of_birth && { date_of_birth: data.date_of_birth }),
      },
      {
        onSuccess: newStudent => {
          const formattedStudentId = `${schoolAbbreviation}-${newStudent.id}`

          updateStudentMutation.mutate(
            {
              id: newStudent.id,
              studentData: {
                student_id: formattedStudentId,
              },
            },
            {
              onSuccess: updatedStudent => {
                setShowNewStudentForm(false)
                setOpen(false)
                setSearchValue('')
                newStudentForm.reset()

                onStudentSelect(updatedStudent as Student)

                setTimeout(() => {
                  toast({
                    title: 'Success',
                    description: `Student ${newStudent.first_name} ${newStudent.last_name} created successfully.`,
                    variant: 'top-right',
                  })
                }, 100)
              },
              onError: error => {
                console.error('Error updating student ID:', error)
                toast({
                  title: 'Error',
                  description: 'Failed to finalize student ID. Please try again.',
                  variant: 'destructive',
                })
              },
            }
          )
        },
        onError: error => {
          console.error('Error creating student:', error)
          toast({
            title: 'Error',
            description: 'Failed to create student. Please try again.',
            variant: 'destructive',
          })
        },
      }
    )
  }

  const handleShowNewStudentForm = () => {
    // Parse search input to extract first and last names
    if (searchValue.trim()) {
      const nameParts = searchValue.trim().split(/\s+/)
      if (nameParts.length >= 1) {
        // Set first name (first part)
        newStudentForm.setValue('first_name', nameParts[0])

        // Set last name (remaining parts joined, or empty if only one part)
        if (nameParts.length >= 2) {
          newStudentForm.setValue('last_name', nameParts.slice(1).join(' '))
        } else {
          newStudentForm.setValue('last_name', '')
        }
      }
    }

    setShowNewStudentForm(true)
    setOpen(false)
  }

  const handleCloseNewStudentForm = () => {
    setShowNewStudentForm(false)
    newStudentForm.reset()
    setSearchValue('')
  }

  const shouldShowAddNew = searchValue.length >= 2 && studentsToShow.length === 0 && !isLoading

  return (
    <div className='space-y-2'>
      {/* Combined School Info and Create Student Section */}
      {currentSchool && (
        <div className='bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-4 shadow-sm'>
          <div className='flex items-center justify-between'>
            {/* School Info */}
            <div className='flex items-center space-x-3'>
              <div className='flex items-center justify-center w-10 h-10 bg-blue-100 rounded-full'>
                <svg
                  className='w-5 h-5 text-blue-600'
                  fill='none'
                  stroke='currentColor'
                  viewBox='0 0 24 24'>
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth={2}
                    d='M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4'
                  />
                </svg>
              </div>
              <div>
                <p className='text-sm font-medium text-gray-900'>Current School</p>
                <p className='text-lg font-semibold text-blue-700'>
                  {currentSchool?.name || 'No school selected'}
                </p>
              </div>
            </div>

            {/* Create Student Button */}
            {isStudentCreatable && (
              <div className='flex items-center space-x-3'>
                <div className='text-right'>
                  <p className='text-sm font-medium text-gray-700'>Need to add a student?</p>
                  <p className='text-xs text-gray-500'>Create a new student record</p>
                </div>
                <Button
                  type='button'
                  onClick={handleShowNewStudentForm}
                  className='bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg shadow-sm transition-colors duration-200 flex items-center space-x-2'>
                  <UserPlus className='w-4 h-4' />
                  <span>Add Student</span>
                </Button>
              </div>
            )}
          </div>
        </div>
      )}

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

      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant='outline'
            role='combobox'
            aria-expanded={open}
            disabled={!currentSchool}
            className='w-full justify-between text-left'>
            <span className='truncate'>
              {selectedStudent
                ? `${selectedStudent.first_name} ${selectedStudent.last_name}`
                : currentSchool
                  ? 'Student Name'
                  : 'Select a school first...'}
            </span>
            <div className='flex items-center gap-1'>
              {selectedStudent && (
                <Button
                  type='button'
                  variant='ghost'
                  size='sm'
                  onClick={e => {
                    e.stopPropagation()
                    handleClearSelection()
                  }}
                  className='h-6 w-6 p-0 text-muted-foreground hover:text-foreground hover:bg-muted-foreground/10 rounded-full'>
                  <X className='h-3 w-3' />
                </Button>
              )}
              <ChevronsUpDown className='h-4 w-4 shrink-0 opacity-50' />
            </div>
          </Button>
        </PopoverTrigger>

        <PopoverContent
          className='w-[var(--radix-popover-trigger-width)] p-0'
          align='start'
          side='bottom'
          sideOffset={4}
          avoidCollisions={false}>
          <Command shouldFilter={false} className='max-h-[300px]'>
            <CommandInput
              placeholder={`Searching students in: ${currentSchool?.name || 'school'}`}
              value={searchValue}
              onValueChange={setSearchValue}
            />
            <div className='relative flex flex-col'>
              <CommandList className='flex-1 overflow-y-auto max-h-[150px] overflow-y-scroll'>
                <CommandEmpty>
                  {isLoading ? (
                    'Loading students...'
                  ) : shouldShowAddNew ? (
                    <div className='p-2'>
                      <p className='text-sm text-muted-foreground mb-2'>No student found.</p>
                      {isStudentCreatable && (
                        <Button
                          type='button'
                          variant='outline'
                          size='sm'
                          onClick={handleShowNewStudentForm}
                          className='w-full'>
                          <UserPlus className='w-4 h-4 mr-2' />
                          Add New Student
                        </Button>
                      )}
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
                        <span className='text-sm text-muted-foreground'></span>
                      </div>
                    </CommandItem>
                  ))}
                  {shouldShowAddNew && isStudentCreatable && (
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

              {/* Sticky Create New Student button at bottom */}
              {isStudentCreatable && (
                <div className='border-t bg-background sticky bottom-0 p-2'>
                  <Button
                    type='button'
                    variant='outline'
                    size='sm'
                    onClick={handleShowNewStudentForm}
                    className='w-full justify-start text-sm'>
                    <Plus className='mr-2 h-4 w-4' />
                    Create New Student
                  </Button>
                </div>
              )}
            </div>
          </Command>
        </PopoverContent>
      </Popover>

      {/* New Student Creation Dialog */}
      <Dialog
        open={showNewStudentForm}
        onOpenChange={open => {
          if (!open && !createStudentMutation.isPending && !updateStudentMutation.isPending) {
            handleCloseNewStudentForm()
          }
        }}>
        <DialogContent
          className='max-w-2xl max-h-[90vh] overflow-y-auto'
          onPointerDownOutside={e => {
            if (createStudentMutation.isPending || updateStudentMutation.isPending) {
              e.preventDefault()
            }
          }}
          onInteractOutside={e => {
            if (createStudentMutation.isPending || updateStudentMutation.isPending) {
              e.preventDefault()
            }
          }}>
          <DialogHeader>
            <DialogTitle className='flex items-center gap-2'>
              <UserPlus className='w-5 h-5' />
              Add New Student
            </DialogTitle>
          </DialogHeader>

          <Form {...newStudentForm}>
            <form
              onSubmit={e => {
                e.preventDefault()
                e.stopPropagation()

                return newStudentForm.handleSubmit(data => {
                  handleCreateNewStudent(data, e)
                  return false
                })(e)
              }}
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

              {/* <FormField
                control={newStudentForm.control}
                name='date_of_birth'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Date of Birth</FormLabel>
                    <FormControl>
                      <Input type='date' {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              /> */}

              <div className='flex justify-end space-x-2 pt-4'>
                <Button type='button' variant='outline' onClick={handleCloseNewStudentForm}>
                  Cancel
                </Button>
                <Button
                  type='submit'
                  disabled={createStudentMutation.isPending || updateStudentMutation.isPending}>
                  {createStudentMutation.isPending || updateStudentMutation.isPending
                    ? 'Creating...'
                    : 'Add Student'}
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
