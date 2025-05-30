
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Save, Send } from 'lucide-react';
import { Student } from '@/types/database';
import StudentSelectionSection from '../shared/StudentSelectionSection';
import NotesRecommendationsSection from '../shared/NotesRecommendationsSection';
import HearingScreeningFields from '../HearingScreeningFields';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface HearingScreeningFormProps {
  onSubmit: (data: any) => void;
  existingStudent?: Student | null;
}

const HearingScreeningForm = ({
  onSubmit,
  existingStudent,
}: HearingScreeningFormProps) => {
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
      screening_type: 'initial',
      screening_date: new Date().toISOString().split('T')[0],
      general_notes: '',
      recommendations: '',
      follow_up_required: false,
    }
  });

  const handleStudentSelect = (student: Student | null) => {
    setSelectedStudent(student);
    if (student) {
      setCreateNewStudent(false);
      form.reset({
        first_name: student.first_name,
        last_name: student.last_name,
        date_of_birth: student.date_of_birth,
        student_id: student.student_id,
        grade: student.grade || '',
        gender: student.gender || '',
        emergency_contact_name: student.emergency_contact_name || '',
        emergency_contact_phone: student.emergency_contact_phone || '',
        screening_type: 'initial',
        screening_date: new Date().toISOString().split('T')[0],
        general_notes: '',
        recommendations: '',
        follow_up_required: false,
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
      screening_type: 'initial',
      screening_date: new Date().toISOString().split('T')[0],
      general_notes: '',
      recommendations: '',
      follow_up_required: false,
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
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
      </div>

      {/* Hearing Screening Fields */}
      <HearingScreeningFields form={form} />

      {/* General Notes and Recommendations */}
      <NotesRecommendationsSection form={form} />

      <div className="flex justify-end gap-2 pt-4 border-t">
        <Button type="button" variant="outline" className="flex items-center gap-2">
          <Save className="w-4 h-4" />
          Save Draft
        </Button>
        <Button type="submit" className="flex items-center gap-2">
          <Send className="w-4 h-4" />
          Submit Hearing Screening
        </Button>
      </div>
    </form>
  );
};

export default HearingScreeningForm;
