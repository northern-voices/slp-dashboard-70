
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Mic, Volume2, BarChart3, FileText, Settings } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import SpeechScreeningModal from '@/components/screening/speech/SpeechScreeningModal';
import HearingScreeningModal from '@/components/screening/hearing/HearingScreeningModal';
import GenerateReportModal from '@/components/reports/GenerateReportModal';
import { ScreeningFormData } from '@/types/screening';
import { useToast } from '@/hooks/use-toast';

const QuickActions = () => {
  const navigate = useNavigate();
  const [showSpeechScreeningModal, setShowSpeechScreeningModal] = useState(false);
  const [showHearingScreeningModal, setShowHearingScreeningModal] = useState(false);
  const [showGenerateReportModal, setShowGenerateReportModal] = useState(false);
  const { toast } = useToast();

  const handleOpenSpeechScreening = () => {
    setShowSpeechScreeningModal(true);
  };

  const handleOpenHearingScreening = () => {
    setShowHearingScreeningModal(true);
  };

  const handleSpeechScreeningSubmit = (screeningData: ScreeningFormData) => {
    console.log('Speech screening submitted:', screeningData);
    
    toast({
      title: "Speech Screening completed",
      description: screeningData.student_info 
        ? `New student ${screeningData.student_info.first_name} ${screeningData.student_info.last_name} and screening have been recorded.`
        : "Speech screening has been recorded successfully.",
    });

    setShowSpeechScreeningModal(false);
  };

  const handleHearingScreeningSubmit = (screeningData: ScreeningFormData) => {
    console.log('Hearing screening submitted:', screeningData);
    
    toast({
      title: "Hearing Screening completed",
      description: screeningData.student_info 
        ? `New student ${screeningData.student_info.first_name} ${screeningData.student_info.last_name} and screening have been recorded.`
        : "Hearing screening has been recorded successfully.",
    });

    setShowHearingScreeningModal(false);
  };

  const allActions = [
    {
      title: 'Speech Screening',
      description: 'Start a new speech assessment',
      icon: Mic,
      color: 'bg-brand hover:bg-brand/90',
      action: handleOpenSpeechScreening
    },
    {
      title: 'Hearing Screening',
      description: 'Conduct hearing assessment',
      icon: Volume2,
      color: 'bg-teal-600 hover:bg-teal-700',
      action: handleOpenHearingScreening
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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
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

      {/* Speech Screening Modal */}
      <SpeechScreeningModal
        isOpen={showSpeechScreeningModal}
        onClose={() => setShowSpeechScreeningModal(false)}
        onSubmit={handleSpeechScreeningSubmit}
        title="New Speech Screening"
      />

      {/* Hearing Screening Modal */}
      <HearingScreeningModal
        isOpen={showHearingScreeningModal}
        onClose={() => setShowHearingScreeningModal(false)}
        onSubmit={handleHearingScreeningSubmit}
        title="New Hearing Screening"
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
