
import React from 'react';
import { Home, Users, BarChart3, Calendar, Building2 } from 'lucide-react';
import { useLocation, Link } from 'react-router-dom';
import { cn } from '@/lib/utils';

const BottomNavigation = () => {
  const location = useLocation();

  const navItems = [
    {
      title: "Dashboard",
      url: "/",
      icon: Home,
      isActive: location.pathname === "/"
    },
    {
      title: "Students",
      url: "/students",
      icon: Users,
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

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 px-4 py-2 md:hidden">
      <div className="flex items-center justify-around">
        {navItems.map((item) => (
          <Link
            key={item.title}
            to={item.url}
            className={cn(
              "flex flex-col items-center justify-center px-2 py-1 rounded-lg transition-colors min-h-[44px] min-w-[44px]",
              item.isActive
                ? "text-blue-600 bg-blue-50"
                : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
            )}
          >
            <item.icon className="w-5 h-5" />
            <span className="text-xs mt-1 font-medium">{item.title}</span>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default BottomNavigation;
