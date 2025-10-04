import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Student, School } from '@/types/database'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Plus, UserPlus, Search, Filter, Eye } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
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
import { StudentService } from '@/services/studentService'
import { useToast } from '@/hooks/use-toast'
import { useOrganization } from '@/contexts/OrganizationContext'

interface StudentTableProps {
  students: Student[]
  selectedSchool?: School | null
}

// Simplified student creation schema
const newStudentSchema = z.object({
  first_name: z.string().min(1, 'First name is required'),
  last_name: z.string().min(1, 'Last name is required'),
})

type NewStudentFormData = z.infer<typeof newStudentSchema>

const gradeMapping = [
  { display: 'Headstart', value: 'Headstart' },
  { display: 'Nursery', value: 'Nursery' },
  { display: 'Pre-K', value: 'Pre-K' },
  { display: 'K4', value: 'K4' },
  { display: 'K5', value: 'K5' },
  { display: 'Kindergarten', value: 'Kindergarten' },
  { display: 'K/1', value: 'K/1' },
  { display: '1', value: '1' },
  { display: '1/2', value: '1/2' },
  { display: '2', value: '2' },
  { display: '2/3', value: '2/3' },
  { display: '3', value: '3' },
  { display: '3/4', value: '3/4' },
  { display: '4', value: '4' },
  { display: '4/5', value: '4/5' },
  { display: '5', value: '5' },
  { display: '5/6', value: '5/6' },
  { display: '6', value: '6' },
  { display: '6/7', value: '6/7' },
  { display: '7', value: '7' },
  { display: '7/8', value: '7/8' },
  { display: '8', value: '8' },
  { display: '8/9', value: '8/9' },
  { display: '9', value: '9' },
  { display: '9/10', value: '9/10' },
  { display: '10', value: '10' },
  { display: '10/11', value: '10/11' },
  { display: '11', value: '11' },
  { display: '11/12', value: '11/12' },
  { display: '12', value: '12' },
]

const StudentTable: React.FC<StudentTableProps> = ({ students, selectedSchool }) => {
  const navigate = useNavigate()
  const { toast } = useToast()
  const [searchTerm, setSearchTerm] = useState('')
  const [showAddModal, setShowAddModal] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Get current school context
  const { currentSchool } = useOrganization()

  // Use the selectedSchool prop or fall back to currentSchool from context
  const activeSchool = selectedSchool || currentSchool

  // New student form
  const newStudentForm = useForm<NewStudentFormData>({
    resolver: zodResolver(newStudentSchema),
    defaultValues: {
      first_name: '',
      last_name: '',
    },
  })

  // Helper function to get grade level for a student
  const getStudentGrade = (student: Student): string => {
    // If the student has a grade field (from screenings), use it
    if (student.grade) {
      return student.grade
    }

    // Otherwise, show N/A
    return 'N/A'
  }

  const filteredStudents = students
    .filter(
      student =>
        student.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.student_id.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      const gradeA = a.grade || 'N/A'
      const gradeB = b.grade || 'N/A'

      const indexA = gradeMapping.findIndex(g => g.value === gradeA)
      const indexB = gradeMapping.findIndex(g => g.value === gradeB)

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

  const handleAddStudent = async (data: NewStudentFormData) => {
    try {
      setIsSubmitting(true)

      // Generate a unique student ID based on name and timestamp
      const timestamp = Date.now().toString(36)
      const initials = `${data.first_name.charAt(0)}${data.last_name.charAt(0)}`.toUpperCase()
      const generatedStudentId = `${initials}-${timestamp}`

      const newStudentData: {
        first_name: string
        last_name: string
        student_id: string
        qualifies_for_program: boolean
        school_id?: string
      } = {
        first_name: data.first_name,
        last_name: data.last_name,
        student_id: generatedStudentId,
        qualifies_for_program: false, // Default value
      }

      // Only add school_id if the activeSchool exists and the database supports it
      if (activeSchool?.id) {
        newStudentData.school_id = activeSchool.id
      }

      await StudentService.createStudent(newStudentData)

      toast({
        title: 'Success',
        description: 'Student added successfully',
      })

      setShowAddModal(false)
      newStudentForm.reset()

      // TODO: Change window reload to revalidate data instead
      // Refresh the page to show the new student
      window.location.reload()
    } catch (error) {
      console.error('Error adding student:', error)
      toast({
        title: 'Error',
        description: 'Failed to add student. Please try again.',
        variant: 'destructive',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCloseNewStudentForm = () => {
    setShowAddModal(false)
    newStudentForm.reset()
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

      {/* Search and Filters */}
      {/* // TODO: Add filters for students table */}
      {/* <div className='flex flex-col sm:flex-row gap-4'>
        <div className='relative flex-1'>
          <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4' />
          <Input
            placeholder='Search students by name or ID...'
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className='pl-10'
          />
        </div>
        <Button variant='outline' className='flex items-center gap-2'>
          <Filter className='w-4 h-4' />
          Filter
        </Button>
      </div> */}

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

              <div className='flex justify-end space-x-2 pt-4'>
                <Button type='button' variant='outline' onClick={handleCloseNewStudentForm}>
                  Cancel
                </Button>
                <Button type='submit' disabled={isSubmitting}>
                  {isSubmitting ? 'Adding...' : 'Add Student'}
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
