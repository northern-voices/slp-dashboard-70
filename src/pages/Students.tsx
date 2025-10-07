import React from 'react'
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar'
import AppSidebar from '@/components/AppSidebar'
import Header from '@/components/Header'
import { useOrganization } from '@/contexts/OrganizationContext'
import StudentTable from '@/components/students/StudentTable'

const StudentsContent = () => {
  const { userProfile, currentSchool } = useOrganization()
  const userRole = userProfile?.role || 'slp'
  const userName = userProfile
    ? `${userProfile.first_name} ${userProfile.last_name}`
    : 'Dr. Sarah Johnson'

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
              <StudentTable selectedSchool={currentSchool} />
            )}
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  )
}

const Students = () => {
  return <StudentsContent />
}

export default Students
