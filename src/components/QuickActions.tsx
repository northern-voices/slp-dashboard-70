
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
      color: 'bg-blue-500 hover:bg-blue-600',
      action: () => console.log('New Speech Screening')
    },
    {
      title: 'New Hearing Screening', 
      description: 'Conduct hearing assessment',
      icon: Volume2,
      color: 'bg-teal-500 hover:bg-teal-600',
      action: () => console.log('New Hearing Screening')
    },
    {
      title: 'Progress Report',
      description: 'Generate progress assessment',
      icon: BarChart3,
      color: 'bg-purple-500 hover:bg-purple-600',
      action: () => console.log('Progress Report')
    },
    {
      title: 'Manage Students',
      description: 'View and edit student profiles',
      icon: Users,
      color: 'bg-green-500 hover:bg-green-600',
      action: () => console.log('Manage Students')
    }
  ];

  return (
    <Card className="mb-8">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Plus className="w-5 h-5 text-blue-600" />
          <span>Quick Actions</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {actions.map((action, index) => (
            <Button
              key={index}
              variant="outline"
              className="h-auto p-4 flex flex-col items-center space-y-3 hover:shadow-md transition-all duration-200"
              onClick={action.action}
            >
              <div className={`w-12 h-12 rounded-lg ${action.color} flex items-center justify-center transition-colors`}>
                <action.icon className="w-6 h-6 text-white" />
              </div>
              <div className="text-center">
                <div className="font-medium text-gray-900">{action.title}</div>
                <div className="text-sm text-gray-500 mt-1">{action.description}</div>
              </div>
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default QuickActions;
