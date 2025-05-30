
import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Mic } from 'lucide-react';
import { Student } from '@/types/database';
import StudentSelectionSection from '../../shared/StudentSelectionSection';

interface SpeechScreeningStep1Props {
  form: UseFormReturn<any>;
  createNewStudent: boolean;
  selectedStudent: Student | null;
  onStudentSelect: (student: Student | null) => void;
  onCreateNewStudent: () => void;
}

const SpeechScreeningStep1 = ({
  form,
  createNewStudent,
  selectedStudent,
  onStudentSelect,
  onCreateNewStudent,
}: SpeechScreeningStep1Props) => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center space-x-3 text-blue-800">
            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
              <Mic className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-semibold">Speech Screening - Step 1</h2>
              <p className="text-sm text-blue-600 font-normal">
                Student Information and Grade Selection
              </p>
            </div>
          </CardTitle>
        </CardHeader>
      </Card>

      {/* Student Selection */}
      <StudentSelectionSection
        form={form}
        createNewStudent={createNewStudent}
        selectedStudent={selectedStudent}
        onStudentSelect={onStudentSelect}
        onCreateNewStudent={onCreateNewStudent}
      />

      {/* Grade Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Grade Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="grade">Grade *</Label>
              <Select
                value={form.watch('grade')}
                onValueChange={(value) => form.setValue('grade', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select grade" />
                </SelectTrigger>
                <SelectContent>
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
            <div>
              <Label htmlFor="gender">Gender</Label>
              <Select
                value={form.watch('gender')}
                onValueChange={(value) => form.setValue('gender', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select gender" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="male">Male</SelectItem>
                  <SelectItem value="female">Female</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                  <SelectItem value="prefer_not_to_say">Prefer not to say</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SpeechScreeningStep1;
