
import React from 'react';
import { Button } from '@/components/ui/button';
import { 
  Home, 
  Users, 
  FileText, 
  Settings,
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

interface HeaderProps {
  userRole?: 'admin' | 'slp';
  userName?: string;
}

const Header = ({ userRole = 'slp', userName = 'Dr. Sarah Johnson' }: HeaderProps) => {
  const initials = userName.split(' ').map(n => n[0]).join('');

  return (
    <header className="bg-white border-b border-gray-100 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo and Title */}
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-3">
              <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center shadow-sm">
                <span className="text-white font-bold text-sm">SLP</span>
              </div>
              <h1 className="text-xl font-semibold text-gray-900 tracking-tight">Dashboard</h1>
            </div>
          </div>

          {/* Navigation */}
          <nav className="hidden md:flex items-center space-x-1">
            <Button variant="ghost" size="sm" className="text-blue-600 bg-blue-50 hover:bg-blue-100 font-medium">
              <Home className="w-4 h-4 mr-2" />
              Home
            </Button>
            <Button variant="ghost" size="sm" className="text-gray-700 hover:text-gray-900 hover:bg-gray-100 font-medium">
              <Users className="w-4 h-4 mr-2" />
              Students
            </Button>
            <Button variant="ghost" size="sm" className="text-gray-700 hover:text-gray-900 hover:bg-gray-100 font-medium">
              <FileText className="w-4 h-4 mr-2" />
              Reports
            </Button>
            {userRole === 'admin' && (
              <Button variant="ghost" size="sm" className="text-gray-700 hover:text-gray-900 hover:bg-gray-100 font-medium">
                <Settings className="w-4 h-4 mr-2" />
                Admin
              </Button>
            )}
          </nav>

          {/* User Actions */}
          <div className="flex items-center space-x-3">
            <Button variant="ghost" size="sm" className="relative text-gray-600 hover:text-gray-900 hover:bg-gray-100">
              <Bell className="w-5 h-5" />
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center shadow-sm">
                3
              </span>
            </Button>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-9 w-9 rounded-xl hover:bg-gray-100">
                  <Avatar className="h-9 w-9">
                    <AvatarFallback className="bg-slate-100 text-slate-700 text-sm font-medium">
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56 bg-white shadow-lg border-gray-100" align="end" forceMount>
                <div className="flex items-center justify-start gap-2 p-3">
                  <div className="flex flex-col space-y-1 leading-none">
                    <p className="font-semibold text-gray-900">{userName}</p>
                    <p className="w-[200px] truncate text-sm text-gray-500">
                      {userRole === 'admin' ? 'Administrator' : 'Speech-Language Pathologist'}
                    </p>
                  </div>
                </div>
                <DropdownMenuSeparator className="bg-gray-100" />
                <DropdownMenuItem className="text-gray-700 hover:bg-gray-50 focus:bg-gray-50">
                  <User className="mr-2 h-4 w-4" />
                  Profile
                </DropdownMenuItem>
                <DropdownMenuItem className="text-gray-700 hover:bg-gray-50 focus:bg-gray-50">
                  <Settings className="mr-2 h-4 w-4" />
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
      </div>
    </header>
  );
};

export default Header;
