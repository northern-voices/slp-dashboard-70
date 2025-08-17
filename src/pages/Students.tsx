import React, { useState, useEffect } from 'react'
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar'
import AppSidebar from '@/components/AppSidebar'
import Header from '@/components/Header'
import { OrganizationProvider, useOrganization } from '@/contexts/OrganizationContext'
import StudentTable from '@/components/students/StudentTable'
import { StudentService } from '@/services/studentService'
import { Student } from '@/types/database'

const StudentsContent = () => {
  const { userProfile, currentSchool } = useOrganization()
  const [students, setStudents] = useState<Student[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const userRole = userProfile?.role || 'slp'
  const userName = userProfile
    ? `${userProfile.first_name} ${userProfile.last_name}`
    : 'Dr. Sarah Johnson'

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        setIsLoading(true)

        // Fetch students from the selected school
        if (currentSchool) {
          const studentsData = await StudentService.getStudentsBySchool(currentSchool.id)
          setStudents(studentsData)
        } else {
          // Fallback: if no school is selected, show empty list
          setStudents([])
        }
      } catch (error) {
        console.error('Error fetching students:', error)
        setStudents([])
      } finally {
        setIsLoading(false)
      }
    }

    // Only fetch if we have a selected school
    if (currentSchool) {
      fetchStudents()
    } else {
      setStudents([])
      setIsLoading(false)
    }
  }, [currentSchool, userRole])

  if (isLoading) {
    return (
      <div className='min-h-screen flex w-full bg-gray-25'>
        <div className='flex-1 flex items-center justify-center'>
          <div className='text-center'>
            <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4'></div>
            <p className='text-gray-600'>Loading students...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <SidebarProvider>
      <div className='min-h-screen flex w-full bg-gray-25'>
        <AppSidebar userRole={userRole} userName={userName} />

        <SidebarInset className='flex-1'>
          <Header userRole={userRole} userName={userName} />

          <main className='flex-1 p-4 md:p-6 lg:p-8 pb-8'>
            {/* Show message if no school is selected */}
            {!currentSchool ? (
              <div className='text-center py-12'>
                <div className='text-gray-400 mb-4'>
                  <svg
                    className='w-16 h-16 mx-auto'
                    fill='none'
                    stroke='currentColor'
                    viewBox='0 0 24 24'>
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      strokeWidth={1}
                      d='M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4'
                    />
                  </svg>
                </div>
                <h3 className='text-lg font-medium text-gray-900 mb-2'>Select a School</h3>
                <p className='text-gray-600'>
                  Use the school selector in the sidebar to choose which school to view students
                  from.
                </p>
              </div>
            ) : (
              <StudentTable students={students} selectedSchool={currentSchool} />
            )}
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  )
}

const Students = () => {
  return (
    <OrganizationProvider>
      <StudentsContent />
    </OrganizationProvider>
  )
}

export default Students
