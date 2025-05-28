
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Mic, Volume2, BarChart3, Calendar, Users, FileText, Settings } from 'lucide-react';

const QuickActions = () => {
  const quickScreenings = [
    {
      title: 'New Speech Screening',
      description: 'Start a new speech assessment',
      icon: Mic,
      color: 'bg-blue-600 hover:bg-blue-700',
      action: () => console.log('New Speech Screening')
    },
    {
      title: 'New Hearing Screening',
      description: 'Conduct hearing assessment',
      icon: Volume2,
      color: 'bg-teal-600 hover:bg-teal-700',
      action: () => console.log('New Hearing Screening')
    }
  ];

  const managementTools = [
    {
      title: 'Progress Report',
      description: 'Generate progress assessment',
      icon: BarChart3,
      color: 'bg-purple-600 hover:bg-purple-700',
      action: () => console.log('Progress Report')
    },
    {
      title: 'Schedule Session',
      description: 'Book therapy session',
      icon: Calendar,
      color: 'bg-emerald-600 hover:bg-emerald-700',
      action: () => console.log('Schedule Session')
    },
    {
      title: 'Manage Students',
      description: 'View and edit student profiles',
      icon: Users,
      color: 'bg-orange-600 hover:bg-orange-700',
      action: () => console.log('Manage Students')
    },
    {
      title: 'Generate Report',
      description: 'Create comprehensive reports',
      icon: FileText,
      color: 'bg-indigo-600 hover:bg-indigo-700',
      action: () => console.log('Generate Report')
    }
  ];

  return (
    <div className="w-full space-y-6">
      {/* Dashboard Sections Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Quick Screenings Section */}
        <Card className="bg-white border-gray-100 shadow-sm">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center space-x-2 text-lg font-semibold text-gray-900">
              <div className="w-6 h-6 bg-blue-50 rounded-md flex items-center justify-center">
                <Mic className="w-4 h-4 text-blue-600" />
              </div>
              <span>Quick Screenings</span>
            </CardTitle>
            <p className="text-sm text-gray-600">Start new assessments and screenings</p>
          </CardHeader>
          <CardContent className="pt-0">
            {/* Responsive Grid for Quick Screenings */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2 gap-4">
              {quickScreenings.map((action, index) => (
                <Button
                  key={index}
                  variant="outline"
                  className="h-auto min-h-[120px] p-4 flex flex-col items-center justify-center space-y-3 hover:shadow-md transition-all duration-200 hover:-translate-y-0.5 border-gray-200 bg-white hover:bg-gray-50 group"
                  onClick={action.action}
                >
                  <div className={`w-12 h-12 rounded-lg ${action.color} flex items-center justify-center transition-all duration-200 shadow-sm group-hover:shadow-md`}>
                    <action.icon className="w-6 h-6 text-white" />
                  </div>
                  <div className="text-center">
                    <div className="font-semibold text-gray-900 text-sm mb-1">{action.title}</div>
                    <div className="text-xs text-gray-500 leading-tight">{action.description}</div>
                  </div>
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Management Tools Section */}
        <Card className="bg-white border-gray-100 shadow-sm">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center space-x-2 text-lg font-semibold text-gray-900">
              <div className="w-6 h-6 bg-gray-50 rounded-md flex items-center justify-center">
                <Settings className="w-4 h-4 text-gray-600" />
              </div>
              <span>Management Tools</span>
            </CardTitle>
            <p className="text-sm text-gray-600">Manage students, reports, and scheduling</p>
          </CardHeader>
          <CardContent className="pt-0">
            {/* Responsive Grid for Management Tools */}
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2 gap-3">
              {managementTools.map((action, index) => (
                <Button
                  key={index}
                  variant="outline"
                  className="h-auto min-h-[100px] p-3 flex flex-col items-center justify-center space-y-2 hover:shadow-md transition-all duration-200 hover:-translate-y-0.5 border-gray-200 bg-white hover:bg-gray-50 group"
                  onClick={action.action}
                >
                  <div className={`w-10 h-10 rounded-md ${action.color} flex items-center justify-center transition-all duration-200 shadow-sm group-hover:shadow-md`}>
                    <action.icon className="w-5 h-5 text-white" />
                  </div>
                  <div className="text-center">
                    <div className="font-medium text-gray-900 text-xs mb-0.5 leading-tight">{action.title}</div>
                    <div className="text-xs text-gray-500 leading-tight hidden sm:block">{action.description}</div>
                  </div>
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default QuickActions;
