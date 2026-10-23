import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { User, Settings as SettingsIcon, /* HandHeart, */ Menu, Building2 } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { SidebarTrigger } from '@/components/ui/sidebar'
import SpeechScreeningModal from '@/components/screening/speech/SpeechScreeningModal'
import HearingScreeningModal from '@/components/screening/hearing/HearingScreeningModal'
import MobileNavMenu from '@/components/navigation/MobileNavMenu'
import NotificationDropdown from '@/components/notifications/NotificationDropdown'
import { ScreeningFormData } from '@/types/screening'
import { useToast } from '@/hooks/use-toast'
import { useNavigate, useLocation, Link } from 'react-router-dom'
import { useOrganization } from '@/contexts/OrganizationContext'
import { useCurrentSchool } from '@/hooks/school/useCurrentSchool'
import { useAuth } from '@/contexts/AuthContext'
import { UserRole } from '@/types/database'

interface HeaderProps {
  userRole?: UserRole | null
  userName?: string
  className?: string
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  userProfile?: any
}

const Header = ({
  userRole = 'slp',
  userName = 'Dr. Sarah Johnson',
  className,
  userProfile,
}: HeaderProps) => {
  const [showSpeechScreeningModal, setShowSpeechScreeningModal] = useState(false)
  const [showHearingScreeningModal, setShowHearingScreeningModal] = useState(false)
  const [showMobileNav, setShowMobileNav] = useState(false)
  const { toast } = useToast()
  const navigate = useNavigate()
  const location = useLocation()
  const { userProfile: orgUserProfile, isLoading } = useOrganization()
  const { currentSchool } = useCurrentSchool()
  const { logout } = useAuth()
  const [resolvedRole, setResolvedRole] = useState<string | null>(null)

  useEffect(() => {
    if (!isLoading && orgUserProfile?.role) {
      setResolvedRole(orgUserProfile.role)
    }
  }, [isLoading, orgUserProfile?.role])

  const initials = userName
    .split(' ')
    .map(n => n[0])
    .join('')

  // Check if user is on main dashboard pages where Submit Ticket button should be visible
  // const isDashboardPage = ['/', '/students', '/school-support', '/speech-screening-reports', '/management'].includes(location.pathname);
  // const shouldShowSubmitTicketButton = studentId || isDashboardPage;

  const getRoleDisplayName = (role: UserRole) => {
    switch (role) {
      case 'admin':
        return 'Administrator'
      case 'super_admin':
        return 'Super Admin'
      case 'slp':
      default:
        return 'Speech-Language Pathologist'
    }
  }

  const handleSpeechScreeningSubmit = (screeningData: ScreeningFormData) => {
    console.log('Speech screening submitted:', screeningData)
    toast({
      title: 'Speech Screening completed',
      description: screeningData.student_info
        ? `New student ${screeningData.student_info.first_name} ${screeningData.student_info.last_name} and screening have been recorded.`
        : 'Speech screening has been recorded successfully.',
    })
    setShowSpeechScreeningModal(false)
  }

  const handleHearingScreeningSubmit = (screeningData: ScreeningFormData) => {
    console.log('Hearing screening submitted:', screeningData)
    toast({
      title: 'Hearing Screening completed',
      description: screeningData.student_info
        ? `New student ${screeningData.student_info.first_name} ${screeningData.student_info.last_name} and screening have been recorded.`
        : 'Hearing screening has been recorded successfully.',
    })
    setShowHearingScreeningModal(false)
  }

  // const handleSubmitTicketClick = () => {
  //   if (studentId) {
  //     navigate(`/students/${studentId}/school-support`);
  //   } else {
  //     navigate('/school-support/create');
  //   }
  // };

  return (
    <>
      <header className={`bg-white border-b border-gray-100 sticky top-0 z-40 ${className || ''}`}>
        <div className='flex items-center justify-between h-16 px-6'>
          {/* Left side - Mobile hamburger + Desktop sidebar trigger + School name */}
          <div className='flex items-center'>
            {/* Mobile hamburger menu */}
            <Button
              variant='ghost'
              size='sm'
              onClick={() => setShowMobileNav(true)}
              className='w-8 h-8 p-0 mr-2 -ml-1 md:hidden'>
              <Menu className='w-5 h-5' />
            </Button>

            {/* Desktop sidebar trigger */}
            <SidebarTrigger className='hidden mr-2 -ml-1 md:flex' />

            {/* Mobile brand */}
            <div className='flex items-center space-x-3 md:hidden'>
              <div className='flex items-center justify-center w-8 h-8 rounded-lg bg-brand'>
                <span className='text-sm font-semibold text-white'>SLP</span>
              </div>
              <span className='hidden font-semibold text-gray-900 md:block'>Dashboard</span>
            </div>

            {/* School name display */}
            {currentSchool && (
              <div className='items-center hidden ml-4 md:flex'>
                <span className='text-lg font-semibold text-blue-600'>{currentSchool.name}</span>
              </div>
            )}
          </div>

          {/* Right side - User actions */}
          <div className='flex items-center space-x-2 md:space-x-3'>
            {/* Submit Ticket Button - commented out for now
            {shouldShowSubmitTicketButton && (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleSubmitTicketClick}
                className="hidden h-10 px-3 text-sm text-gray-700 md:flex hover:text-gray-900 hover:bg-gray-50 md:h-9 md:px-3 md:text-sm"
              >
                <HandHeart className="md:w-4 md:h-4 w-3.5 h-3.5 mr-2" />
                Submit Ticket
              </Button>
            )} */}

            {/* Notifications */}
            {/* // TODO: Add notifications functionality (brainstorm with team first) */}
            {/* <NotificationDropdown /> */}

            {/* User Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant='ghost'
                  className='relative w-8 h-8 p-0 rounded-lg md:h-9 md:w-9 hover:bg-gray-50'>
                  <Avatar className='md:h-8 md:w-8 h-7 w-7'>
                    <AvatarFallback className='text-xs font-medium text-gray-700 bg-gray-100 md:text-sm'>
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                className='w-64 p-2 bg-white border border-gray-100 shadow-lg rounded-xl'
                align='end'
                forceMount>
                <div className='flex items-center gap-3 p-3 rounded-lg'>
                  <Avatar className='h-9 w-9'>
                    <AvatarFallback className='text-sm font-medium text-gray-700 bg-gray-100'>
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                  <div className='flex flex-col space-y-0.5 leading-none'>
                    <p className='text-sm font-medium text-gray-900'>{userName}</p>
                    <p className='text-xs leading-relaxed text-gray-500'>
                      {getRoleDisplayName(userRole)}
                    </p>
                  </div>
                </div>
                <DropdownMenuSeparator className='my-2 bg-gray-100' />
                <DropdownMenuItem
                  className='px-3 py-2 text-gray-700 rounded-lg hover:bg-gray-50 focus:bg-gray-50'
                  asChild>
                  <a href='/profile' className='flex items-center'>
                    <User className='w-4 h-4 mr-3' />
                    Profile
                  </a>
                </DropdownMenuItem>
                <DropdownMenuItem
                  className='px-3 py-2 text-gray-700 rounded-lg hover:bg-gray-50 focus:bg-gray-50'
                  asChild>
                  <a href='/profile?tab=account' className='flex items-center'>
                    <SettingsIcon className='w-4 h-4 mr-3' />
                    Settings
                  </a>
                </DropdownMenuItem>
                {(resolvedRole === 'admin' || resolvedRole === 'super_admin') && (
                  <DropdownMenuItem
                    className='px-3 py-2 text-gray-700 rounded-lg hover:bg-gray-50 focus:bg-gray-50'
                    asChild>
                    <Link to='/management' className='flex items-center'>
                      <Building2 className='w-4 h-4 mr-3' />
                      Management
                    </Link>
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator className='my-2 bg-gray-100' />
                <DropdownMenuItem
                  onClick={logout}
                  className='px-3 py-2 text-gray-700 rounded-lg hover:bg-gray-50 focus:bg-gray-50'>
                  Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      {/* Mobile Navigation Menu */}
      <MobileNavMenu
        isOpen={showMobileNav}
        onClose={() => setShowMobileNav(false)}
        userRole={userRole}
        userName={userName}
        userProfile={userProfile}
      />

      {/* Modals */}
      <SpeechScreeningModal
        isOpen={showSpeechScreeningModal}
        onClose={() => setShowSpeechScreeningModal(false)}
        onSubmit={handleSpeechScreeningSubmit}
        title='New Speech Screening'
      />

      <HearingScreeningModal
        isOpen={showHearingScreeningModal}
        onClose={() => setShowHearingScreeningModal(false)}
        onSubmit={handleHearingScreeningSubmit}
        title='New Hearing Screening'
      />
    </>
  )
}

export default Header
