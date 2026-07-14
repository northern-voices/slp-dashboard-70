import { useOrganization } from '@/contexts/OrganizationContext'
import { useStudentsBySchool } from '@/hooks/students/use-students'
import CaseloadTable from '@/components/caseload/CaseloadTable'

const Caseload = () => {
  const { currentSchool } = useOrganization()
  const { data: students = [], isLoading } = useStudentsBySchool(currentSchool?.id)

  return (
    <div className='space-y-6'>
      <div className='flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between'>
        <div>
          <h1 className='text-2xl font-semibold text-gray-900 lg:text-3xl'>Caseload</h1>
          <p className='text-gray-600'>Manage your active caseload</p>
        </div>
      </div>

      <CaseloadTable students={students} isLoading={isLoading} schoolId={currentSchool.id} />
    </div>
  )
}

export default Caseload
