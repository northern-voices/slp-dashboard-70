import React from 'react'
import { useOrganization } from '@/contexts/OrganizationContext'

const Caseload = () => {
  const { currentSchool } = useOrganization()

  if (!currentSchool) {
    return (
      <div className='text-center py-12'>
        <div className='text-gray-400 mb-4'>
          <svg className='w-16 h-16 mx-auto' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
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
          Use the school selector in the sidebar to choose which school to view your caseload from.
        </p>
      </div>
    )
  }

  return (
    <div className='space-y-6'>
      {/* Header */}
      <div className='flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between'>
        <div>
          <h1 className='text-2xl font-semibold text-gray-900 lg:text-3xl'>Caseload</h1>
          <p className='text-gray-600'>Manage your active caseload</p>
        </div>
      </div>

      {/* Table will go here */}
    </div>
  )
}

export default Caseload
