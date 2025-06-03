
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Bell, User, Settings as SettingsIcon, HandHeart, Menu } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { SidebarTrigger } from '@/components/ui/sidebar';
import SpeechScreeningModal from '@/components/screening/speech/SpeechScreeningModal';
import HearingScreeningModal from '@/components/screening/hearing/HearingScreeningModal';
import MobileNavMenu from '@/components/navigation/MobileNavMenu';
import { ScreeningFormData } from '@/types/screening';
import { useToast } from '@/hooks/use-toast';
import { useNavigate, useLocation } from 'react-router-dom';

interface HeaderProps {
  userRole?: 'admin' | 'slp' | 'supervisor';
  userName?: string;
  className?: string;
  userProfile?: any;
}

const Header = ({
  userRole = 'slp',
  userName = 'Dr. Sarah Johnson',
  className,
  userProfile
}: HeaderProps) => {
  const [showSpeechScreeningModal, setShowSpeechScreeningModal] = useState(false);
  const [showHearingScreeningModal, setShowHearingScreeningModal] = useState(false);
  const [showMobileNav, setShowMobileNav] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  
  const initials = userName.split(' ').map(n => n[0]).join('');

  // Extract student ID from current path if on student detail page
  const studentId = location.pathname.match(/\/students\/([^\/]+)/)?.[1];
  
  // Check if user is on main dashboard pages where Submit Ticket button should be visible
  const isDashboardPage = ['/', '/students', '/school-support', '/reports', '/management'].includes(location.pathname);
  const shouldShowSubmitTicketButton = studentId || isDashboardPage;

  const getRoleDisplayName = (role: 'admin' | 'slp' | 'supervisor') => {
    switch (role) {
      case 'admin':
        return 'Administrator';
      case 'supervisor':
        return 'Supervisor';
      case 'slp':
      default:
        return 'Speech-Language Pathologist';
    }
  };

  const handleSpeechScreeningSubmit = (screeningData: ScreeningFormData) => {
    console.log('Speech screening submitted:', screeningData);
    toast({
      title: "Speech Screening completed",
      description: screeningData.student_info ? `New student ${screeningData.student_info.first_name} ${screeningData.student_info.last_name} and screening have been recorded.` : "Speech screening has been recorded successfully."
    });
    setShowSpeechScreeningModal(false);
  };

  const handleHearingScreeningSubmit = (screeningData: ScreeningFormData) => {
    console.log('Hearing screening submitted:', screeningData);
    toast({
      title: "Hearing Screening completed", 
      description: screeningData.student_info ? `New student ${screeningData.student_info.first_name} ${screeningData.student_info.last_name} and screening have been recorded.` : "Hearing screening has been recorded successfully."
    });
    setShowHearingScreeningModal(false);
  };

  const handleSubmitTicketClick = () => {
    if (studentId) {
      navigate(`/students/${studentId}/school-support`);
    } else {
      navigate('/school-support');
    }
  };

  return (
    <>
      <header className={`bg-white border-b border-gray-100 sticky top-0 z-40 ${className || ''}`}>
        <div className="flex items-center justify-between h-16 px-6">
          {/* Left side - Mobile hamburger + Desktop sidebar trigger */}
          <div className="flex items-center">
            {/* Mobile hamburger menu */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowMobileNav(true)}
              className="md:hidden -ml-1 mr-2 h-8 w-8 p-0"
            >
              <Menu className="h-5 w-5" />
            </Button>

            {/* Desktop sidebar trigger */}
            <SidebarTrigger className="hidden md:flex -ml-1 mr-2" />
            
            {/* Mobile brand */}
            <div className="md:hidden flex items-center space-x-3">
              <div className="w-8 h-8 bg-brand rounded-lg flex items-center justify-center">
                <span className="text-white font-semibold text-sm">SLP</span>
              </div>
              <span className="font-semibold text-gray-900 hidden md:block">Dashboard</span>
            </div>
          </div>

          {/* Right side - User actions */}
          <div className="flex items-center md:space-x-3 space-x-2">
            {/* Submit Ticket Button - show on desktop only */}
            {shouldShowSubmitTicketButton && (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleSubmitTicketClick}
                className="hidden md:flex text-gray-700 hover:text-gray-900 hover:bg-gray-50 md:h-9 h-10 md:px-3 px-3 md:text-sm text-sm"
              >
                <HandHeart className="md:w-4 md:h-4 w-3.5 h-3.5 mr-2" />
                Submit Ticket
              </Button>
            )}

            {/* Notifications */}
            <Button 
              variant="ghost" 
              size="sm" 
              className="relative text-gray-500 hover:text-gray-700 hover:bg-gray-50 md:h-9 md:w-9 h-8 w-8 p-0 rounded-lg"
            >
              <Bell className="md:w-5 md:h-5 w-4 h-4" />
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full md:w-5 md:h-5 w-4 h-4 flex items-center justify-center font-medium">
                3
              </span>
            </Button>
            
            {/* User Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative md:h-9 md:w-9 h-8 w-8 rounded-lg hover:bg-gray-50 p-0">
                  <Avatar className="md:h-8 md:w-8 h-7 w-7">
                    <AvatarFallback className="bg-gray-100 text-gray-700 md:text-sm text-xs font-medium">
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-64 bg-white shadow-lg border border-gray-100 rounded-xl p-2" align="end" forceMount>
                <div className="flex items-center gap-3 p-3 rounded-lg">
                  <Avatar className="h-9 w-9">
                    <AvatarFallback className="bg-gray-100 text-gray-700 text-sm font-medium">
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col space-y-0.5 leading-none">
                    <p className="font-medium text-gray-900 text-sm">{userName}</p>
                    <p className="text-xs text-gray-500 leading-relaxed">
                      {getRoleDisplayName(userRole)}
                    </p>
                  </div>
                </div>
                <DropdownMenuSeparator className="bg-gray-100 my-2" />
                <DropdownMenuItem className="text-gray-700 hover:bg-gray-50 focus:bg-gray-50 rounded-lg px-3 py-2" asChild>
                  <a href="/profile" className="flex items-center">
                    <User className="mr-3 h-4 w-4" />
                    Profile
                  </a>
                </DropdownMenuItem>
                <DropdownMenuItem className="text-gray-700 hover:bg-gray-50 focus:bg-gray-50 rounded-lg px-3 py-2" asChild>
                  <a href="/profile?tab=account" className="flex items-center">
                    <SettingsIcon className="mr-3 h-4 w-4" />
                    Settings
                  </a>
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-gray-100 my-2" />
                <DropdownMenuItem className="text-gray-700 hover:bg-gray-50 focus:bg-gray-50 rounded-lg px-3 py-2">
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
        title="New Speech Screening" 
      />

      <HearingScreeningModal 
        isOpen={showHearingScreeningModal} 
        onClose={() => setShowHearingScreeningModal(false)} 
        onSubmit={handleHearingScreeningSubmit} 
        title="New Hearing Screening" 
      />
    </>
  );
};

export default Header;
