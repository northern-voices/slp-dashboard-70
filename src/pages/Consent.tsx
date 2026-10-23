import { useState } from 'react'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useCurrentSchool } from '@/hooks/school/useCurrentSchool'
import { useConsentFormsBySchool } from '@/hooks/students/use-consent-forms'
import ConsentTable from '@/components/consent/ConsentTable'
import BulkConsentFormModal from '@/components/consent/BulkConsentFormModal'

const Consent = () => {
  const { currentSchool } = useCurrentSchool()
  const { data: forms = [], isLoading } = useConsentFormsBySchool(currentSchool?.id)
  const [isBulkModalOpen, setIsBulkModalOpen] = useState(false)

  if (!currentSchool) {
    return (
      <div className='py-12 text-center'>
        <h3 className='mb-2 text-lg font-medium text-gray-900'>Select a School</h3>
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

        <Button size='sm' onClick={() => setIsBulkModalOpen(true)}>
          <Plus className='w-4 h-4' />
          Add
        </Button>
      </div>

      <ConsentTable forms={forms} isLoading={isLoading} />

      <BulkConsentFormModal
        isOpen={isBulkModalOpen}
        onClose={() => setIsBulkModalOpen(false)}
        schoolId={currentSchool.id}
      />
    </div>
  )
}

export default Consent
