
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Volume2 } from 'lucide-react';
import StudentSelectionSection from '../shared/StudentSelectionSection';
import NotesRecommendationsSection from '../shared/NotesRecommendationsSection';
import HearingScreeningFields from '../HearingScreeningFields';
import { Student } from '@/types/database';
import { ScreeningFormData } from '@/types/screening';

interface HearingScreeningFormProps {
  onSubmit: (data: ScreeningFormData) => void;
  onCancel: () => void;
  existingStudent?: Student | null;
}

const HearingScreeningForm = ({
  onSubmit,
  onCancel,
  existingStudent
}: HearingScreeningFormProps) => {
  const [createNewStudent, setCreateNewStudent] = useState(!existingStudent);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(existingStudent || null);

  const form = useForm({
    defaultValues: {
      screening_type: 'initial' as const,
      screening_date: new Date().toISOString().split('T')[0],
      first_name: existingStudent?.first_name || '',
      last_name: existingStudent?.last_name || '',
      date_of_birth: existingStudent?.date_of_birth || '',
      grade: existingStudent?.grade || '',
      gender: existingStudent?.gender || '',
      emergency_contact_name: existingStudent?.emergency_contact_name || '',
      emergency_contact_phone: existingStudent?.emergency_contact_phone || '',
      notes: '',
      recommendations: '',
      follow_up_required: false,
      follow_up_date: ''
    }
  });

  const handleCreateNewStudent = () => {
    setCreateNewStudent(true);
    setSelectedStudent(null);
  };

  const handleStudentSelect = (student: Student | null) => {
    setSelectedStudent(student);
    setCreateNewStudent(false);
    
    if (student) {
      form.setValue('first_name', student.first_name);
      form.setValue('last_name', student.last_name);
      form.setValue('date_of_birth', student.date_of_birth);
      form.setValue('grade', student.grade || '');
      form.setValue('gender', student.gender || '');
      form.setValue('emergency_contact_name', student.emergency_contact_name || '');
      form.setValue('emergency_contact_phone', student.emergency_contact_phone || '');
    }
  };

  const handleFormSubmit = (data: any) => {
    const formData: ScreeningFormData = {
      screening_type: data.screening_type,
      screening_date: data.screening_date,
      form_type: 'hearing',
      student_id: selectedStudent?.id,
      student_info: createNewStudent ? {
        first_name: data.first_name,
        last_name: data.last_name,
        date_of_birth: data.date_of_birth,
        grade: data.grade,
        gender: data.gender,
        emergency_contact_name: data.emergency_contact_name,
        emergency_contact_phone: data.emergency_contact_phone
      } : undefined,
      hearing_data: {
        pure_tone_results: {
          right_ear: {},
          left_ear: {}
        },
        tympanometry_results: '',
        observations: ''
      },
      general_notes: data.notes,
      recommendations: data.recommendations,
      follow_up_required: data.follow_up_required,
      follow_up_date: data.follow_up_date
    };

    onSubmit(formData);
  };

  return (
    <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-6">
      {/* Header */}
      <Card className="bg-gradient-to-r from-teal-50 to-blue-50 border-teal-200">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center space-x-3 text-teal-800">
            <div className="w-10 h-10 bg-teal-600 rounded-lg flex items-center justify-center">
              <Volume2 className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-semibold">Hearing Screening</h2>
              <p className="text-sm text-teal-600 font-normal">
                Assess auditory processing and hearing capabilities
              </p>
            </div>
          </CardTitle>
        </CardHeader>
      </Card>

      {/* Student Selection */}
      <StudentSelectionSection
        form={form}
        createNewStudent={createNewStudent}
        selectedStudent={selectedStudent}
        onStudentSelect={handleStudentSelect}
        onCreateNewStudent={handleCreateNewStudent}
      />

      {/* Hearing Screening Fields */}
      <HearingScreeningFields form={form} />

      {/* Notes and Recommendations */}
      <NotesRecommendationsSection form={form} />

      {/* Action Buttons */}
      <div className="flex justify-end space-x-3 pt-6 border-t">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" className="bg-teal-600 hover:bg-teal-700">
          Complete Hearing Screening
        </Button>
      </div>
    </form>
  );
};

export default HearingScreeningForm;
