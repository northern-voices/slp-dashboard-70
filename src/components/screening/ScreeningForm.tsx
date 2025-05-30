
import React from 'react';
import { ScreeningFormData } from '@/types/screening';
import { Student } from '@/types/database';
import ScreeningFormContainer from './ScreeningFormContainer';

interface ScreeningFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: ScreeningFormData) => void;
  existingStudent?: Student;
  formType?: 'speech' | 'hearing' | 'progress';
  title?: string;
}

const ScreeningForm = (props: ScreeningFormProps) => {
  return <ScreeningFormContainer {...props} />;
};

export default ScreeningForm;
