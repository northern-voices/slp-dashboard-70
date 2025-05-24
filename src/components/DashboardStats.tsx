
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
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
      {stats.map((stat, index) => (
        <Card key={index} className="bg-white border-gray-100 shadow-sm hover:shadow-md transition-all duration-200 hover:-translate-y-0.5">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-sm font-medium text-gray-600 tracking-wide uppercase">
              {stat.title}
            </CardTitle>
            <div className="w-10 h-10 bg-slate-50 rounded-lg flex items-center justify-center">
              <stat.icon className="h-5 w-5 text-slate-600" />
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="text-3xl font-bold text-gray-900 mb-2 tracking-tight">{stat.value}</div>
            <p className={`text-sm font-medium ${
              stat.trend === 'up' ? 'text-emerald-600' : 
              stat.trend === 'down' ? 'text-red-500' : 
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
