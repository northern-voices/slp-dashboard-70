
import React from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useLocation, Link } from 'react-router-dom';
import { getNavigationGroups } from '@/components/sidebar/sidebarNavigationData';
import { cn } from '@/lib/utils';

interface MobileNavMenuProps {
  isOpen: boolean;
  onClose: () => void;
  userRole?: 'admin' | 'slp' | 'supervisor';
  userName?: string;
  userProfile?: any;
}

const MobileNavMenu = ({
  isOpen,
  onClose,
  userRole = 'slp',
  userName = 'Dr. Sarah Johnson',
  userProfile
}: MobileNavMenuProps) => {
  const location = useLocation();
  const navigationGroups = getNavigationGroups(location, userRole, userProfile);
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
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent side="left" className="w-80 p-0 bg-white">
        <div className="flex flex-col h-full">
          {/* Header with user info */}
          <SheetHeader className="p-6 border-b border-gray-100">
            <div className="flex items-center gap-3">
              <Avatar className="h-10 w-10">
                <AvatarFallback className="bg-gray-100 text-gray-700 text-sm font-medium">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col items-start">
                <SheetTitle className="text-sm font-medium text-gray-900">{userName}</SheetTitle>
                <p className="text-xs text-gray-500">{getRoleDisplayName(userRole)}</p>
              </div>
            </div>
          </SheetHeader>

          {/* Navigation Menu */}
          <div className="flex-1 overflow-y-auto p-4">
            <nav className="space-y-6">
              {navigationGroups.map((group) => (
                <div key={group.label} className="space-y-3">
                  <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider px-2">
                    {group.label}
                  </h3>
                  <div className="space-y-1">
                    {group.items.map((item) => (
                      <Link
                        key={item.title}
                        to={item.url}
                        onClick={onClose}
                        className={cn(
                          "flex items-center space-x-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 min-h-[44px]",
                          item.isActive
                            ? "bg-blue-50 text-blue-700 shadow-sm"
                            : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                        )}
                      >
                        <item.icon className={cn(
                          "w-5 h-5",
                          item.isActive ? "text-blue-600" : "text-gray-400"
                        )} />
                        <span>{item.title}</span>
                      </Link>
                    ))}
                  </div>
                </div>
              ))}
            </nav>
          </div>

          {/* Footer with quick actions */}
          <div className="p-4 border-t border-gray-100 space-y-2">
            <Link
              to="/profile"
              onClick={onClose}
              className="flex items-center space-x-3 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 min-h-[44px]"
            >
              <Avatar className="h-5 w-5">
                <AvatarFallback className="bg-gray-100 text-gray-700 text-xs">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <span>Profile & Settings</span>
            </Link>
            <button className="flex items-center space-x-3 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 w-full text-left min-h-[44px]">
              <span className="w-5 h-5 text-center">⏻</span>
              <span>Log out</span>
            </button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default MobileNavMenu;
