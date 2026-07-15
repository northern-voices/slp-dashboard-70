import { useOrganization } from '@/contexts/OrganizationContext'
import { useConsentFormsBySchool } from '@/hooks/students/use-consent-forms'
import ConsentTable from '@/components/consent/ConsentTable'

const Consent = () => {
  const { currentSchool } = useOrganization()
  const { data: forms = [], isLoading } = useConsentFormsBySchool(currentSchool?.id)

  if (!currentSchool) {
    return (
      <div className='text-center py-12'>
        <h3 className='text-lg font-medium text-gray-900 mb-2'>Select a School</h3>
        <p className='text-gray-600'>
          Use the school selector in the sidebar to choose which school to view consent forms from.
        </p>
      </div>
    )
  }

  return (
    <div className='space-y-6'>
      <div className='flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between'>
        <div>
          <h1 className='text-2xl font-semibold text-gray-900 lg:text-3xl'>Consent</h1>
          <p className='text-gray-600'>Manage student consent forms</p>
        </div>
      </div>

      <ConsentTable forms={forms} isLoading={isLoading} />
    </div>
  )
}

export default Consent
