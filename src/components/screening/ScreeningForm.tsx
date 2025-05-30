import React from 'react';
import { ScreeningFormData } from '@/types/screening';
import type { Database } from '@/integrations/supabase/types';
import ScreeningFormContainer from './ScreeningFormContainer';

type Student = Database['public']['Tables']['students']['Row'];

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
