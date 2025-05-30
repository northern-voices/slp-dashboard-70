
import React, { useState } from 'react';
import { ScreeningFormData } from '@/types/screening';
import { Student } from '@/types/database';
import ScreeningFormModal from './ScreeningFormModal';

interface ScreeningFormContainerProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: ScreeningFormData) => void;
  existingStudent?: Student | null;
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
