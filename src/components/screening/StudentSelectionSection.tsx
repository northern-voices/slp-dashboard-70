import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, User } from 'lucide-react';
import type { Database } from '@/integrations/supabase/types';
import StudentSearchSelector from './StudentSearchSelector';

type Student = Database['public']['Tables']['students']['Row'];

interface StudentSelectionSectionProps {
  form: UseFormReturn<any>;
  createNewStudent: boolean;
  selectedStudent: Student | null;
  onStudentSelect: (student: Student | null) => void;
  onCreateNewStudent: () => void;
}

const StudentSelectionSection = ({
  form,
  createNewStudent,
  selectedStudent,
  onStudentSelect,
  onCreateNewStudent,
}: StudentSelectionSectionProps) => {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Student Information</h3>
        {!createNewStudent && (
          <Button 
            type="button" 
            variant="outline" 
            size="sm"
            onClick={onCreateNewStudent}
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
          onStudentSelect={onStudentSelect}
        />
      )}
    </div>
  );
};

export default StudentSelectionSection;
