
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Student } from '@/types/database';
import { ScreeningFormData } from '@/types/screening';
import StudentSelectionSection from '../shared/StudentSelectionSection';
import HearingScreeningFields from '../HearingScreeningFields';
import NotesRecommendationsSection from '../shared/NotesRecommendationsSection';

interface HearingScreeningFormProps {
  onSubmit: (data: ScreeningFormData) => void;
  onCancel: () => void;
  existingStudent?: Student | null;
}

const HearingScreeningForm = ({ onSubmit, onCancel, existingStudent }: HearingScreeningFormProps) => {
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(existingStudent || null);
  const [createNewStudent, setCreateNewStudent] = useState(false);
  
  const form = useForm({
    defaultValues: {
      screening_type: 'initial' as const,
      screening_date: new Date().toISOString().split('T')[0],
      // Hearing specific fields
      right_ear_250: '',
      right_ear_500: '',
      right_ear_1000: '',
      right_ear_2000: '',
      right_ear_4000: '',
      left_ear_250: '',
      left_ear_500: '',
      left_ear_1000: '',
      left_ear_2000: '',
      left_ear_4000: '',
      tympanometry_results: '',
      hearing_observations: '',
      general_notes: '',
      recommendations: '',
      follow_up_required: false,
      follow_up_date: ''
    }
  });

  const handleSubmit = (data: any) => {
    console.log('Hearing screening submitted:', data);
    
    const screeningData: ScreeningFormData = {
      screening_type: data.screening_type,
      student_id: selectedStudent?.id || '',
      screening_date: data.screening_date,
      form_type: 'hearing',
      hearing_data: {
        pure_tone_results: {
          right_ear: {
            '250': parseFloat(data.right_ear_250) || 0,
            '500': parseFloat(data.right_ear_500) || 0,
            '1000': parseFloat(data.right_ear_1000) || 0,
            '2000': parseFloat(data.right_ear_2000) || 0,
            '4000': parseFloat(data.right_ear_4000) || 0,
          },
          left_ear: {
            '250': parseFloat(data.left_ear_250) || 0,
            '500': parseFloat(data.left_ear_500) || 0,
            '1000': parseFloat(data.left_ear_1000) || 0,
            '2000': parseFloat(data.left_ear_2000) || 0,
            '4000': parseFloat(data.left_ear_4000) || 0,
          }
        },
        tympanometry_results: data.tympanometry_results || '',
        observations: data.hearing_observations || ''
      },
      general_notes: data.general_notes || '',
      recommendations: data.recommendations || '',
      follow_up_required: data.follow_up_required || false,
      follow_up_date: data.follow_up_date
    };

    onSubmit(screeningData);
  };

  return (
    <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
      <StudentSelectionSection
        selectedStudent={selectedStudent}
        onStudentSelect={setSelectedStudent}
        form={form}
        createNewStudent={createNewStudent}
        onCreateNewStudent={() => setCreateNewStudent(true)}
      />
      
      <HearingScreeningFields form={form} />
      
      <NotesRecommendationsSection form={form} />
      
      <div className="flex justify-end space-x-4 pt-6 border-t">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={!selectedStudent}>
          Submit Screening
        </Button>
      </div>
    </form>
  );
};

export default HearingScreeningForm;
