import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ScreeningFormData } from '@/types/screening';
import type { Database } from '@/integrations/supabase/types';
import { useToast } from '@/hooks/use-toast';
import { createScreeningFormSchema } from '@/types/screening-form';
import ScreeningFormModal from './ScreeningFormModal';

interface ScreeningFormContainerProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: ScreeningFormData) => void;
  existingStudent?: Student;
  formType?: 'speech' | 'hearing' | 'progress';
  title?: string;
}

const ScreeningFormContainer = ({ 
  isOpen, 
  onClose, 
  onSubmit, 
  existingStudent, 
  formType = 'speech',
  title = 'New Screening'
}: ScreeningFormContainerProps) => {
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(existingStudent || null);
  const [createNewStudent, setCreateNewStudent] = useState(!existingStudent);
  const [currentFormType, setCurrentFormType] = useState(formType);
  const { toast } = useToast();

  const currentSchema = createScreeningFormSchema(createNewStudent);

  const form = useForm({
    resolver: zodResolver(currentSchema),
    defaultValues: {
      screening_type: 'initial' as const,
      screening_date: new Date().toISOString().split('T')[0],
      form_type: currentFormType,
      general_notes: '',
      recommendations: '',
      follow_up_required: false,
      follow_up_date: '',
      ...(createNewStudent ? {
        student_info: {
          first_name: '',
          last_name: '',
          date_of_birth: '',
          grade: '',
        }
      } : {
        student_id: selectedStudent?.id || '',
      }),
    },
  });

  useEffect(() => {
    form.reset({
      screening_type: 'initial' as const,
      screening_date: new Date().toISOString().split('T')[0],
      form_type: currentFormType,
      general_notes: '',
      recommendations: '',
      follow_up_required: false,
      follow_up_date: '',
      ...(createNewStudent ? {
        student_info: {
          first_name: '',
          last_name: '',
          date_of_birth: '',
          grade: '',
        }
      } : {
        student_id: selectedStudent?.id || '',
      }),
    });
  }, [createNewStudent, selectedStudent?.id, currentFormType, form]);

  useEffect(() => {
    if (existingStudent) {
      setSelectedStudent(existingStudent);
      setCreateNewStudent(false);
    }
  }, [existingStudent]);

  const handleSubmit = (data: any) => {
    const formData: ScreeningFormData = {
      ...data,
      form_type: currentFormType,
    };

    if (createNewStudent && data.student_info) {
      formData.student_info = {
        first_name: data.student_info.first_name || '',
        last_name: data.student_info.last_name || '',
        date_of_birth: data.student_info.date_of_birth || '',
        grade: data.student_info.grade,
        gender: data.student_info.gender,
        emergency_contact_name: data.student_info.emergency_contact_name,
        emergency_contact_phone: data.student_info.emergency_contact_phone,
      };
    } else if (selectedStudent && data.student_id) {
      formData.student_id = data.student_id;
    }

    onSubmit(formData);
    onClose();
    toast({
      title: "Screening submitted",
      description: "The screening has been recorded successfully.",
    });
  };

  const handleStudentSelect = (student: Student | null) => {
    setSelectedStudent(student);
    if (student) {
      setCreateNewStudent(false);
    }
  };

  const handleCreateNewStudent = () => {
    setCreateNewStudent(true);
    setSelectedStudent(null);
  };

  if (!isOpen) return null;

  return (
    <ScreeningFormModal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      form={form}
      onSubmit={handleSubmit}
      createNewStudent={createNewStudent}
      selectedStudent={selectedStudent}
      currentFormType={currentFormType}
      setCurrentFormType={setCurrentFormType}
      onStudentSelect={handleStudentSelect}
      onCreateNewStudent={handleCreateNewStudent}
    />
  );
};

export default ScreeningFormContainer;
