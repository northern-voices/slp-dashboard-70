
import React from 'react';
import { Button } from '@/components/ui/button';
import { 
  Bell,
  User,
  Mic,
  Volume2,
  BarChart3,
  Calendar,
  Users,
  FileText
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuList,
  NavigationMenuTrigger,
} from '@/components/ui/navigation-menu';
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
    <header className="bg-white border-b border-gray-100 sticky top-0 z-40 shadow-sm">
      <div className="flex items-center justify-between h-14 px-4">
        {/* Left side - Sidebar trigger and navigation for desktop */}
        <div className="flex items-center space-x-4">
          <SidebarTrigger className="hidden md:flex" />
          <div className="md:hidden">
            <div className="flex items-center space-x-2">
              <div className="w-6 h-6 bg-blue-600 rounded flex items-center justify-center">
                <span className="text-white font-bold text-xs">SLP</span>
              </div>
              <span className="font-semibold text-gray-900 text-sm">SLP Dashboard</span>
            </div>
          </div>
          
          {/* Desktop Navigation */}
          <div className="hidden lg:block">
            <NavigationMenu>
              <NavigationMenuList>
                {/* Quick Screenings Navigation */}
                <NavigationMenuItem>
                  <NavigationMenuTrigger className="text-sm font-medium">
                    Quick Screenings
                  </NavigationMenuTrigger>
                  <NavigationMenuContent>
                    <div className="p-4 w-80">
                      <div className="mb-3">
                        <h4 className="text-sm font-semibold text-gray-900 mb-1">Start new assessments and screenings</h4>
                      </div>
                      <div className="space-y-3">
                        <button className="w-full flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors text-left">
                          <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                            <Mic className="w-5 h-5 text-white" />
                          </div>
                          <div>
                            <div className="font-medium text-gray-900 text-sm">New Speech Screening</div>
                            <div className="text-xs text-gray-500">Start a new speech assessment</div>
                          </div>
                        </button>
                        <button className="w-full flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors text-left">
                          <div className="w-10 h-10 bg-teal-600 rounded-lg flex items-center justify-center">
                            <Volume2 className="w-5 h-5 text-white" />
                          </div>
                          <div>
                            <div className="font-medium text-gray-900 text-sm">New Hearing Screening</div>
                            <div className="text-xs text-gray-500">Conduct hearing assessment</div>
                          </div>
                        </button>
                      </div>
                    </div>
                  </NavigationMenuContent>
                </NavigationMenuItem>

                {/* Management Tools Navigation */}
                <NavigationMenuItem>
                  <NavigationMenuTrigger className="text-sm font-medium">
                    Management Tools
                  </NavigationMenuTrigger>
                  <NavigationMenuContent>
                    <div className="p-4 w-80">
                      <div className="mb-3">
                        <h4 className="text-sm font-semibold text-gray-900 mb-1">Manage students, reports, and scheduling</h4>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <button className="flex flex-col items-center space-y-2 p-3 rounded-lg hover:bg-gray-50 transition-colors text-center">
                          <div className="w-10 h-10 bg-purple-600 rounded-lg flex items-center justify-center">
                            <BarChart3 className="w-5 h-5 text-white" />
                          </div>
                          <div>
                            <div className="font-medium text-gray-900 text-xs">Progress Report</div>
                            <div className="text-xs text-gray-500">Generate progress assessment</div>
                          </div>
                        </button>
                        <button className="flex flex-col items-center space-y-2 p-3 rounded-lg hover:bg-gray-50 transition-colors text-center">
                          <div className="w-10 h-10 bg-emerald-600 rounded-lg flex items-center justify-center">
                            <Calendar className="w-5 h-5 text-white" />
                          </div>
                          <div>
                            <div className="font-medium text-gray-900 text-xs">Schedule Session</div>
                            <div className="text-xs text-gray-500">Book therapy session</div>
                          </div>
                        </button>
                        <button className="flex flex-col items-center space-y-2 p-3 rounded-lg hover:bg-gray-50 transition-colors text-center">
                          <div className="w-10 h-10 bg-orange-600 rounded-lg flex items-center justify-center">
                            <Users className="w-5 h-5 text-white" />
                          </div>
                          <div>
                            <div className="font-medium text-gray-900 text-xs">Manage Students</div>
                            <div className="text-xs text-gray-500">View and edit student profiles</div>
                          </div>
                        </button>
                        <button className="flex flex-col items-center space-y-2 p-3 rounded-lg hover:bg-gray-50 transition-colors text-center">
                          <div className="w-10 h-10 bg-indigo-600 rounded-lg flex items-center justify-center">
                            <FileText className="w-5 h-5 text-white" />
                          </div>
                          <div>
                            <div className="font-medium text-gray-900 text-xs">Generate Report</div>
                            <div className="text-xs text-gray-500">Create comprehensive reports</div>
                          </div>
                        </button>
                      </div>
                    </div>
                  </NavigationMenuContent>
                </NavigationMenuItem>
              </NavigationMenuList>
            </NavigationMenu>
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
