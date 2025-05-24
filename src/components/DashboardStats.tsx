
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, FileText, Clock, TrendingUp, ArrowUp, ArrowDown, Minus } from 'lucide-react';

const DashboardStats = () => {
  const stats = [
    {
      title: 'Active Students',
      value: '247',
      change: '+12 this month',
      percentage: '+5.1%',
      icon: Users,
      trend: 'up',
      color: 'text-blue-600',
      bgColor: 'bg-blue-50'
    },
    {
      title: 'Recent Screenings',
      value: '18',
      change: 'Last 7 days',
      percentage: '+12.5%',
      icon: FileText,
      trend: 'up',
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-50'
    },
    {
      title: 'Pending Reports',
      value: '5',
      change: 'Awaiting review',
      percentage: '-2.3%',
      icon: Clock,
      trend: 'down',
      color: 'text-amber-600',
      bgColor: 'bg-amber-50'
    },
    {
      title: 'Completion Rate',
      value: '94%',
      change: '+2% from last month',
      percentage: '+2.1%',
      icon: TrendingUp,
      trend: 'up',
      color: 'text-purple-600',
      bgColor: 'bg-purple-50'
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

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
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
  );
};

export default DashboardStats;
