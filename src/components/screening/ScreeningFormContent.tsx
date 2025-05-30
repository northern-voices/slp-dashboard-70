
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Save, Send } from 'lucide-react';
import { Database } from '@/types/supabase';
import StudentSelectionSection from './StudentSelectionSection';
import ScreeningDetailsSection from './ScreeningDetailsSection';
import NotesRecommendationsSection from './NotesRecommendationsSection';
import SpeechScreeningFields from './SpeechScreeningFields';
import HearingScreeningFields from './HearingScreeningFields';
import ProgressScreeningFields from './ProgressScreeningFields';

type Student = Database['public']['Tables']['students']['Row'];

interface ScreeningFormContentProps {
  onSubmit: (data: any) => void;
  existingStudent?: Student;
  formType?: 'speech' | 'hearing' | 'progress';
}

const ScreeningFormContent = ({
  onSubmit,
  existingStudent,
  formType = 'speech',
}: ScreeningFormContentProps) => {
  const [createNewStudent, setCreateNewStudent] = useState(!existingStudent);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(existingStudent || null);
  const [currentFormType, setCurrentFormType] = useState(formType);
  
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
      screening_data: {},
      notes: '',
      recommendations: '',
    }
  });

  const handleStudentSelect = (student: Student | null) => {
    setSelectedStudent(student);
    if (student) {
      setCreateNewStudent(false);
      // Update form with student data
      form.reset({
        first_name: student.first_name,
        last_name: student.last_name,
        date_of_birth: student.date_of_birth,
        student_id: student.student_id,
        grade: student.grade || '',
        gender: student.gender || '',
        emergency_contact_name: student.emergency_contact_name || '',
        emergency_contact_phone: student.emergency_contact_phone || '',
        screening_data: {},
        notes: '',
        recommendations: '',
      });
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
      screening_data: {},
      notes: '',
      recommendations: '',
    });
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
      {/* Student Selection */}
      <StudentSelectionSection
        form={form}
        createNewStudent={createNewStudent}
        selectedStudent={selectedStudent}
        onStudentSelect={handleStudentSelect}
        onCreateNewStudent={handleCreateNewStudent}
      />

      {/* Screening Details */}
      <ScreeningDetailsSection
        form={form}
        currentFormType={currentFormType}
        setCurrentFormType={setCurrentFormType}
      />

      {/* Form Type Specific Fields */}
      <Tabs value={currentFormType} onValueChange={(value) => setCurrentFormType(value as any)}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="speech">Speech Screening</TabsTrigger>
          <TabsTrigger value="hearing">Hearing Screening</TabsTrigger>
          <TabsTrigger value="progress">Progress Review</TabsTrigger>
        </TabsList>
        
        <TabsContent value="speech">
          <SpeechScreeningFields form={form} />
        </TabsContent>
        
        <TabsContent value="hearing">
          <HearingScreeningFields form={form} />
        </TabsContent>
        
        <TabsContent value="progress">
          <ProgressScreeningFields form={form} />
        </TabsContent>
      </Tabs>

      {/* General Notes and Recommendations */}
      <NotesRecommendationsSection form={form} />

      <div className="flex justify-end gap-2 pt-4 border-t">
        <Button type="button" variant="outline" className="flex items-center gap-2">
          <Save className="w-4 h-4" />
          Save Draft
        </Button>
        <Button type="submit" className="flex items-center gap-2">
          <Send className="w-4 h-4" />
          Submit Screening
        </Button>
      </div>
    </form>
  );
};

export default ScreeningFormContent;
