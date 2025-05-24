
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, FileText, Clock, TrendingUp } from 'lucide-react';

const DashboardStats = () => {
  const stats = [
    {
      title: 'Active Students',
      value: '247',
      change: '+12 this month',
      icon: Users,
      trend: 'up'
    },
    {
      title: 'Recent Screenings',
      value: '18',
      change: 'Last 7 days',
      icon: FileText,
      trend: 'neutral'
    },
    {
      title: 'Pending Reports',
      value: '5',
      change: 'Awaiting review',
      icon: Clock,
      trend: 'neutral'
    },
    {
      title: 'Completion Rate',
      value: '94%',
      change: '+2% from last month',
      icon: TrendingUp,
      trend: 'up'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {stats.map((stat, index) => (
        <Card key={index} className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              {stat.title}
            </CardTitle>
            <stat.icon className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
            <p className={`text-xs mt-1 ${
              stat.trend === 'up' ? 'text-green-600' : 
              stat.trend === 'down' ? 'text-red-600' : 
              'text-gray-500'
            }`}>
              {stat.change}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default DashboardStats;
