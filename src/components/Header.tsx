
import React from 'react';
import { Button } from '@/components/ui/button';
import { 
  Bell,
  User
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { SidebarTrigger } from '@/components/ui/sidebar';

interface HeaderProps {
  userRole?: 'admin' | 'slp' | 'supervisor';
  userName?: string;
}

const Header = ({ userRole = 'slp', userName = 'Dr. Sarah Johnson' }: HeaderProps) => {
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

  return (
    <header className="bg-white border-b border-gray-100 sticky top-0 z-50 shadow-sm">
      <div className="flex items-center justify-between h-14 px-4">
        {/* Left side - Sidebar trigger */}
        <div className="flex items-center space-x-4">
          <SidebarTrigger className="md:hidden" />
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
              <DropdownMenuItem className="text-gray-700 hover:bg-gray-50 focus:bg-gray-50">
                <User className="mr-2 h-4 w-4" />
                Profile
              </DropdownMenuItem>
              <DropdownMenuItem className="text-gray-700 hover:bg-gray-50 focus:bg-gray-50">
                <Bell className="mr-2 h-4 w-4" />
                Settings
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
  );
};

export default Header;
