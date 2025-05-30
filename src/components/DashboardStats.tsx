
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText, ArrowUp, ArrowDown, Minus, GraduationCap } from 'lucide-react';
import { useOrganization } from '@/contexts/OrganizationContext';
import { supabaseService } from '@/services/supabaseService';

interface DashboardData {
  totalStudents: number;
  totalScreenings: number;
  totalReports: number;
  totalSchools: number;
}

const DashboardStats = () => {
  const { currentSchool, isLoading: contextLoading } = useOrganization();
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardStats = async () => {
      try {
        setIsLoading(true);
        const stats = await supabaseService.getDashboardStats();
        setDashboardData(stats);
      } catch (error) {
        console.error('Error fetching dashboard stats:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (!contextLoading) {
      fetchDashboardStats();
    }
  }, [contextLoading]);

  const stats = [
    {
      title: 'Active Students',
      value: dashboardData ? dashboardData.totalStudents.toString() : '0',
      change: currentSchool ? `at ${currentSchool.name}` : 'across all schools',
      percentage: '+5.1%',
      icon: GraduationCap,
      trend: 'up',
      color: 'text-blue-600',
      bgColor: 'bg-blue-50'
    },
    {
      title: 'Recent Screenings',
      value: dashboardData ? dashboardData.totalScreenings.toString() : '0',
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

  if (isLoading || contextLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
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
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
      {stats.map((stat, index) => (
        <Card key={index} className="bg-white border-gray-100 shadow-sm hover:bg-gray-50 transition-colors duration-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 tracking-wide">
              {stat.title}
            </CardTitle>
            <div className={`w-10 h-10 ${stat.bgColor} rounded-lg flex items-center justify-center transition-colors duration-200`}>
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
  );
};

export default DashboardStats;
