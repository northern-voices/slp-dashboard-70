import React from 'react'
import { SidebarHeader as SidebarHeaderComponent } from '@/components/ui/sidebar'
import SchoolSelector from '@/components/SchoolSelector'
const SidebarHeader = () => {
  return (
    <SidebarHeaderComponent className='border-b border-gray-50 px-6 py-5 bg-white'>
      {/* Current School Section */}
      <div className='space-y-3'>
        <span className='text-xs font-semibold text-gray-400 uppercase tracking-wider block'>
          CURRENT SCHOOL
        </span>
        <SchoolSelector />
      </div>
    </SidebarHeaderComponent>
  )
}
export default SidebarHeader
