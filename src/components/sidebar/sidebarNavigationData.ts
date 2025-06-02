import { 
  Home, 
  Users, 
  Settings,
  BarChart3,
  Building2,
  GraduationCap,
  HandHeart
} from 'lucide-react';
import { Location } from 'react-router-dom';

export interface NavigationItem {
  title: string;
  url: string;
  icon: any;
  isActive?: boolean;
}

export interface NavigationGroup {
  label: string;
  items: NavigationItem[];
}

export const getNavigationGroups = (location: Location, userRole: string, userProfile: any): NavigationGroup[] => {
  const mainItems: NavigationItem[] = [
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
      title: "School Support",
      url: "/school-support",
      icon: HandHeart,
      isActive: location.pathname.startsWith("/school-support")
    },
    {
      title: "Reports",
      url: "/reports",
      icon: BarChart3,
      isActive: location.pathname === "/reports"
    },
    {
      title: userRole === 'slp' ? "Schools" : "Management",
      url: "/management",
      icon: Building2,
      isActive: location.pathname === "/management"
    }
  ];

  const managementItems: NavigationItem[] = [
    {
      title: "Users",
      url: "/users",
      icon: Users,
    }
  ];

  const adminItems: NavigationItem[] = [
    {
      title: "Admin Panel",
      url: "/admin",
      icon: Settings,
    }
  ];

  const groups: NavigationGroup[] = [
    {
      label: "Main Menu",
      items: mainItems
    }
  ];

  // Add management section for admin and supervisor roles only (not SLPs)
  if ((userRole === 'admin' || userRole === 'supervisor' || userProfile?.role === 'admin' || userProfile?.role === 'supervisor') && userRole !== 'slp') {
    groups.push({
      label: "Administration",
      items: managementItems
    });
  }

  // Add system section for admin only
  if (userRole === 'admin') {
    groups.push({
      label: "System",
      items: adminItems
    });
  }

  return groups;
};
