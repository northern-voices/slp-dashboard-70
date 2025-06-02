
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Mic, Volume2, FileText } from 'lucide-react';
import SpeechScreeningModal from '@/components/screening/speech/SpeechScreeningModal';
import HearingScreeningModal from '@/components/screening/hearing/HearingScreeningModal';
import { ScreeningFormData } from '@/types/screening';
import { useToast } from '@/hooks/use-toast';

const QuickActions = () => {
  const [showSpeechScreeningModal, setShowSpeechScreeningModal] = useState(false);
  const [showHearingScreeningModal, setShowHearingScreeningModal] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

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
      action: () => setShowSpeechScreeningModal(true)
    },
    {
      title: 'Hearing Screening',
      description: 'Conduct hearing assessment',
      icon: Volume2,
      color: 'bg-teal-600 hover:bg-teal-700',
      action: () => setShowHearingScreeningModal(true)
    },
    {
      title: 'Generate Report',
      description: 'Create comprehensive reports',
      icon: FileText,
      color: 'bg-indigo-600 hover:bg-indigo-700',
      action: () => navigate('/reports')
    }
  ];

  return (
    <>
      {/* Quick Actions Section */}
      <Card className="bg-white border border-gray-100 shadow-sm rounded-xl">
        <CardHeader className="pb-4">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center">
              <Mic className="w-4 h-4 text-brand" />
            </div>
            <div>
              <CardTitle className="text-lg font-semibold text-gray-900 tracking-tight">
                Quick Actions
              </CardTitle>
              <CardDescription className="text-sm text-gray-600 mt-1">
                Start new assessments and manage reports
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          {/* Responsive Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {allActions.map((action, index) => (
              <Button
                key={index}
                variant="outline"
                className="h-auto p-5 group bg-white border border-gray-200 rounded-xl hover:shadow-md hover:border-gray-300 transition-all duration-200"
                onClick={action.action}
              >
                <div className="flex flex-col items-center text-center space-y-4">
                  <div className={`w-14 h-14 rounded-xl ${action.color} flex items-center justify-center transition-colors duration-200 group-hover:scale-105`}>
                    <action.icon className="w-7 h-7 text-white" />
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
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Modals */}
      <SpeechScreeningModal
        isOpen={showSpeechScreeningModal}
        onClose={() => setShowSpeechScreeningModal(false)}
        onSubmit={handleSpeechScreeningSubmit}
        title="New Speech Screening"
      />

      <HearingScreeningModal
        isOpen={showHearingScreeningModal}
        onClose={() => setShowHearingScreeningModal(false)}
        onSubmit={handleHearingScreeningSubmit}
        title="New Hearing Screening"
      />
    </>
  );
};

export default QuickActions;
