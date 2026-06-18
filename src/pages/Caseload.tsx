import { useOrganization } from '@/contexts/OrganizationContext'
import { useStudentsBySchool } from '@/hooks/students/use-students'
import CaseloadTable from '@/components/caseload/CaseloadTable'
import TransferredStudentsTable from '@/components/caseload/TransferredStudentsTable'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

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

      <Tabs defaultValue='all' className='space-y-6'>
        <TabsList className='flex-wrap justify-start w-full h-auto p-1'>
          <TabsTrigger value='all' className='flex-shrink-0'>
            All
          </TabsTrigger>
          <TabsTrigger value='active' className='flex-shrink-0'>
            Active
          </TabsTrigger>
          <TabsTrigger value='paused' className='flex-shrink-0'>
            Pause/Away
          </TabsTrigger>
          <TabsTrigger value='graduated' className='flex-shrink-0'>
            Graduated
          </TabsTrigger>
          <TabsTrigger value='transferred' className='flex-shrink-0'>
            Transferred
          </TabsTrigger>
        </TabsList>

        <TabsContent value='all' className='space-y-6'>
          <CaseloadTable
            students={students}
            isLoading={isLoading}
            schoolId={currentSchool.id}
            statusGroup='all'
          />
        </TabsContent>

        <TabsContent value='active' className='space-y-6'>
          <CaseloadTable
            students={students}
            isLoading={isLoading}
            schoolId={currentSchool.id}
            statusGroup='active'
          />
        </TabsContent>

        <TabsContent value='paused' className='space-y-6'>
          <CaseloadTable
            students={students}
            isLoading={isLoading}
            schoolId={currentSchool.id}
            statusGroup='paused'
          />
        </TabsContent>

        <TabsContent value='graduated' className='space-y-6'>
          <CaseloadTable
            students={students}
            isLoading={isLoading}
            schoolId={currentSchool.id}
            statusGroup='graduated'
          />
        </TabsContent>

        <TabsContent value='transferred' className='space-y-6'>
          <TransferredStudentsTable schoolId={currentSchool.id} />
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default Caseload
