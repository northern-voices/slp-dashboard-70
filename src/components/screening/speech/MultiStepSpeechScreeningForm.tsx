
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Save, ArrowRight, ArrowLeft } from 'lucide-react';
import { Student } from '@/types/database';
import { ScreeningFormData } from '@/types/screening';
import ProgressIndicator from '../shared/ProgressIndicator';
import SpeechScreeningStep1 from './steps/SpeechScreeningStep1';
import SpeechScreeningStep2 from './steps/SpeechScreeningStep2';
import SpeechScreeningStep3 from './steps/SpeechScreeningStep3';

interface MultiStepSpeechScreeningFormProps {
  onSubmit: (data: ScreeningFormData) => void;
  onCancel: () => void;
  existingStudent?: Student | null;
}

const MultiStepSpeechScreeningForm = ({
  onSubmit,
  onCancel,
  existingStudent,
}: MultiStepSpeechScreeningFormProps) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [createNewStudent, setCreateNewStudent] = useState(!existingStudent);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(existingStudent || null);
  
  const form = useForm({
    defaultValues: {
      // Student info fields
      first_name: existingStudent?.first_name || '',
      last_name: existingStudent?.last_name || '',
      date_of_birth: existingStudent?.date_of_birth || '',
      student_id: existingStudent?.student_id || '',
      grade: existingStudent?.grade || '',
      gender: existingStudent?.gender || '',
      emergency_contact_name: existingStudent?.emergency_contact_name || '',
      emergency_contact_phone: existingStudent?.emergency_contact_phone || '',
      // Screening fields
      screening_type: 'initial' as const,
      screening_date: new Date().toISOString().split('T')[0],
      // Speech screening specific fields
      sound_errors: [] as string[],
      articulation_notes: '',
      language_concerns: '',
      voice_quality: '',
      fluency_notes: '',
      overall_observations: '',
      speech_screen_result: '',
      vocabulary_support: false,
      suspected_cas: false,
      clinical_notes: '',
      general_notes: '',
      recommendations: '',
      follow_up_required: false,
      attendance: ''
    }
  });

  const stepLabels = ['Student Info', 'Screening Details', 'Results & Notes'];

  const handleNext = () => {
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSaveDraft = () => {
    console.log('Saving draft...', form.getValues());
    // TODO: Implement draft saving functionality
  };

  const handleStudentSelect = (student: Student | null) => {
    setSelectedStudent(student);
    if (student) {
      setCreateNewStudent(false);
      form.setValue('first_name', student.first_name);
      form.setValue('last_name', student.last_name);
      form.setValue('date_of_birth', student.date_of_birth);
      form.setValue('student_id', student.student_id);
      form.setValue('grade', student.grade || '');
      form.setValue('gender', student.gender || '');
      form.setValue('emergency_contact_name', student.emergency_contact_name || '');
      form.setValue('emergency_contact_phone', student.emergency_contact_phone || '');
    }
  };

  const handleCreateNewStudent = () => {
    setCreateNewStudent(true);
    setSelectedStudent(null);
    form.reset({
      first_name: '',
      last_name: '',
      date_of_birth: '',
      student_id: '',
      grade: '',
      gender: '',
      emergency_contact_name: '',
      emergency_contact_phone: '',
      screening_type: 'initial',
      screening_date: new Date().toISOString().split('T')[0],
      sound_errors: [],
      articulation_notes: '',
      language_concerns: '',
      voice_quality: '',
      fluency_notes: '',
      overall_observations: '',
      speech_screen_result: '',
      vocabulary_support: false,
      suspected_cas: false,
      clinical_notes: '',
      general_notes: '',
      recommendations: '',
      follow_up_required: false,
      attendance: ''
    });
  };

  const handleFinalSubmit = (data: any) => {
    const formData: ScreeningFormData = {
      screening_type: data.screening_type,
      screening_date: data.screening_date,
      form_type: 'speech',
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
      speech_data: {
        sound_errors: data.sound_errors || [],
        articulation_notes: data.articulation_notes || '',
        language_concerns: data.language_concerns || '',
        voice_quality: data.voice_quality || '',
        fluency_notes: data.fluency_notes || '',
        overall_observations: data.overall_observations || ''
      },
      general_notes: data.clinical_notes || '',
      recommendations: data.recommendations || '',
      follow_up_required: data.follow_up_required || false,
      follow_up_date: data.follow_up_date
    };

    onSubmit(formData);
  };

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <SpeechScreeningStep1
            form={form}
            createNewStudent={createNewStudent}
            selectedStudent={selectedStudent}
            onStudentSelect={handleStudentSelect}
            onCreateNewStudent={handleCreateNewStudent}
          />
        );
      case 2:
        return <SpeechScreeningStep2 form={form} />;
      case 3:
        return <SpeechScreeningStep3 form={form} />;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      <ProgressIndicator
        currentStep={currentStep}
        totalSteps={3}
        stepLabels={stepLabels}
      />

      <form className="space-y-6">
        {renderCurrentStep()}

        <div className="flex justify-between items-center pt-6 border-t">
          <div className="flex gap-2">
            {currentStep > 1 && (
              <Button type="button" variant="outline" onClick={handleBack}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
            )}
            <Button type="button" variant="outline" onClick={handleSaveDraft}>
              <Save className="w-4 h-4 mr-2" />
              Save Draft
            </Button>
          </div>

          <div className="flex gap-2">
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
            {currentStep < 3 ? (
              <Button type="button" onClick={handleNext}>
                Next
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            ) : (
              <Button type="button" onClick={form.handleSubmit(handleFinalSubmit)}>
                Submit Screening
              </Button>
            )}
          </div>
        </div>
      </form>
    </div>
  );
};

export default MultiStepSpeechScreeningForm;
