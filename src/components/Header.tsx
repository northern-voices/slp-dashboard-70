
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Bell, User, Settings as SettingsIcon } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { SidebarTrigger } from '@/components/ui/sidebar';
import SpeechScreeningModal from '@/components/screening/speech/SpeechScreeningModal';
import HearingScreeningModal from '@/components/screening/hearing/HearingScreeningModal';
import { ScreeningFormData } from '@/types/screening';
import { useToast } from '@/hooks/use-toast';

interface HeaderProps {
  userRole?: 'admin' | 'slp' | 'supervisor';
  userName?: string;
  className?: string;
}

const Header = ({
  userRole = 'slp',
  userName = 'Dr. Sarah Johnson',
  className
}: HeaderProps) => {
  const [showSpeechScreeningModal, setShowSpeechScreeningModal] = useState(false);
  const [showHearingScreeningModal, setShowHearingScreeningModal] = useState(false);
  const { toast } = useToast();
  
  const initials = userName.split(' ').map(n => n[0]).join('');

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

  return (
    <>
      <header className={`bg-white border-b border-gray-100 sticky top-0 z-40 shadow-sm ${className || ''}`}>
        <div className="flex items-center justify-between h-14 px-4">
          {/* Left side - Sidebar trigger and navigation for desktop */}
          <div className="flex items-center space-x-4">
            <SidebarTrigger className="hidden md:flex" />
            <div className="md:hidden">
              <div className="flex items-center space-x-2">
                <div className="w-6 h-6 bg-brand rounded flex items-center justify-center">
                  <span className="text-white font-bold text-xs">SLP</span>
                </div>
                <span className="font-semibold text-gray-900 text-sm">SLP Dashboard</span>
              </div>
            </div>
          </div>

          {/* Right side - User actions */}
          <div className="flex items-center space-x-3">
            <Button variant="ghost" size="sm" className="relative text-gray-600 hover:text-gray-900 hover:bg-gray-100 h-8 w-8 p-0">
              <Bell className="w-4 h-4" />
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center shadow-sm">
                3
              </span>
            </Button>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-lg hover:bg-gray-100 p-0">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-slate-100 text-slate-700 text-xs font-medium">
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56 bg-white shadow-lg border-gray-100" align="end" forceMount>
                <div className="flex items-center justify-start gap-2 p-3">
                  <div className="flex flex-col space-y-1 leading-none">
                    <p className="font-semibold text-gray-900 text-sm">{userName}</p>
                    <p className="w-[200px] truncate text-xs text-gray-500">
                      {getRoleDisplayName(userRole)}
                    </p>
                  </div>
                </div>
                <DropdownMenuSeparator className="bg-gray-100" />
                <DropdownMenuItem className="text-gray-700 hover:bg-gray-50 focus:bg-gray-50" asChild>
                  <a href="/profile" className="flex items-center">
                    <User className="mr-2 h-4 w-4" />
                    Profile
                  </a>
                </DropdownMenuItem>
                <DropdownMenuItem className="text-gray-700 hover:bg-gray-50 focus:bg-gray-50" asChild>
                  <a href="/profile?tab=account" className="flex items-center">
                    <SettingsIcon className="mr-2 h-4 w-4" />
                    Account
                  </a>
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-gray-100" />
                <DropdownMenuItem className="text-gray-700 hover:bg-gray-50 focus:bg-gray-50">
                  Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      {/* Speech Screening Modal */}
      <SpeechScreeningModal 
        isOpen={showSpeechScreeningModal} 
        onClose={() => setShowSpeechScreeningModal(false)} 
        onSubmit={handleSpeechScreeningSubmit} 
        title="New Speech Screening" 
      />

      {/* Hearing Screening Modal */}
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
