
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Mic, Volume2, BarChart3, FileText, Settings } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import ScreeningForm from '@/components/screening/ScreeningForm';
import GenerateReportModal from '@/components/reports/GenerateReportModal';
import { ScreeningFormData } from '@/types/screening';
import { useToast } from '@/hooks/use-toast';

const QuickActions = () => {
  const navigate = useNavigate();
  const [showScreeningForm, setShowScreeningForm] = useState(false);
  const [showGenerateReportModal, setShowGenerateReportModal] = useState(false);
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

  const allActions = [
    {
      title: 'New Speech Screening',
      description: 'Start a new speech assessment',
      icon: Mic,
      color: 'bg-brand hover:bg-brand/90',
      action: handleOpenSpeechScreening
    },
    {
      title: 'New Hearing Screening',
      description: 'Conduct hearing assessment',
      icon: Volume2,
      color: 'bg-teal-600 hover:bg-teal-700',
      action: handleOpenHearingScreening
    },
    {
      title: 'Progress Report',
      description: 'Generate progress assessment',
      icon: BarChart3,
      color: 'bg-purple-600 hover:bg-purple-700',
      action: () => console.log('Progress Report')
    },
    {
      title: 'Generate Report',
      description: 'Create comprehensive reports',
      icon: FileText,
      color: 'bg-indigo-600 hover:bg-indigo-700',
      action: () => setShowGenerateReportModal(true)
    }
  ];

  return (
    <>
      {/* Quick Actions Section */}
      <Card className="bg-white border-gray-100 shadow-sm">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center space-x-2 text-lg font-semibold text-gray-900">
            <div className="w-6 h-6 bg-blue-50 rounded-md flex items-center justify-center">
              <Mic className="w-4 h-4 text-brand" />
            </div>
            <span>Quick Actions</span>
          </CardTitle>
          <CardDescription>Start new assessments and manage reports</CardDescription>
        </CardHeader>
        <CardContent className="pt-0">
          {/* Responsive Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {allActions.map((action, index) => (
              <div
                key={index}
                className="group bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-all duration-200 cursor-pointer"
                onClick={action.action}
              >
                <div className="flex flex-col items-center text-center space-y-3">
                  <div className={`w-12 h-12 rounded-lg ${action.color} flex items-center justify-center transition-colors duration-200`}>
                    <action.icon className="w-6 h-6 text-white" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="font-semibold text-gray-900 text-sm leading-tight">
                      {action.title}
                    </h3>
                    <p className="text-xs text-gray-500 leading-relaxed">
                      {action.description}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Screening Form Modal */}
      <ScreeningForm
        isOpen={showScreeningForm}
        onClose={() => setShowScreeningForm(false)}
        onSubmit={handleScreeningSubmit}
        formType={screeningType}
        title={getScreeningTitle()}
      />

      {/* Generate Report Modal */}
      <GenerateReportModal
        isOpen={showGenerateReportModal}
        onClose={() => setShowGenerateReportModal(false)}
      />
    </>
  );
};

export default QuickActions;
