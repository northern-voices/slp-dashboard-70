
import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar, Save, Send, User, Plus } from 'lucide-react';
import { ScreeningFormData } from '@/types/screening';
import { Student } from '@/types/database';
import { useToast } from '@/hooks/use-toast';
import StudentSearchSelector from './StudentSearchSelector';
import SpeechScreeningFields from './SpeechScreeningFields';
import HearingScreeningFields from './HearingScreeningFields';
import ProgressScreeningFields from './ProgressScreeningFields';

// Dynamic schema factory function
const createScreeningFormSchema = (isCreatingNewStudent: boolean) => {
  const baseSchema = {
    screening_type: z.enum(['initial', 'follow_up', 'annual', 'referral']),
    screening_date: z.string().min(1, 'Screening date is required'),
    form_type: z.enum(['speech', 'hearing', 'progress']),
    general_notes: z.string(),
    recommendations: z.string(),
    follow_up_required: z.boolean(),
    follow_up_date: z.string().optional(),
  };

  if (isCreatingNewStudent) {
    return z.object({
      ...baseSchema,
      student_id: z.string().optional(),
      student_info: z.object({
        first_name: z.string().min(1, 'First name is required'),
        last_name: z.string().min(1, 'Last name is required'),
        date_of_birth: z.string().min(1, 'Date of birth is required'),
        grade: z.string().optional(),
        gender: z.enum(['male', 'female', 'other', 'prefer_not_to_say']).optional(),
        emergency_contact_name: z.string().optional(),
        emergency_contact_phone: z.string().optional(),
      }),
    });
  } else {
    return z.object({
      ...baseSchema,
      student_id: z.string().min(1, 'Student selection is required'),
      student_info: z.object({
        first_name: z.string().optional(),
        last_name: z.string().optional(),
        date_of_birth: z.string().optional(),
        grade: z.string().optional(),
        gender: z.enum(['male', 'female', 'other', 'prefer_not_to_say']).optional(),
        emergency_contact_name: z.string().optional(),
        emergency_contact_phone: z.string().optional(),
      }).optional(),
    });
  }
};

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

  const form = useForm({
    resolver: zodResolver(currentSchema),
    defaultValues: {
      screening_type: 'initial' as const,
      screening_date: new Date().toISOString().split('T')[0],
      form_type: currentFormType,
      general_notes: '',
      recommendations: '',
      follow_up_required: false,
    },
  });

  // Re-initialize form when switching between modes
  useEffect(() => {
    const newSchema = createScreeningFormSchema(createNewStudent);
    const newForm = useForm({
      resolver: zodResolver(newSchema),
      defaultValues: {
        screening_type: 'initial' as const,
        screening_date: new Date().toISOString().split('T')[0],
        form_type: currentFormType,
        general_notes: '',
        recommendations: '',
        follow_up_required: false,
        ...(createNewStudent ? {} : { student_id: selectedStudent?.id }),
      },
    });
    
    // Update the form instance
    Object.assign(form, newForm);
  }, [createNewStudent, selectedStudent?.id, currentFormType]);

  useEffect(() => {
    if (existingStudent) {
      setSelectedStudent(existingStudent);
      setCreateNewStudent(false);
      form.setValue('student_id', existingStudent.id);
    }
  }, [existingStudent, form]);

  const handleSubmit = (data: any) => {
    const formData: ScreeningFormData = {
      ...data,
      form_type: currentFormType,
    };

    if (createNewStudent && data.student_info) {
      formData.student_info = data.student_info;
    } else if (selectedStudent) {
      formData.student_id = selectedStudent.id;
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
      form.setValue('student_id', student.id);
      form.setValue('student_info', undefined);
    }
  };

  const handleCreateNewStudent = () => {
    setCreateNewStudent(true);
    setSelectedStudent(null);
    form.setValue('student_id', undefined);
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
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">Student Information</h3>
                  {!createNewStudent && (
                    <Button 
                      type="button" 
                      variant="outline" 
                      size="sm"
                      onClick={handleCreateNewStudent}
                      className="flex items-center gap-2"
                    >
                      <Plus className="w-4 h-4" />
                      Create New Student
                    </Button>
                  )}
                </div>

                {createNewStudent ? (
                  <Card className="p-4 bg-blue-50">
                    <div className="flex items-center gap-2 mb-4">
                      <User className="w-4 h-4 text-blue-600" />
                      <span className="text-sm font-medium text-blue-600">Creating New Student</span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="first_name">First Name *</Label>
                        <Input
                          {...form.register('student_info.first_name')}
                          placeholder="Enter first name"
                        />
                      </div>
                      <div>
                        <Label htmlFor="last_name">Last Name *</Label>
                        <Input
                          {...form.register('student_info.last_name')}
                          placeholder="Enter last name"
                        />
                      </div>
                      <div>
                        <Label htmlFor="date_of_birth">Date of Birth *</Label>
                        <Input
                          type="date"
                          {...form.register('student_info.date_of_birth')}
                        />
                      </div>
                      <div>
                        <Label htmlFor="grade">Grade</Label>
                        <Input
                          {...form.register('student_info.grade')}
                          placeholder="e.g., K, 1, 2"
                        />
                      </div>
                    </div>
                  </Card>
                ) : (
                  <StudentSearchSelector
                    selectedStudent={selectedStudent}
                    onStudentSelect={handleStudentSelect}
                  />
                )}
              </div>

              {/* Screening Details */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="screening_type">Screening Type</Label>
                  <select
                    {...form.register('screening_type')}
                    className="w-full p-2 border rounded-md"
                  >
                    <option value="initial">Initial</option>
                    <option value="follow_up">Follow-up</option>
                    <option value="annual">Annual</option>
                    <option value="referral">Referral</option>
                  </select>
                </div>
                <div>
                  <Label htmlFor="screening_date">Screening Date</Label>
                  <Input
                    type="date"
                    {...form.register('screening_date')}
                  />
                </div>
                <div>
                  <Label>Form Type</Label>
                  <div className="flex gap-2 mt-1">
                    {['speech', 'hearing', 'progress'].map((type) => (
                      <Badge
                        key={type}
                        variant={currentFormType === type ? 'default' : 'outline'}
                        className="cursor-pointer"
                        onClick={() => setCurrentFormType(type as any)}
                      >
                        {type.charAt(0).toUpperCase() + type.slice(1)}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>

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
              <div className="space-y-4">
                <div>
                  <Label htmlFor="general_notes">General Notes</Label>
                  <Textarea
                    {...form.register('general_notes')}
                    placeholder="Enter general observations and notes..."
                    rows={3}
                  />
                </div>
                <div>
                  <Label htmlFor="recommendations">Recommendations</Label>
                  <Textarea
                    {...form.register('recommendations')}
                    placeholder="Enter recommendations and next steps..."
                    rows={3}
                  />
                </div>
                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      {...form.register('follow_up_required')}
                    />
                    <span>Follow-up required</span>
                  </label>
                  {form.watch('follow_up_required') && (
                    <div>
                      <Label htmlFor="follow_up_date">Follow-up Date</Label>
                      <Input
                        type="date"
                        {...form.register('follow_up_date')}
                      />
                    </div>
                  )}
                </div>
              </div>

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
