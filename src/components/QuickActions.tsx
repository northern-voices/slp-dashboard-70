
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Plus, 
  Users, 
  FileText, 
  Settings,
  Mic,
  Volume2,
  BarChart3
} from 'lucide-react';

const QuickActions = () => {
  const actions = [
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
    },
    {
      title: 'Progress Report',
      description: 'Generate progress assessment',
      icon: BarChart3,
      color: 'bg-purple-600 hover:bg-purple-700',
      action: () => console.log('Progress Report')
    },
    {
      title: 'Manage Students',
      description: 'View and edit student profiles',
      icon: Users,
      color: 'bg-emerald-600 hover:bg-emerald-700',
      action: () => console.log('Manage Students')
    }
  ];

  return (
    <Card className="mb-10 bg-white border-gray-100 shadow-sm">
      <CardHeader className="pb-6">
        <CardTitle className="flex items-center space-x-3 text-xl font-semibold text-gray-900">
          <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center">
            <Plus className="w-5 h-5 text-blue-600" />
          </div>
          <span>Quick Actions</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {actions.map((action, index) => (
            <Button
              key={index}
              variant="outline"
              className="h-auto p-6 flex flex-col items-center space-y-4 hover:shadow-md transition-all duration-200 hover:-translate-y-0.5 border-gray-200 bg-white hover:bg-gray-50"
              onClick={action.action}
            >
              <div className={`w-14 h-14 rounded-xl ${action.color} flex items-center justify-center transition-all duration-200 shadow-sm`}>
                <action.icon className="w-7 h-7 text-white" />
              </div>
              <div className="text-center">
                <div className="font-semibold text-gray-900 mb-1">{action.title}</div>
                <div className="text-sm text-gray-500 leading-relaxed">{action.description}</div>
              </div>
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default QuickActions;
