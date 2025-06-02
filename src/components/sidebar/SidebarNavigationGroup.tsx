import React from 'react';
import { SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar';
import { NavigationGroup } from './sidebarNavigationData';
interface SidebarNavigationGroupProps {
  group: NavigationGroup;
}
const SidebarNavigationGroup = ({
  group
}: SidebarNavigationGroupProps) => {
  return <SidebarGroup className="space-y-3">
      <SidebarGroupLabel className="text-xs font-semibold text-gray-400 uppercase tracking-wider px-3">
        {group.label}
      </SidebarGroupLabel>
      <SidebarGroupContent>
        <SidebarMenu className="space-y-1">
          {group.items.map(item => <SidebarMenuItem key={item.title} className="rounded-sm">
              <SidebarMenuButton asChild isActive={item.isActive} className={`
                  w-full justify-start px-3 py-2.5 text-sm font-medium rounded-lg transition-all duration-200
                  hover:bg-gray-50 hover:text-gray-900
                  ${item.isActive ? 'bg-blue-50 text-blue-700 border border-blue-100 shadow-sm' : 'text-gray-600 hover:text-gray-900'}
                `}>
                <a href={item.url} className="flex items-center space-x-3">
                  <item.icon className={`w-4 h-4 ${item.isActive ? 'text-blue-600' : 'text-gray-400'}`} />
                  <span className="truncate">{item.title}</span>
                </a>
              </SidebarMenuButton>
            </SidebarMenuItem>)}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>;
};
export default SidebarNavigationGroup;