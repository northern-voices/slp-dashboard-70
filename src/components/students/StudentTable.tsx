import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { School } from '@/types/database'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Plus, UserPlus } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import StudentTableFilters from './StudentTableFilters'
import { GRADE_MAPPING } from '@/constants/app'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useToast } from '@/hooks/use-toast'
import { useOrganization } from '@/contexts/OrganizationContext'
import { useStudentsBySchool } from '@/hooks/students/use-students'
import { useCreateStudent, useUpdateStudent } from '@/hooks/students/use-students-mutations'

interface StudentTableProps {
  selectedSchool?: School | null
}

const newStudentSchema = z.object({
  first_name: z.string().min(1, 'First name is required'),
  last_name: z.string().min(1, 'Last name is required'),
  date_of_birth: z.string().optional(),
})

type NewStudentFormData = z.infer<typeof newStudentSchema>

const StudentTable: React.FC<StudentTableProps> = ({ selectedSchool }) => {
  const navigate = useNavigate()
  const { toast } = useToast()
  const [searchTerm, setSearchTerm] = useState('')
  const [gradeFilter, setGradeFilter] = useState('all')
  const [dateRangeFilter, setDateRangeFilter] = useState('all')
  const [programFilter, setProgramFilter] = useState('all')
  const [showAddModal, setShowAddModal] = useState(false)

  const { currentSchool } = useOrganization()

  const activeSchool = selectedSchool || currentSchool

  const { data: students = [], isLoading } = useStudentsBySchool(activeSchool?.id)

  const createStudentMutation = useCreateStudent()
  const updateStudentMutation = useUpdateStudent()

  const newStudentForm = useForm<NewStudentFormData>({
    resolver: zodResolver(newStudentSchema),
    defaultValues: {
      first_name: '',
      last_name: '',
      date_of_birth: '',
    },
  })

  const getStudentGrade = (student): string => {
    if (student.grade) {
      return student.grade
    }

    return 'N/A'
  }

  const getProgramStatus = (student): string => {
    const speechScreenings = student.speech_screenings || []
    if (speechScreenings.length === 0) {
      return 'no_screening'
    }

    // Get most recent screening - create a copy to avoid mutating the original array
    const mostRecent = [...speechScreenings].sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    )[0]

    if (!mostRecent?.error_patterns) {
      return 'not_set'
    }

    try {
      const errorPatterns =
        typeof mostRecent.error_patterns === 'string'
          ? JSON.parse(mostRecent.error_patterns)
          : mostRecent.error_patterns

      const qualifies = errorPatterns?.screening_metadata?.qualifies_for_speech_program
      const sub = errorPatterns?.screening_metadata?.sub
      const graduated = errorPatterns?.screening_metadata?.graduated

      if (qualifies === undefined && sub === undefined && graduated === undefined) {
        return 'not_set'
      }

      if (graduated) return 'graduated'
      if (sub) return 'sub'
      if (qualifies) return 'qualifies'
      return 'not_in_program'
    } catch (e) {
      console.error('Error parsing error_patterns:', e)
      return 'not_set'
    }
  }

  const getQualificationBadge = student => {
    const programStatus = getProgramStatus(student)

    switch (programStatus) {
      case 'no_screening':
        return (
          <Badge className='bg-gray-100 text-gray-800 font-medium text-[10px]'>No Screening</Badge>
        )
      case 'not_set':
        return <Badge className='bg-gray-100 text-gray-800 font-medium text-[10px]'>Not Set</Badge>
      case 'graduated':
        return (
          <Badge className='bg-blue-100 text-blue-800 font-medium text-[10px]'>Graduated</Badge>
        )
      case 'sub':
        return <Badge className='bg-orange-100 text-orange-800 font-medium text-[10px]'>Sub</Badge>
      case 'qualifies':
        return <Badge className='bg-red-100 text-red-800 font-medium text-[10px]'>Qualifies</Badge>
      case 'not_in_program':
        return (
          <Badge className='bg-green-100 text-green-800 font-medium text-[10px]'>
            Not In Program
          </Badge>
        )
      default:
        return <Badge className='bg-gray-100 text-gray-800 font-medium text-[10px]'>Error</Badge>
    }
  }

  const isWithinDateRange = (dateString: string, range: string): boolean => {
    if (range === 'all') return true

    const date = new Date(dateString)
    const now = new Date()

    switch (range) {
      case 'today':
        return date.toDateString() === now.toDateString()

      case 'week': {
        const weekAgo = new Date(now)
        weekAgo.setDate(now.getDate() - 7)
        return date >= weekAgo
      }

      case 'month': {
        const monthAgo = new Date(now)
        monthAgo.setMonth(now.getMonth() - 1)
        return date >= monthAgo
      }

      case 'school_year': {
        const currentYear = now.getFullYear()
        const currentMonth = now.getMonth() // 0-indexed (September = 8)
        let schoolYearStart: Date
        if (currentMonth >= 8) {
          // September or later
          schoolYearStart = new Date(currentYear, 8, 1) // September 1st of current year
        } else {
          schoolYearStart = new Date(currentYear - 1, 8, 1) // September 1st of previous year
        }
        return date >= schoolYearStart
      }

      case 'last_school_year': {
        const currentYear = now.getFullYear()
        const currentMonth = now.getMonth() // 0-indexed (September = 8)
        let lastSchoolYearStart: Date
        let lastSchoolYearEnd: Date

        if (currentMonth >= 8) {
          // Currently in new school year (September or later)
          lastSchoolYearStart = new Date(currentYear - 1, 8, 1) // September 1st of last year
          lastSchoolYearEnd = new Date(currentYear, 7, 31) // August 31st of current year
        } else {
          // Currently in school year that started last calendar year
          lastSchoolYearStart = new Date(currentYear - 2, 8, 1) // September 1st of two years ago
          lastSchoolYearEnd = new Date(currentYear - 1, 7, 31) // August 31st of last year
        }
        return date >= lastSchoolYearStart && date <= lastSchoolYearEnd
      }

      default:
        return true
    }
  }

  const filteredStudents = students
    .filter(student => {
      const fullName = `${student.first_name} ${student.last_name}`.toLowerCase()
      const search = searchTerm.toLowerCase()
      const matchesSearch =
        fullName.includes(search) || student.student_id.toLowerCase().includes(search)

      const matchesGrade = gradeFilter === 'all' || student.grade === gradeFilter

      const matchesDateRange = isWithinDateRange(student.created_at, dateRangeFilter)

      const matchesProgram = programFilter === 'all' || getProgramStatus(student) === programFilter

      return matchesSearch && matchesGrade && matchesDateRange && matchesProgram
    })
    .sort((a, b) => {
      const gradeA = a.grade || 'N/A'
      const gradeB = b.grade || 'N/A'

      const indexA = GRADE_MAPPING.findIndex(g => g.value === gradeA)
      const indexB = GRADE_MAPPING.findIndex(g => g.value === gradeB)

      // If grade not found in mapping, put at the end
      if (indexA === -1 && indexB === -1) return 0
      if (indexA === -1) return 1
      if (indexB === -1) return -1

      return indexA - indexB
    })

  const handleRowClick = (studentId: string) => {
    if (activeSchool) {
      navigate(`/school/${activeSchool.id}/students/${studentId}`)
    } else {
      navigate(`/students/${studentId}`)
    }
  }

  const handleViewClick = (e: React.MouseEvent, studentId: string) => {
    e.stopPropagation()
    if (activeSchool) {
      navigate(`/school/${activeSchool.id}/students/${studentId}`)
    } else {
      navigate(`/students/${studentId}`)
    }
  }

  const handleAddStudent = (data: NewStudentFormData) => {
    if (!activeSchool) {
      toast({
        title: 'Error',
        description: 'No school selected. Please select a school first.',
        variant: 'destructive',
      })
      return
    }

    // Generate school abbreviation from school name
    const schoolAbbreviation = activeSchool.name
      .split(' ')
      .map(word => word.charAt(0).toUpperCase())
      .join('')
      .substring(0, 3) // Limit to 3 characters max

    // Generate a temporary unique ID using timestamp to avoid conflicts
    const timestamp = Date.now().toString(36)
    const tempStudentId = `${schoolAbbreviation}-TEMP-${timestamp}`

    // Create student with temporary ID
    createStudentMutation.mutate(
      {
        first_name: data.first_name,
        last_name: data.last_name,
        student_id: tempStudentId,
        school_id: activeSchool.id,
        qualifies_for_program: false,
        ...(data.date_of_birth && { date_of_birth: data.date_of_birth }),
      },
      {
        onSuccess: newStudent => {
          // Generate the final student ID with school abbreviation and UUID
          const formattedStudentId = `${schoolAbbreviation}-${newStudent.id}`

          // Update the student with the formatted ID
          updateStudentMutation.mutate(
            {
              id: newStudent.id,
              studentData: {
                student_id: formattedStudentId,
              },
            },
            {
              onSuccess: () => {
                toast({
                  title: 'Success',
                  description: `Student ${newStudent.first_name} ${newStudent.last_name} added successfully.`,
                })
                setShowAddModal(false)
                newStudentForm.reset()
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
          console.error('Error adding student:', error)
          toast({
            title: 'Error',
            description: 'Failed to add student. Please try again.',
            variant: 'destructive',
          })
        },
      }
    )
  }

  const handleCloseNewStudentForm = () => {
    setShowAddModal(false)
    newStudentForm.reset()
  }

  if (isLoading) {
    return (
      <div className='space-y-6'>
        <div className='flex items-center justify-center py-12'>
          <div className='text-center'>
            <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4'></div>
            <p className='text-gray-600'>Loading students...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className='space-y-6'>
      {/* Header */}
      <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4'>
        <div>
          <h1 className='text-2xl lg:text-3xl font-semibold text-gray-900'>Students</h1>
          <p className='text-gray-600'>Manage student information and records</p>
        </div>
        <Button onClick={() => setShowAddModal(true)} className='flex items-center gap-2'>
          <Plus className='w-4 h-4' />
          Add Student
        </Button>
      </div>

      {/* Filters */}
      <StudentTableFilters
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        gradeFilter={gradeFilter}
        setGradeFilter={setGradeFilter}
        dateRangeFilter={dateRangeFilter}
        setDateRangeFilter={setDateRangeFilter}
        programFilter={programFilter}
        setProgramFilter={setProgramFilter}
      />

      {/* Students Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Students ({filteredStudents.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {filteredStudents.length > 0 ? (
            <div className='overflow-x-auto'>
              <table className='w-full'>
                <thead>
                  <tr className='border-b'>
                    <th className='text-left p-4 font-medium'>Name</th>
                    <th className='text-left p-4 font-medium'>Grade</th>
                    <th className='text-left p-4 font-medium'>Program</th>
                    <th className='text-left p-4 font-medium'>Date Created</th>
                    {/* // TODO: Add date of birth (ask Lisa) */}
                    {/* <th className='text-left p-4 font-medium'>Date of Birth</th> */}
                    {/* <th className='text-left p-4 font-medium'>Actions</th> */}
                  </tr>
                </thead>
                <tbody>
                  {filteredStudents.map(student => (
                    <tr
                      key={student.id}
                      className='border-b hover:bg-gray-50 cursor-pointer transition-colors'
                      onClick={() => handleRowClick(student.id)}>
                      <td className='p-4'>
                        <div>
                          <div className='font-medium'>
                            {student.first_name} {student.last_name}
                          </div>
                        </div>
                      </td>
                      {/* // TODO: Add date of birth (ask Lisa) */}
                      {/* <td className='p-4'>N/A</td> */}
                      <td className='p-4'>{getStudentGrade(student)}</td>
                      <td className='p-4'>{getQualificationBadge(student)}</td>
                      <td className='p-4'>
                        {new Date(student.created_at).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </td>
                      {/* <td className='p-4'>
                        <Button
                          size='sm'
                          variant='outline'
                          onClick={e => handleViewClick(e, student.id)}
                          className='flex items-center gap-2'>
                          <Eye className='w-4 h-4' />
                          View
                        </Button>
                      </td> */}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className='text-center py-8 text-gray-500'>
              {searchTerm
                ? 'No students found matching your search.'
                : 'No students found. Add your first student to get started.'}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add Student Modal */}
      <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
        <DialogContent className='max-w-2xl max-h-[90vh] overflow-y-auto'>
          <DialogHeader>
            <DialogTitle className='flex items-center gap-2'>
              <UserPlus className='w-4 h-4 mr-2' />
              Add New Student
            </DialogTitle>
          </DialogHeader>

          <Form {...newStudentForm}>
            <form onSubmit={newStudentForm.handleSubmit(handleAddStudent)} className='space-y-4'>
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

              <FormField
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
              />

              <div className='flex justify-end space-x-2 pt-4'>
                <Button type='button' variant='outline' onClick={handleCloseNewStudentForm}>
                  Cancel
                </Button>
                <Button
                  type='submit'
                  disabled={createStudentMutation.isPending || updateStudentMutation.isPending}>
                  {createStudentMutation.isPending || updateStudentMutation.isPending
                    ? 'Adding...'
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

export default StudentTable
