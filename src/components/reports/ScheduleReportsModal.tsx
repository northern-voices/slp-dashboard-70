
import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import ReportConfigurationStep from './ReportConfigurationStep';
import SchedulingStep from './SchedulingStep';
import DataFilteringStep from './DataFilteringStep';
import RecipientsStep from './RecipientsStep';
import ReviewStep from './ReviewStep';

interface ScheduleReportsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export interface ScheduleReportData {
  reportType: string;
  reportName: string;
  description: string;
  frequency: string;
  dayOfWeek?: number;
  timeOfDay: string;
  startDate: string;
  endDate?: string;
  schools: string[];
  grades: string[];
  screeningTypes: string[];
  recipients: { email: string; name: string; role: string }[];
  deliveryMethod: string;
  customMessage: string;
}

const ScheduleReportsModal = ({ open, onOpenChange }: ScheduleReportsModalProps) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<ScheduleReportData>({
    reportType: '',
    reportName: '',
    description: '',
    frequency: 'monthly',
    timeOfDay: '09:00',
    startDate: '',
    schools: [],
    grades: [],
    screeningTypes: [],
    recipients: [],
    deliveryMethod: 'email',
    customMessage: ''
  });

  const steps = [
    { title: 'Report Configuration', component: ReportConfigurationStep },
    { title: 'Scheduling', component: SchedulingStep },
    { title: 'Data Filtering', component: DataFilteringStep },
    { title: 'Recipients', component: RecipientsStep },
    { title: 'Review & Activate', component: ReviewStep }
  ];

  const updateFormData = (updates: Partial<ScheduleReportData>) => {
    setFormData(prev => ({ ...prev, ...updates }));
  };

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = () => {
    console.log('Creating scheduled report:', formData);
    // Here you would typically save to database
    onOpenChange(false);
    setCurrentStep(0);
  };

  const CurrentStepComponent = steps[currentStep].component;
  const progress = ((currentStep + 1) / steps.length) * 100;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">
            Schedule Automated Report
          </DialogTitle>
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm text-gray-600">
              <span>Step {currentStep + 1} of {steps.length}: {steps[currentStep].title}</span>
              <span>{Math.round(progress)}% Complete</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        </DialogHeader>

        <div className="py-6">
          <CurrentStepComponent
            formData={formData}
            updateFormData={updateFormData}
          />
        </div>

        <div className="flex items-center justify-between pt-6 border-t">
          <Button
            variant="outline"
            onClick={handlePrevious}
            disabled={currentStep === 0}
          >
            <ChevronLeft className="w-4 h-4 mr-2" />
            Previous
          </Button>

          <div className="flex space-x-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            
            {currentStep === steps.length - 1 ? (
              <Button onClick={handleSubmit}>
                Create Schedule
              </Button>
            ) : (
              <Button onClick={handleNext}>
                Next
                <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ScheduleReportsModal;
