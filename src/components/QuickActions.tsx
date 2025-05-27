import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Users, FileText, Settings, Mic, Volume2, BarChart3, Calendar } from 'lucide-react';
const QuickActions = () => {
  const primaryActions = [{
    title: 'New Speech Screening',
    description: 'Start a new speech assessment',
    icon: Mic,
    color: 'bg-blue-600 hover:bg-blue-700',
    action: () => console.log('New Speech Screening')
  }, {
    title: 'New Hearing Screening',
    description: 'Conduct hearing assessment',
    icon: Volume2,
    color: 'bg-teal-600 hover:bg-teal-700',
    action: () => console.log('New Hearing Screening')
  }];
  const secondaryActions = [{
    title: 'Progress Report',
    description: 'Generate progress assessment',
    icon: BarChart3,
    color: 'bg-purple-600 hover:bg-purple-700',
    action: () => console.log('Progress Report')
  }, {
    title: 'Schedule Session',
    description: 'Book therapy session',
    icon: Calendar,
    color: 'bg-emerald-600 hover:bg-emerald-700',
    action: () => console.log('Schedule Session')
  }, {
    title: 'Manage Students',
    description: 'View and edit student profiles',
    icon: Users,
    color: 'bg-orange-600 hover:bg-orange-700',
    action: () => console.log('Manage Students')
  }, {
    title: 'Generate Report',
    description: 'Create comprehensive reports',
    icon: FileText,
    color: 'bg-indigo-600 hover:bg-indigo-700',
    action: () => console.log('Generate Report')
  }];
  return <div className="mb-8 space-y-6">
      {/* Primary Actions */}
      

      {/* Secondary Actions */}
      <Card className="bg-white border-gray-100 shadow-sm">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center space-x-3 text-lg font-semibold text-gray-900">
            <div className="w-7 h-7 bg-gray-50 rounded-lg flex items-center justify-center">
              <Settings className="w-4 h-4 text-gray-600" />
            </div>
            <span>Management Tools</span>
          </CardTitle>
          <p className="text-sm text-gray-600 ml-10">Manage students, reports, and scheduling</p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {secondaryActions.map((action, index) => <Button key={index} variant="outline" className="h-auto p-4 flex flex-col items-center space-y-3 hover:shadow-md transition-all duration-200 hover:-translate-y-0.5 border-gray-200 bg-white hover:bg-gray-50 group" onClick={action.action}>
                <div className={`w-12 h-12 rounded-lg ${action.color} flex items-center justify-center transition-all duration-200 shadow-sm group-hover:shadow-md`}>
                  <action.icon className="w-6 h-6 text-white" />
                </div>
                <div className="text-center">
                  <div className="font-semibold text-gray-900 mb-1 text-sm">{action.title}</div>
                  <div className="text-xs text-gray-500 leading-relaxed">{action.description}</div>
                </div>
              </Button>)}
          </div>
        </CardContent>
      </Card>
    </div>;
};
export default QuickActions;