
import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { User } from 'lucide-react';
import { Student } from '@/types/database';
import StudentSearchSelector from '../../StudentSearchSelector';

interface SpeechScreeningStep1Props {
  form: UseFormReturn<any>;
  selectedStudent: Student | null;
  selectedGrade: string;
  onStudentSelect: (student: Student | null) => void;
  onGradeChange: (grade: string) => void;
}

const SpeechScreeningStep1 = ({
  form,
  selectedStudent,
  selectedGrade,
  onStudentSelect,
  onGradeChange
}: SpeechScreeningStep1Props) => {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 mb-6">
        <div className="w-8 h-8 rounded-full border-2 border-primary text-primary flex items-center justify-center">
          <User className="w-4 h-4" />
        </div>
        <h2 className="text-xl font-semibold">Student Information</h2>
      </div>

      <div className="space-y-6">
        <div className="space-y-3">
          <Label htmlFor="grade" className="text-base font-medium">
            Grade <span className="text-red-500">*</span>
          </Label>
          <Select value={selectedGrade} onValueChange={onGradeChange}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select grade" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="PK">Pre-K</SelectItem>
              <SelectItem value="K">Kindergarten</SelectItem>
              <SelectItem value="1">1st Grade</SelectItem>
              <SelectItem value="2">2nd Grade</SelectItem>
              <SelectItem value="3">3rd Grade</SelectItem>
              <SelectItem value="4">4th Grade</SelectItem>
              <SelectItem value="5">5th Grade</SelectItem>
              <SelectItem value="6">6th Grade</SelectItem>
              <SelectItem value="7">7th Grade</SelectItem>
              <SelectItem value="8">8th Grade</SelectItem>
              <SelectItem value="9">9th Grade</SelectItem>
              <SelectItem value="10">10th Grade</SelectItem>
              <SelectItem value="11">11th Grade</SelectItem>
              <SelectItem value="12">12th Grade</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {selectedGrade && (
          <div className="space-y-3">
            <Label className="text-base font-medium">
              Select Student <span className="text-red-500">*</span>
            </Label>
            <StudentSearchSelector
              onStudentSelect={onStudentSelect}
              selectedStudent={selectedStudent}
              gradeFilter={selectedGrade}
            />
          </div>
        )}

        {selectedStudent && (
          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h3 className="font-medium text-blue-900 mb-2">Selected Student</h3>
            <div className="text-sm text-blue-800 space-y-1">
              <p><strong>Name:</strong> {selectedStudent.first_name} {selectedStudent.last_name}</p>
              <p><strong>Student ID:</strong> {selectedStudent.student_id}</p>
              <p><strong>Grade:</strong> {selectedStudent.grade}</p>
              {selectedStudent.date_of_birth && (
                <p><strong>Date of Birth:</strong> {new Date(selectedStudent.date_of_birth).toLocaleDateString()}</p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SpeechScreeningStep1;
