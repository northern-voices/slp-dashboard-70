
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText, ArrowUp, ArrowDown, Minus, GraduationCap } from 'lucide-react';
import { useOrganization } from '@/contexts/OrganizationContext';

const DashboardStats = () => {
  const { currentSchool, currentOrganization, isLoading } = useOrganization();

  // Mock data - replace with actual data fetching based on currentSchool
  const stats = [
    {
      title: 'Active Students',
      value: currentSchool ? '89' : '247',
      change: currentSchool ? `at ${currentSchool.name}` : 'across all schools',
      percentage: '+5.1%',
      icon: GraduationCap,
      trend: 'up',
      color: 'text-blue-600',
      bgColor: 'bg-blue-50'
    },
    {
      title: 'Recent Screenings',
      value: currentSchool ? '6' : '18',
      change: 'Last 7 days',
      percentage: '+12.5%',
      icon: FileText,
      trend: 'up',
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-50'
    }
  ];

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up':
        return <ArrowUp className="w-3 h-3" />;
      case 'down':
        return <ArrowDown className="w-3 h-3" />;
      default:
        return <Minus className="w-3 h-3" />;
    }
  };

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case 'up':
        return 'text-emerald-600 bg-emerald-50';
      case 'down':
        return 'text-red-600 bg-red-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4 mb-8">
        {/* Context Banner Loading State */}
        <div className="bg-blue-50 border border-blue-100 rounded-lg p-3">
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-blue-200 rounded animate-pulse"></div>
            <div className="space-y-1">
              <div className="h-4 bg-blue-200 rounded w-32 animate-pulse"></div>
              <div className="h-3 bg-blue-200 rounded w-48 animate-pulse"></div>
            </div>
          </div>
        </div>
        
        {/* Stats Loading State */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[1, 2].map((i) => (
            <Card key={i} className="bg-white border-gray-100 shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div className="h-4 bg-gray-200 rounded w-24 animate-pulse"></div>
                <div className="w-10 h-10 bg-gray-100 rounded-lg animate-pulse"></div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-2">
                  <div className="h-8 bg-gray-200 rounded w-16 animate-pulse"></div>
                  <div className="flex items-center justify-between">
                    <div className="h-4 bg-gray-200 rounded w-20 animate-pulse"></div>
                    <div className="h-6 bg-gray-200 rounded w-12 animate-pulse"></div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 mb-8">
      {/* Context Banner - Moved to top and made smaller */}
      {currentSchool && (
        <div className="bg-blue-50 border border-blue-100 rounded-lg p-3">
          <div className="flex items-center space-x-2">
            <GraduationCap className="w-4 h-4 text-blue-600 flex-shrink-0" />
            <div className="min-w-0">
              <h3 className="font-medium text-blue-900 text-sm truncate">
                Viewing data for {currentSchool.name}
              </h3>
              <p className="text-xs text-blue-700 truncate">
                {currentOrganization?.name} • Switch schools using the sidebar
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {stats.map((stat, index) => (
          <Card key={index} className="bg-white border-gray-100 shadow-sm hover:shadow-md transition-all duration-200 hover:-translate-y-0.5 group">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 tracking-wide">
                {stat.title}
              </CardTitle>
              <div className={`w-10 h-10 ${stat.bgColor} rounded-lg flex items-center justify-center group-hover:scale-105 transition-transform duration-200`}>
                <stat.icon className={`h-5 w-5 ${stat.color}`} />
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-2">
                <div className="text-2xl lg:text-3xl font-bold text-gray-900 tracking-tight">
                  {stat.value}
                </div>
                <div className="flex items-center justify-between">
                  <p className="text-sm text-gray-500 font-medium">
                    {stat.change}
                  </p>
                  <div className={`flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${getTrendColor(stat.trend)}`}>
                    {getTrendIcon(stat.trend)}
                    <span>{stat.percentage}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default DashboardStats;
