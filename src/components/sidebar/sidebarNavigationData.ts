
import { 
  Home, 
  BarChart3,
  Building2,
  GraduationCap,
  HandHeart,
  Stethoscope
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
      title: "Screenings",
      url: "/screenings",
      icon: Stethoscope,
      isActive: location.pathname === "/screenings"
    },
    {
      title: "Reports",
      url: "/reports",
      icon: BarChart3,
      isActive: location.pathname === "/reports"
    },
    {
      title: "School Support",
      url: "/school-support",
      icon: HandHeart,
      isActive: location.pathname.startsWith("/school-support")
    },
    {
      title: "Management",
      url: "/management",
      icon: Building2,
      isActive: location.pathname === "/management"
    }
  ];

  const groups: NavigationGroup[] = [
    {
      label: "Main Menu",
      items: mainItems
    }
  ];

  return groups;
};
