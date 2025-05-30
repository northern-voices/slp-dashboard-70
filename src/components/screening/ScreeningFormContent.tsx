import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Save, Send } from 'lucide-react';
import type { Database } from '@/integrations/supabase/types';
import StudentSelectionSection from './StudentSelectionSection';
import ScreeningDetailsSection from './ScreeningDetailsSection';
import NotesRecommendationsSection from './NotesRecommendationsSection';
import SpeechScreeningFields from './SpeechScreeningFields';
import HearingScreeningFields from './HearingScreeningFields';
import ProgressScreeningFields from './ProgressScreeningFields';

type Student = Database['public']['Tables']['students']['Row'];

interface ScreeningFormContentProps {
  form: UseFormReturn<any>;
  onSubmit: (data: any) => void;
  onClose: () => void;
  createNewStudent: boolean;
  selectedStudent: Student | null;
  currentFormType: string;
  setCurrentFormType: (type: 'speech' | 'hearing' | 'progress') => void;
  onStudentSelect: (student: Student | null) => void;
  onCreateNewStudent: () => void;
}

const ScreeningFormContent = ({
  form,
  onSubmit,
  onClose,
  createNewStudent,
  selectedStudent,
  currentFormType,
  setCurrentFormType,
  onStudentSelect,
  onCreateNewStudent,
}: ScreeningFormContentProps) => {
  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
      {/* Student Selection */}
      <StudentSelectionSection
        form={form}
        createNewStudent={createNewStudent}
        selectedStudent={selectedStudent}
        onStudentSelect={onStudentSelect}
        onCreateNewStudent={onCreateNewStudent}
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
        <Button type="button" variant="outline" onClick={onClose}>
          Cancel
        </Button>
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
