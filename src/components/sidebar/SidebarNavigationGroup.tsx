
import React from 'react';
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar';
import { NavigationGroup } from './sidebarNavigationData';

interface SidebarNavigationGroupProps {
  group: NavigationGroup;
}

const SidebarNavigationGroup = ({ group }: SidebarNavigationGroupProps) => {
  return (
    <SidebarGroup>
      <SidebarGroupLabel className="px-2 text-xs font-medium text-gray-500 uppercase tracking-wider">
        {group.label}
      </SidebarGroupLabel>
      <SidebarGroupContent>
        <SidebarMenu>
          {group.items.map((item) => (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton 
                asChild 
                isActive={item.isActive}
                className="w-full justify-start hover:bg-gray-100 data-[active=true]:bg-brand/10 data-[active=true]:text-brand data-[active=true]:font-medium"
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
  );
};

export default SidebarNavigationGroup;
