
import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar } from 'lucide-react';
import { Student } from '@/types/database';
import ScreeningFormContent from './ScreeningFormContent';

interface ScreeningFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  form: UseFormReturn<any>;
  onSubmit: (data: any) => void;
  createNewStudent: boolean;
  selectedStudent: Student | null;
  currentFormType: string;
  setCurrentFormType: (type: 'speech' | 'hearing' | 'progress') => void;
  onStudentSelect: (student: Student | null) => void;
  onCreateNewStudent: () => void;
}

const ScreeningFormModal = ({
  isOpen,
  onClose,
  title,
  form,
  onSubmit,
  createNewStudent,
  selectedStudent,
  currentFormType,
  setCurrentFormType,
  onStudentSelect,
  onCreateNewStudent,
}: ScreeningFormModalProps) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="w-5 h-5" />
                  {title}
                </CardTitle>
                <p className="text-sm text-gray-600 mt-1">
                  Complete the screening form with observations and results
                </p>
              </div>
              <Button variant="ghost" onClick={onClose}>×</Button>
            </div>
          </CardHeader>
          <CardContent>
            <ScreeningFormContent
              form={form}
              onSubmit={onSubmit}
              onClose={onClose}
              createNewStudent={createNewStudent}
              selectedStudent={selectedStudent}
              currentFormType={currentFormType}
              setCurrentFormType={setCurrentFormType}
              onStudentSelect={onStudentSelect}
              onCreateNewStudent={onCreateNewStudent}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ScreeningFormModal;
