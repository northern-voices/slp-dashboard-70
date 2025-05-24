
import React from 'react';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar';
import { 
  Home, 
  Users, 
  FileText, 
  Settings,
  BarChart3,
  Calendar,
  User
} from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

interface AppSidebarProps {
  userRole?: 'admin' | 'slp';
  userName?: string;
}

const AppSidebar = ({ userRole = 'slp', userName = 'Dr. Sarah Johnson' }: AppSidebarProps) => {
  const initials = userName.split(' ').map(n => n[0]).join('');

  const mainItems = [
    {
      title: "Dashboard",
      url: "/",
      icon: Home,
      isActive: true
    },
    {
      title: "Students",
      url: "/students",
      icon: Users,
    },
    {
      title: "Reports",
      url: "/reports",
      icon: FileText,
    },
    {
      title: "Analytics",
      url: "/analytics",
      icon: BarChart3,
    },
    {
      title: "Calendar",
      url: "/calendar",
      icon: Calendar,
    }
  ];

  const adminItems = [
    {
      title: "Admin Panel",
      url: "/admin",
      icon: Settings,
    }
  ];

  return (
    <Sidebar>
      <SidebarHeader className="border-b border-gray-100 p-4">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center shadow-sm">
            <span className="text-white font-bold text-sm">SLP</span>
          </div>
          <div className="flex flex-col">
            <span className="font-semibold text-gray-900 text-sm">Dashboard</span>
            <span className="text-xs text-gray-500">Speech & Language</span>
          </div>
        </div>
      </SidebarHeader>
      
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="px-2 text-xs font-medium text-gray-500 uppercase tracking-wider">
            Main Menu
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton 
                    asChild 
                    isActive={item.isActive}
                    className="w-full justify-start hover:bg-blue-50 hover:text-blue-700 data-[active=true]:bg-blue-50 data-[active=true]:text-blue-700 data-[active=true]:font-medium"
                  >
                    <a href={item.url} className="flex items-center space-x-3 px-3 py-2">
                      <item.icon className="w-4 h-4" />
                      <span>{item.title}</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {userRole === 'admin' && (
          <SidebarGroup>
            <SidebarGroupLabel className="px-2 text-xs font-medium text-gray-500 uppercase tracking-wider">
              Administration
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {adminItems.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton 
                      asChild
                      className="w-full justify-start hover:bg-gray-50 hover:text-gray-900"
                    >
                      <a href={item.url} className="flex items-center space-x-3 px-3 py-2">
                        <item.icon className="w-4 h-4" />
                        <span>{item.title}</span>
                      </a>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
      </SidebarContent>

      <SidebarFooter className="border-t border-gray-100 p-4">
        <div className="flex items-center space-x-3">
          <Avatar className="h-8 w-8">
            <AvatarFallback className="bg-gray-100 text-gray-700 text-xs font-medium">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col min-w-0 flex-1">
            <span className="text-sm font-medium text-gray-900 truncate">{userName}</span>
            <span className="text-xs text-gray-500">
              {userRole === 'admin' ? 'Administrator' : 'Speech-Language Pathologist'}
            </span>
          </div>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
};

export default AppSidebar;
