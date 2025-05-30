import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { CheckCircle } from 'lucide-react';
import { ScreeningFormData } from '@/types/screening';
import { Database } from '@/types/supabase';
import ScreeningFormContent from './ScreeningFormContent';
import ScreeningFormModal from './ScreeningFormModal';

type Student = Database['public']['Tables']['students']['Row'];

interface ScreeningFormContainerProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: ScreeningFormData) => void;
  existingStudent?: Student;
  formType?: 'speech' | 'hearing' | 'progress';
  title?: string;
}

const ScreeningFormContainer: React.FC<ScreeningFormContainerProps> = ({
  isOpen,
  onClose,
  onSubmit,
  existingStudent,
  formType,
  title,
}) => {
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = (data: ScreeningFormData) => {
    onSubmit(data);
    setIsSubmitted(true);
    setTimeout(() => {
      setIsSubmitted(false);
      onClose();
    }, 1500);
  };

  return (
    <ScreeningFormModal
      isOpen={isOpen}
      onClose={onClose}
      onSubmit={handleSubmit}
      existingStudent={existingStudent}
      formType={formType}
      title={title}
    />
  );
};

export default ScreeningFormContainer;
