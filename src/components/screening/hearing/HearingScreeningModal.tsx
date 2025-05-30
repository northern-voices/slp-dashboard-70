
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { CheckCircle } from 'lucide-react';
import { ScreeningFormData } from '@/types/screening';
import { Student } from '@/types/database';
import HearingScreeningForm from './HearingScreeningForm';

interface HearingScreeningModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: ScreeningFormData) => void;
  existingStudent?: Student | null;
  title?: string;
}

const HearingScreeningModal: React.FC<HearingScreeningModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  existingStudent,
  title = 'Hearing Screening',
}) => {
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = (formData: any) => {
    console.log('Hearing screening submitted:', formData);
    
    // Create hearing screening data
    const screeningData: ScreeningFormData = {
      screening_type: formData.screening_type || 'initial',
      student_id: existingStudent?.id || '',
      student_info: existingStudent ? undefined : {
        first_name: formData.first_name || '',
        last_name: formData.last_name || '',
        date_of_birth: formData.date_of_birth || new Date().toISOString().split('T')[0],
        grade: formData.grade,
        gender: formData.gender,
        emergency_contact_name: formData.emergency_contact_name,
        emergency_contact_phone: formData.emergency_contact_phone
      },
      screening_date: formData.screening_date || new Date().toISOString().split('T')[0],
      form_type: 'hearing',
      hearing_data: {
        pure_tone_results: {
          right_ear: formData.right_ear || {},
          left_ear: formData.left_ear || {}
        },
        tympanometry_results: formData.tympanometry_results || '',
        observations: formData.observations || ''
      },
      general_notes: formData.general_notes || '',
      recommendations: formData.recommendations || '',
      follow_up_required: formData.follow_up_required || false,
      follow_up_date: formData.follow_up_date
    };

    onSubmit(screeningData);
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
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <HearingScreeningForm 
          onSubmit={handleSubmit} 
          existingStudent={existingStudent}
        />
      </DialogContent>
    </Dialog>
  );
};

export default HearingScreeningModal;
