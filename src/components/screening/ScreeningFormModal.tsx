
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { CheckCircle } from 'lucide-react';
import { ScreeningFormData } from '@/types/screening';
import { Database } from '@/types/supabase';
import ScreeningFormContent from './ScreeningFormContent';

type Student = Database['public']['Tables']['students']['Row'];

interface ScreeningFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: ScreeningFormData) => void;
  existingStudent?: Student;
  formType?: 'speech' | 'hearing' | 'progress';
  title?: string;
}

const ScreeningFormModal: React.FC<ScreeningFormModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  existingStudent,
  formType = 'speech',
  title = 'New Screening',
}) => {
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = (formData: any) => {
    console.log('Screening form submitted:', formData);
    
    // Map formType to screening_type
    let screeningType: 'initial' | 'follow_up' | 'annual' | 'referral' = 'initial';
    if (formType === 'speech') screeningType = 'initial';
    if (formType === 'hearing') screeningType = 'follow_up';
    if (formType === 'progress') screeningType = 'annual';
    
    // Create screening data with all required properties
    const screeningData: ScreeningFormData = {
      screening_type: screeningType,
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
      form_type: formType,
      general_notes: formData.notes || '',
      recommendations: formData.recommendations || '',
      follow_up_required: false,
      follow_up_date: undefined
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
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Screening Completed!</h3>
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
        <ScreeningFormContent 
          onSubmit={handleSubmit} 
          existingStudent={existingStudent}
          formType={formType}
        />
      </DialogContent>
    </Dialog>
  );
};

export default ScreeningFormModal;
