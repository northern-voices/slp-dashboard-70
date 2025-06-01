
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { CheckCircle } from 'lucide-react';
import { Student } from '@/types/database';
import { ScreeningFormData } from '@/types/screening';
import MultiStepHearingScreeningForm from './MultiStepHearingScreeningForm';

interface HearingScreeningModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: ScreeningFormData) => void;
  existingStudent?: Student | null;
  title?: string;
}

const HearingScreeningModal = ({
  isOpen,
  onClose,
  onSubmit,
  existingStudent,
  title = "Hearing Screening"
}: HearingScreeningModalProps) => {
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = (formData: ScreeningFormData) => {
    console.log('Hearing screening submitted:', formData);
    onSubmit(formData);
    setIsSubmitted(true);
    setTimeout(() => {
      setIsSubmitted(false);
      onClose();
    }, 1500);
  };

  if (isSubmitted) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-md">
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <CheckCircle className="w-16 h-16 text-green-500 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Hearing Screening Completed!</h3>
            <p className="text-gray-600">Your screening has been saved successfully.</p>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto rounded-sm">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">
            {title}
          </DialogTitle>
        </DialogHeader>
        
        <MultiStepHearingScreeningForm
          onSubmit={handleSubmit}
          onCancel={onClose}
          existingStudent={existingStudent}
        />
      </DialogContent>
    </Dialog>
  );
};

export default HearingScreeningModal;
