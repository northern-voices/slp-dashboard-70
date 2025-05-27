
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
  Settings,
  BarChart3,
  Calendar,
  Building2,
  GraduationCap
} from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useOrganization } from '@/contexts/OrganizationContext';
import { useLocation } from 'react-router-dom';
import SchoolSelector from '@/components/SchoolSelector';

interface AppSidebarProps {
  userRole?: 'admin' | 'slp' | 'supervisor';
  userName?: string;
}

const AppSidebar = ({ userRole = 'slp', userName = 'Dr. Sarah Johnson' }: AppSidebarProps) => {
  const { currentOrganization, userProfile } = useOrganization();
  const location = useLocation();
  const initials = userName.split(' ').map(n => n[0]).join('');

  const mainItems = [
    {
      title: "Dashboard",
      url: "/",
      icon: Home,
      isActive: location.pathname === "/"
    },
    {
      title: "Students",
      url: "/students",
      icon: GraduationCap,
      isActive: location.pathname.startsWith("/students")
    },
    {
      title: "Reports",
      url: "/reports",
      icon: BarChart3,
      isActive: location.pathname === "/reports"
    },
    {
      title: "Calendar",
      url: "/calendar",
      icon: Calendar,
      isActive: location.pathname === "/calendar"
    },
    {
      title: "Management",
      url: "/management",
      icon: Building2,
      isActive: location.pathname === "/management"
    }
  ];

  const managementItems = [
    {
      title: "Users",
      url: "/users",
      icon: Users,
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
    <div className="hidden md:block">
      <Sidebar>
        <SidebarHeader className="border-b border-gray-100 p-4">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center shadow-sm">
              <span className="text-white font-bold text-sm">SLP</span>
            </div>
            <div className="flex flex-col min-w-0">
              <span className="font-semibold text-gray-900 text-sm truncate">
                {currentOrganization?.name || 'SLP Dashboard'}
              </span>
              <span className="text-xs text-gray-500">Speech & Language</span>
            </div>
          </div>
          
          {/* School Selector */}
          <div className="space-y-2">
            <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">
              Current School
            </span>
            <SchoolSelector />
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
                      className="w-full justify-start hover:bg-gray-100 hover:text-gray-400 data-[active=true]:bg-blue-50 data-[active=true]:text-blue-700 data-[active=true]:font-medium"
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

          {(userRole === 'admin' || userRole === 'supervisor' || userProfile?.role === 'admin' || userProfile?.role === 'supervisor') && (
            <SidebarGroup>
              <SidebarGroupLabel className="px-2 text-xs font-medium text-gray-500 uppercase tracking-wider">
                Administration
              </SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {managementItems.map((item) => (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton 
                        asChild
                        className="w-full justify-start hover:bg-gray-100 hover:text-gray-400"
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

          {userRole === 'admin' && (
            <SidebarGroup>
              <SidebarGroupLabel className="px-2 text-xs font-medium text-gray-500 uppercase tracking-wider">
                System
              </SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {adminItems.map((item) => (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton 
                        asChild
                        className="w-full justify-start hover:bg-gray-100 hover:text-gray-400"
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
              <span className="text-sm font-medium text-gray-900 truncate">
                {userProfile ? `${userProfile.first_name} ${userProfile.last_name}` : userName}
              </span>
              <span className="text-xs text-gray-500">
                {userProfile?.role === 'admin' ? 'Administrator' : userProfile?.role === 'supervisor' ? 'Supervisor' : 'Speech-Language Pathologist'}
              </span>
            </div>
          </div>
        </SidebarFooter>
      </Sidebar>
    </div>
  );
};

export default AppSidebar;
