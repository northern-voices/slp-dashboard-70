
import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar, Save, Send } from 'lucide-react';
import { ScreeningFormData } from '@/types/screening';
import { Student } from '@/types/database';
import { useToast } from '@/hooks/use-toast';
import { createScreeningFormSchema } from '@/types/screening-form';
import StudentSelectionSection from './StudentSelectionSection';
import ScreeningDetailsSection from './ScreeningDetailsSection';
import NotesRecommendationsSection from './NotesRecommendationsSection';
import SpeechScreeningFields from './SpeechScreeningFields';
import HearingScreeningFields from './HearingScreeningFields';
import ProgressScreeningFields from './ProgressScreeningFields';

interface ScreeningFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: ScreeningFormData) => void;
  existingStudent?: Student;
  formType?: 'speech' | 'hearing' | 'progress';
  title?: string;
}

const ScreeningForm = ({ 
  isOpen, 
  onClose, 
  onSubmit, 
  existingStudent, 
  formType = 'speech',
  title = 'New Screening'
}: ScreeningFormProps) => {
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(existingStudent || null);
  const [createNewStudent, setCreateNewStudent] = useState(!existingStudent);
  const [currentFormType, setCurrentFormType] = useState(formType);
  const { toast } = useToast();

  // Create the appropriate schema based on the current mode
  const currentSchema = createScreeningFormSchema(createNewStudent);
  type FormData = ReturnType<typeof createScreeningFormSchema> extends (args: any) => infer R ? R : never;

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

  // Re-initialize form when switching between modes
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
      // Ensure required fields are present when creating new student
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
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
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
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ScreeningForm;
