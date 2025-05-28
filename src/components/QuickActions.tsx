
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Mic, Volume2, BarChart3, Users, FileText, Settings, TrendingUp } from 'lucide-react';
import ScreeningForm from '@/components/screening/ScreeningForm';
import { ScreeningFormData } from '@/types/screening';
import { useToast } from '@/hooks/use-toast';

const QuickActions = () => {
  const [showScreeningForm, setShowScreeningForm] = useState(false);
  const [screeningType, setScreeningType] = useState<'speech' | 'hearing' | 'progress'>('speech');
  const { toast } = useToast();

  const handleOpenSpeechScreening = () => {
    setScreeningType('speech');
    setShowScreeningForm(true);
  };

  const handleOpenHearingScreening = () => {
    setScreeningType('hearing');
    setShowScreeningForm(true);
  };

  const handleScreeningSubmit = (screeningData: ScreeningFormData) => {
    console.log('Screening submitted:', screeningData);
    
    toast({
      title: "Screening completed",
      description: screeningData.student_info 
        ? `New student ${screeningData.student_info.first_name} ${screeningData.student_info.last_name} and screening have been recorded.`
        : "Screening has been recorded successfully.",
    });

    setShowScreeningForm(false);
  };

  const getScreeningTitle = () => {
    switch (screeningType) {
      case 'speech':
        return 'New Speech Screening';
      case 'hearing':
        return 'New Hearing Screening';
      case 'progress':
        return 'New Progress Review';
      default:
        return 'New Screening';
    }
  };

  const quickScreenings = [
    {
      title: 'New Speech Screening',
      description: 'Start a new speech assessment',
      icon: Mic,
      color: 'bg-blue-600 hover:bg-blue-700',
      action: handleOpenSpeechScreening
    },
    {
      title: 'New Hearing Screening',
      description: 'Conduct hearing assessment',
      icon: Volume2,
      color: 'bg-teal-600 hover:bg-teal-700',
      action: handleOpenHearingScreening
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
      title: 'View Analytics',
      description: 'Review screening trends',
      icon: TrendingUp,
      color: 'bg-emerald-600 hover:bg-emerald-700',
      action: () => console.log('View Analytics')
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
    <>
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
                    <div className="text-center space-y-1 flex-1">
                      <div className="font-semibold text-gray-900 text-sm leading-tight">{action.title}</div>
                      <div className="text-xs text-gray-500 leading-relaxed">{action.description}</div>
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
              <p className="text-sm text-gray-600">Manage students, reports, and analytics</p>
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
                    <div className="text-center space-y-0.5 flex-1">
                      <div className="font-medium text-gray-900 text-xs leading-tight">{action.title}</div>
                      <div className="text-xs text-gray-500 leading-relaxed hidden sm:block">{action.description}</div>
                    </div>
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Screening Form Modal */}
      <ScreeningForm
        isOpen={showScreeningForm}
        onClose={() => setShowScreeningForm(false)}
        onSubmit={handleScreeningSubmit}
        formType={screeningType}
        title={getScreeningTitle()}
      />
    </>
  );
};

export default QuickActions;
