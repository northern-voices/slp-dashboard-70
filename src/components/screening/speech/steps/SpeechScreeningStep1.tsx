
import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { User } from 'lucide-react';
import StudentSearchSelector from '../../StudentSearchSelector';
import { Student } from '@/types/database';

interface SpeechScreeningStep1Props {
  form: UseFormReturn<any>;
  selectedStudent: Student | null;
  selectedGrade: string;
  onStudentSelect: (student: Student | null) => void;
  onGradeChange: (grade: string) => void;
}

const gradeOptions = [
  'Pre-K', 'K', '1st', '2nd', '3rd', '4th', '5th', '6th', '7th', '8th', '9th', '10th', '11th', '12th'
];

const SpeechScreeningStep1 = ({
  form,
  selectedStudent,
  selectedGrade,
  onStudentSelect,
  onGradeChange,
}: SpeechScreeningStep1Props) => {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="w-5 h-5" />
            Student Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="grade">Grade *</Label>
            <Select value={selectedGrade} onValueChange={onGradeChange}>
              <SelectTrigger>
                <SelectValue placeholder="Select grade" />
              </SelectTrigger>
              <SelectContent>
                {gradeOptions.map(grade => (
                  <SelectItem key={grade} value={grade}>
                    {grade}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {selectedGrade && (
            <div>
              <Label>Select Student *</Label>
              <div className="mt-2">
                <StudentSearchSelector
                  selectedStudent={selectedStudent}
                  onStudentSelect={onStudentSelect}
                  gradeFilter={selectedGrade}
                />
              </div>
            </div>
          )}

          {selectedStudent && (
            <div className="mt-4 p-4 bg-blue-50 rounded-lg">
              <h4 className="font-medium text-blue-900">Selected Student</h4>
              <p className="text-blue-700">
                {selectedStudent.first_name} {selectedStudent.last_name} - Grade {selectedStudent.grade}
              </p>
              <p className="text-sm text-blue-600">
                Student ID: {selectedStudent.student_id}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default SpeechScreeningStep1;
