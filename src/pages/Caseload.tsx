import { useState } from 'react'
import { useOrganization } from '@/contexts/OrganizationContext'
import { useStudentsBySchool } from '@/hooks/students/use-students'
import { Input } from '@/components/ui/input'
import { Search } from 'lucide-react'
import CaseloadTable from '@/components/caseload/CaseloadTable'
import AttendanceSheetsSection from '@/components/caseload/AttendanceSheetsSection'

const Caseload = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const { currentSchool } = useOrganization()
  const { data: students = [], isLoading } = useStudentsBySchool(currentSchool?.id)

  if (!currentSchool) {
    return (
      <div className='py-12 text-center'>
        <div className='mb-4 text-gray-400'>
          <svg className='w-16 h-16 mx-auto' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
            <path
              strokeLinecap='round'
              strokeLinejoin='round'
              strokeWidth={1}
              d='M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4'
            />
          </svg>
        </div>
        <h3 className='mb-2 text-lg font-medium text-gray-900'>Select a School</h3>
        <p className='text-gray-600'>
          Use the school selector in the sidebar to choose which school to view your caseload from.
        </p>
      </div>
    )
  }

  return (
    <div className='space-y-6'>
      <div className='flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between'>
        <div>
          <h1 className='text-2xl font-semibold text-gray-900 lg:text-3xl'>Caseload</h1>
          <p className='text-gray-600'>Manage your active caseload</p>
        </div>
      </div>

      <div className='relative'>
        <Search className='absolute w-4 h-4 text-gray-400 -translate-y-1/2 left-3 top-1/2' />
        <Input
          placeholder='Search by student name...'
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          className='pl-10'
        />
      </div>

      <CaseloadTable
        students={students}
        isLoading={isLoading}
        schoolId={currentSchool.id}
        searchTerm={searchTerm}
      />

      <AttendanceSheetsSection schoolId={currentSchool.id} />
    </div>
  )
}

export default Caseload
