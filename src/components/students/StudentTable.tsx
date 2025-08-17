import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Student, School } from '@/types/database'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Plus, Search, Filter, Eye } from 'lucide-react'
import { Input } from '@/components/ui/input'
import StudentForm from './StudentForm'
import { StudentService } from '@/services/studentService'
import { useToast } from '@/hooks/use-toast'

interface StudentTableProps {
  students: Student[]
  selectedSchool?: School | null
}

const StudentTable: React.FC<StudentTableProps> = ({ students, selectedSchool }) => {
  const navigate = useNavigate()
  const { toast } = useToast()
  const [searchTerm, setSearchTerm] = useState('')
  const [showAddModal, setShowAddModal] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const filteredStudents = students.filter(
    student =>
      student.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.student_id.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleRowClick = (studentId: string) => {
    navigate(`/students/${studentId}`)
  }

  const handleViewClick = (e: React.MouseEvent, studentId: string) => {
    e.stopPropagation()
    navigate(`/students/${studentId}`)
  }

  const handleAddStudent = async (studentData: {
    first_name: string
    last_name: string
    student_id: string
    grade?: string
    date_of_birth?: string
    emergency_contact_name?: string
  }) => {
    try {
      setIsSubmitting(true)

      // Add required fields for student creation
      const newStudentData: {
        first_name: string
        last_name: string
        student_id: string
        qualifies_for_program?: boolean
        school_id?: string
      } = {
        first_name: studentData.first_name,
        last_name: studentData.last_name,
        student_id: studentData.student_id,
        qualifies_for_program: false, // Default value
      }

      // Only add school_id if the selectedSchool exists and the database supports it
      if (selectedSchool?.id) {
        newStudentData.school_id = selectedSchool.id
      }

      await StudentService.createStudent(newStudentData)

      toast({
        title: 'Success',
        description: 'Student added successfully',
      })

      setShowAddModal(false)

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
      <div className='flex flex-col sm:flex-row gap-4'>
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
      </div>

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
                    <th className='text-left p-4 font-medium'>Student ID</th>
                    <th className='text-left p-4 font-medium'>Grade</th>
                    <th className='text-left p-4 font-medium'>Date of Birth</th>
                    <th className='text-left p-4 font-medium'>Actions</th>
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
                      <td className='p-4'>{student.student_id}</td>
                      <td className='p-4'>N/A</td>
                      <td className='p-4'>N/A</td>
                      <td className='p-4'>
                        <Button
                          size='sm'
                          variant='outline'
                          onClick={e => handleViewClick(e, student.id)}
                          className='flex items-center gap-2'>
                          <Eye className='w-4 h-4' />
                          View
                        </Button>
                      </td>
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
      <StudentForm
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSubmit={handleAddStudent}
        student={null}
        title='Add New Student'
      />
    </div>
  )
}

export default StudentTable
