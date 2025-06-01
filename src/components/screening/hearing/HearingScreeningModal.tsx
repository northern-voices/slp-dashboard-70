
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import MultiStepHearingScreeningForm from './MultiStepHearingScreeningForm';
import { Student } from '@/types/database';
import { ScreeningFormData } from '@/types/screening';

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
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">
            {title}
          </DialogTitle>
        </DialogHeader>
        
        <MultiStepHearingScreeningForm
          onSubmit={onSubmit}
          onCancel={onClose}
          existingStudent={existingStudent}
        />
      </DialogContent>
    </Dialog>
  );
};

export default HearingScreeningModal;
