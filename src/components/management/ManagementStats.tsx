
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Building2, Users, FileText, Activity } from 'lucide-react';

const ManagementStats = () => {
  const stats = [
    {
      title: "Total Schools",
      value: "8",
      change: "+2 this month",
      icon: Building2,
      color: "text-blue-600"
    },
    {
      title: "Active SLPs",
      value: "24",
      change: "+3 this quarter",
      icon: Users,
      color: "text-green-600"
    },
    {
      title: "Screenings This Month",
      value: "156",
      change: "+12% from last month",
      icon: FileText,
      color: "text-purple-600"
    },
    {
      title: "System Activity",
      value: "98%",
      change: "Uptime this month",
      icon: Activity,
      color: "text-orange-600"
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      {stats.map((stat) => (
        <Card key={stat.title}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              {stat.title}
            </CardTitle>
            <stat.icon className={`h-4 w-4 ${stat.color}`} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
            <p className="text-xs text-gray-500 mt-1">{stat.change}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default ManagementStats;
