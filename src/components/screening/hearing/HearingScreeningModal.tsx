
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import HearingScreeningForm from './HearingScreeningForm';
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
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">
            {title}
          </DialogTitle>
        </DialogHeader>
        
        <HearingScreeningForm
          onSubmit={onSubmit}
          onCancel={onClose}
          existingStudent={existingStudent}
        />
      </DialogContent>
    </Dialog>
  );
};

export default HearingScreeningModal;
