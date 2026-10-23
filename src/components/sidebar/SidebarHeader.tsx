import { SidebarHeader as SidebarHeaderComponent } from '@/components/ui/sidebar'
import { useLocation } from 'react-router-dom'
import SchoolSelector from '@/components/SchoolSelector'
import { useOrganization } from '@/contexts/OrganizationContext'
import { SCHOOL_FREE_ROUTES } from '@/constants/app'

const SidebarHeader = () => {
  const location = useLocation()
  const { currentOrganization } = useOrganization()
  const isSchoolFreeRoute = SCHOOL_FREE_ROUTES.some(route => location.pathname.includes(route))

  return (
    <SidebarHeaderComponent className='px-6 py-5 bg-white border-b border-gray-50'>
      <div className='space-y-3'>
        {isSchoolFreeRoute ? (
          <>
            <span className='block text-xs font-semibold tracking-wider text-gray-500 uppercase'>
              ORGANIZATION
            </span>
            <span className='block font-medium text-gray-900 truncate'>
              {currentOrganization?.name}
            </span>
          </>
        ) : (
          <>
            <span className='block text-xs font-semibold tracking-wider text-gray-400 uppercase'>
              CURRENT SCHOOL
            </span>
            <SchoolSelector />
          </>
        )}
      </div>
    </SidebarHeaderComponent>
  )
}
export default SidebarHeader
